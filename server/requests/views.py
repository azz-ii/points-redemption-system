from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
import logging
from .models import RedemptionRequest, RedemptionRequestItem
from .serializers import (
    RedemptionRequestSerializer, 
    CreateRedemptionRequestSerializer,
    RedemptionRequestItemSerializer
)
from utils.email_service import (
    send_request_approved_email, 
    send_request_rejected_email,
    send_request_submitted_email
)
from users.models import UserProfile

# Configure logger for request operations
logger = logging.getLogger('email')


class RedemptionRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RedemptionRequestSerializer

    def get_queryset(self):
        """Filter requests based on user role and team"""
        from django.db.models import Q
        from teams.models import TeamMembership, Team
        
        user = self.request.user
        profile = getattr(user, 'profile', None)
        
        if not profile:
            # Super admin without profile sees all
            return RedemptionRequest.objects.all().prefetch_related('items', 'items__variant')
        
        # Admin - highest ranking employee, manages all teams
        if profile.position == 'Admin':
            return RedemptionRequest.objects.all().prefetch_related('items', 'items__variant')
        
        # Sales Agent - team-scoped access
        elif profile.position == 'Sales Agent':
            # Sales agents see only their team's requests
            membership = TeamMembership.objects.filter(user=user).first()
            if membership:
                # Show requests by team members OR for team's distributors
                return RedemptionRequest.objects.filter(
                    Q(requested_by__team_memberships__team=membership.team) |
                    Q(requested_for__team=membership.team)
                ).distinct().prefetch_related('items', 'items__variant')
            # If not in a team, only see own requests
            return RedemptionRequest.objects.filter(requested_by=user).prefetch_related('items', 'items__variant')
        
        # Approver - team-scoped access
        elif profile.position == 'Approver':
            # Approvers see only their managed team's requests
            managed_teams = Team.objects.filter(approver=user)
            if managed_teams.exists():
                return RedemptionRequest.objects.filter(
                    Q(requested_by__team_memberships__team__in=managed_teams) |
                    Q(requested_for__team__in=managed_teams)
                ).distinct().prefetch_related('items', 'items__variant')
            # If not managing any team, see no requests
            return RedemptionRequest.objects.none()
        
        # Administrative support positions - global access
        elif profile.position in ['Marketing', 'Reception', 'Executive Assistant']:
            return RedemptionRequest.objects.all().prefetch_related('items', 'items__variant')
        
        # Unspecified positions - no access
        else:
            return RedemptionRequest.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateRedemptionRequestSerializer
        return RedemptionRequestSerializer

    def create(self, request, *args, **kwargs):
        """Create a new redemption request and notify team approver"""
        from teams.models import TeamMembership
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the request
        redemption_request = serializer.save()
        
        # Get the team approver for notification
        user = request.user
        membership = TeamMembership.objects.filter(user=user).first()
        
        if membership and membership.team.approver:
            # Send notification to the team's approver
            team_approver = membership.team.approver
            if hasattr(team_approver, 'profile') and team_approver.profile.email:
                approver_email = team_approver.profile.email
                logger.info(f"New request #{redemption_request.id} created, sending notification to team approver...")
                email_sent = send_request_submitted_email(
                    request_obj=redemption_request,
                    distributor=redemption_request.requested_for,
                    approvers_emails=[approver_email]
                )
                
                if email_sent:
                    logger.info(f"✓ Submission notification sent to team approver for request #{redemption_request.id}")
                else:
                    logger.warning(f"⚠ Failed to send notification to team approver for request #{redemption_request.id}")
            else:
                logger.warning(f"⚠ Team approver has no email for request #{redemption_request.id}")
        else:
            # Fallback: notify all non-Sales Agent users if no team approver
            logger.warning(f"⚠ No team approver found, falling back to all approvers for request #{redemption_request.id}")
            approvers = UserProfile.objects.exclude(position='Sales Agent').exclude(email__isnull=True).exclude(email='')
            approvers_emails = list(approvers.values_list('email', flat=True))
            
            if approvers_emails:
                send_request_submitted_email(
                    request_obj=redemption_request,
                    distributor=redemption_request.requested_for,
                    approvers_emails=approvers_emails
                )
        
        # Return the created request with full details
        response_serializer = RedemptionRequestSerializer(redemption_request)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a redemption request and deduct points"""
        redemption_request = self.get_object()
        
        if redemption_request.status != 'PENDING':
            return Response(
                {'error': 'Only pending requests can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if sufficient points are available
        if redemption_request.points_deducted_from == 'SELF':
            # Check sales agent's points
            user_profile = redemption_request.requested_by.profile
            if user_profile.points < redemption_request.total_points:
                return Response(
                    {
                        'error': 'Insufficient points',
                        'detail': f'Sales agent has {user_profile.points} points but needs {redemption_request.total_points} points'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:  # DISTRIBUTOR
            # Check distributor's points
            distributor = redemption_request.requested_for
            if distributor.points < redemption_request.total_points:
                return Response(
                    {
                        'error': 'Insufficient points',
                        'detail': f'Distributor has {distributor.points} points but needs {redemption_request.total_points} points'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Use transaction to ensure atomicity
        try:
            with transaction.atomic():
                # Deduct points from the appropriate account
                if redemption_request.points_deducted_from == 'SELF':
                    user_profile = redemption_request.requested_by.profile
                    user_profile.points -= redemption_request.total_points
                    user_profile.save()
                else:  # DISTRIBUTOR
                    distributor = redemption_request.requested_for
                    distributor.points -= redemption_request.total_points
                    distributor.save()
                
                # Update request status
                redemption_request.status = 'APPROVED'
                redemption_request.reviewed_by = request.user
                redemption_request.date_reviewed = timezone.now()
                
                # Get remarks if provided
                if 'remarks' in request.data:
                    redemption_request.remarks = request.data['remarks']
                
                redemption_request.save()
                
                # Send approval email notification
                logger.info(f"Request #{redemption_request.id} approved, sending email notification...")
                email_sent = send_request_approved_email(
                    request_obj=redemption_request,
                    distributor=redemption_request.requested_for,
                    approved_by=request.user
                )
                
                if email_sent:
                    logger.info(f"✓ Approval email sent for request #{redemption_request.id}")
                else:
                    logger.warning(f"⚠ Failed to send approval email for request #{redemption_request.id}")
        
        except Exception as e:
            logger.error(f"Failed to process approval for request #{redemption_request.id}: {str(e)}")
            return Response(
                {'error': 'Failed to process approval', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        serializer = self.get_serializer(redemption_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a redemption request"""
        redemption_request = self.get_object()
        
        if redemption_request.status != 'PENDING':
            return Response(
                {'error': 'Only pending requests can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Rejection reason is required
        rejection_reason = request.data.get('rejection_reason')
        if not rejection_reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update request status
        redemption_request.status = 'REJECTED'
        redemption_request.reviewed_by = request.user
        redemption_request.date_reviewed = timezone.now()
        redemption_request.rejection_reason = rejection_reason
        
        # Get remarks if provided
        if 'remarks' in request.data:
            redemption_request.remarks = request.data['remarks']
        
        redemption_request.save()
        
        # Send rejection email notification
        logger.info(f"Request #{redemption_request.id} rejected, sending email notification...")
        email_sent = send_request_rejected_email(
            request_obj=redemption_request,
            distributor=redemption_request.requested_for,
            rejected_by=request.user
        )
        
        if email_sent:
            logger.info(f"✓ Rejection email sent for request #{redemption_request.id}")
        else:
            logger.warning(f"⚠ Failed to send rejection email for request #{redemption_request.id}")
        
        serializer = self.get_serializer(redemption_request)
        return Response(serializer.data)
