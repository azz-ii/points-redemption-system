from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.hashers import check_password
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
from distributers.models import Distributor

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
            # Super admin without profile sees only approved requests
            return RedemptionRequest.objects.filter(status='APPROVED').prefetch_related('items', 'items__variant')
        
        # Admin - highest ranking employee, manages all teams
        if profile.position == 'Admin':
            return RedemptionRequest.objects.filter(status='APPROVED').prefetch_related('items', 'items__variant')
        
        # Sales Agent - team-scoped access
        elif profile.position == 'Sales Agent':
            # Sales agents see only their team's requests
            membership = TeamMembership.objects.filter(user=user).first()
            if membership:
                # Show requests that belong to their team
                return RedemptionRequest.objects.filter(
                    team=membership.team
                ).distinct().prefetch_related('items', 'items__variant')
            # If not in a team, only see own requests
            return RedemptionRequest.objects.filter(requested_by=user).prefetch_related('items', 'items__variant')
        
        # Approver - team-scoped access
        elif profile.position == 'Approver':
            # Approvers see only their managed team's requests
            managed_teams = Team.objects.filter(approver=user)
            logger.info(f"🔍 [APPROVER DEBUG] User: {user.id} ({user.username})")
            logger.info(f"🔍 [APPROVER DEBUG] Managed teams count: {managed_teams.count()}")
            logger.info(f"🔍 [APPROVER DEBUG] Managed team IDs: {list(managed_teams.values_list('id', 'name'))}")
            
            if managed_teams.exists():
                from django.db.models import Q
                from teams.models import TeamMembership
                
                # Get all users in the managed teams
                team_member_ids = TeamMembership.objects.filter(
                    team__in=managed_teams
                ).values_list('user_id', flat=True)
                logger.info(f"🔍 [APPROVER DEBUG] Team member IDs: {list(team_member_ids)}")
                
                # Filter by team field OR by requesting user being in managed teams (fallback for NULL team)
                queryset = RedemptionRequest.objects.filter(
                    Q(team__in=managed_teams) | Q(team__isnull=True, requested_by_id__in=team_member_ids)
                ).distinct().prefetch_related('items', 'items__variant')
                
                logger.info(f"🔍 [APPROVER DEBUG] Total requests found: {queryset.count()}")
                logger.info(f"🔍 [APPROVER DEBUG] Request details: {list(queryset.values('id', 'team_id', 'requested_by_id', 'status'))}")
                
                return queryset
            # If not managing any team, see no requests
            logger.warning(f"⚠️ [APPROVER DEBUG] User {user.username} is not managing any teams!")
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
        from rest_framework.exceptions import ValidationError
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the sales agent's team at the time of request creation
        user = request.user
        membership = TeamMembership.objects.filter(user=user).first()
        
        logger.info(f"📝 [CREATE DEBUG] User: {user.id} ({user.username})")
        logger.info(f"📝 [CREATE DEBUG] Team membership: {membership}")
        if membership:
            logger.info(f"📝 [CREATE DEBUG] Team: {membership.team.id} ({membership.team.name})")
        
        # Validate that the user is in a team before creating the request
        if not membership:
            logger.error(f"❌ [CREATE DEBUG] User {user.username} has no team membership!")
            raise ValidationError({
                "detail": "You must be assigned to a team before creating a redemption request. Please contact your administrator."
            })
        
        # Create the request with team assignment (handled by serializer)
        redemption_request = serializer.save()
        
        logger.info(f"✅ [CREATE DEBUG] Request #{redemption_request.id} created with team_id={redemption_request.team_id}")
        
        # Get the team approver for notification
        if membership.team.approver:
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
        from teams.models import Team
        
        redemption_request = self.get_object()
        
        # Check if approver has permission for this request's team
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Only Approvers need team-based permission check
        if profile and profile.position == 'Approver':
            # Check if request belongs to a team managed by this approver
            if not redemption_request.team:
                return Response(
                    {'error': 'Permission denied: Request does not belong to any team'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if this approver manages the request's team
            if redemption_request.team.approver != user:
                return Response(
                    {'error': 'Permission denied: You can only approve requests from your team'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
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
        
        # Check if sufficient stock is available for all requested items
        insufficient_stock_items = []
        for item in redemption_request.items.all():
            variant = item.variant
            if variant.stock < item.quantity:
                insufficient_stock_items.append({
                    'item_code': variant.item_code,
                    'item_name': variant.catalogue_item.item_name,
                    'option': variant.option_description or 'N/A',
                    'available': variant.stock,
                    'requested': item.quantity
                })
        
        if insufficient_stock_items:
            return Response(
                {
                    'error': 'Insufficient stock',
                    'detail': 'Not enough stock available for the following items',
                    'items': insufficient_stock_items
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
                
                # Deduct stock from all requested items
                for item in redemption_request.items.all():
                    variant = item.variant
                    variant.stock -= item.quantity
                    variant.save()
                
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
        from teams.models import Team
        
        redemption_request = self.get_object()
        
        # Check if approver has permission for this request's team
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Only Approvers need team-based permission check
        if profile and profile.position == 'Approver':
            # Check if request belongs to a team managed by this approver
            if not redemption_request.team:
                return Response(
                    {'error': 'Permission denied: Request does not belong to any team'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if this approver manages the request's team
            if redemption_request.team.approver != user:
                return Response(
                    {'error': 'Permission denied: You can only reject requests from your team'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
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

    @action(detail=True, methods=['post'])
    def mark_as_processed(self, request, pk=None):
        """Mark an approved redemption request as processed (superadmin only)"""
        redemption_request = self.get_object()
        
        # Check if user is superadmin
        user = request.user
        profile = getattr(user, 'profile', None)
        
        if not profile or profile.position != 'Admin':
            return Response(
                {'error': 'Permission denied: Only superadmins can mark requests as processed'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if redemption_request.status != 'APPROVED':
            return Response(
                {'error': 'Only approved requests can be marked as processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if redemption_request.processing_status == 'CANCELLED':
            return Response(
                {'error': 'Cancelled requests cannot be processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update processing status
        redemption_request.processing_status = 'PROCESSED'
        redemption_request.processed_by = user
        redemption_request.date_processed = timezone.now()
        
        # Get remarks if provided
        if 'remarks' in request.data:
            redemption_request.remarks = request.data.get('remarks')
        
        redemption_request.save()
        
        logger.info(f"Request #{redemption_request.id} marked as processed by {user.username}")
        
        serializer = self.get_serializer(redemption_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel_request(self, request, pk=None):
        """Cancel an approved or processed redemption request (superadmin only)"""
        redemption_request = self.get_object()
        
        # Check if user is superadmin
        user = request.user
        profile = getattr(user, 'profile', None)
        
        if not profile or profile.position != 'Admin':
            return Response(
                {'error': 'Permission denied: Only superadmins can cancel requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if redemption_request.status != 'APPROVED':
            return Response(
                {'error': 'Only approved requests can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if redemption_request.processing_status == 'PROCESSED':
            return Response(
                {'error': 'Processed requests cannot be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if redemption_request.processing_status == 'CANCELLED':
            return Response(
                {'error': 'Request is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancellation reason is required
        cancellation_reason = request.data.get('cancellation_reason')
        if not cancellation_reason:
            return Response(
                {'error': 'Cancellation reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use transaction to ensure atomicity when refunding points and stock
        try:
            with transaction.atomic():
                # Refund points if the request was approved (points were deducted)
                if redemption_request.points_deducted_from == 'SELF':
                    user_profile = redemption_request.requested_by.profile
                    user_profile.points += redemption_request.total_points
                    user_profile.save()
                    logger.info(f"Refunded {redemption_request.total_points} points to sales agent {redemption_request.requested_by.username}")
                else:  # DISTRIBUTOR
                    distributor = redemption_request.requested_for
                    distributor.points += redemption_request.total_points
                    distributor.save()
                    logger.info(f"Refunded {redemption_request.total_points} points to distributor {distributor.name}")
                
                # Restore stock for all requested items
                for item in redemption_request.items.all():
                    variant = item.variant
                    variant.stock += item.quantity
                    variant.save()
                    logger.info(f"Restored {item.quantity} units of {variant.item_code} to stock")
                
                # Update processing status
                redemption_request.processing_status = 'CANCELLED'
                redemption_request.cancelled_by = user
                redemption_request.date_cancelled = timezone.now()
                redemption_request.rejection_reason = cancellation_reason
                
                # Get remarks if provided
                if 'remarks' in request.data:
                    redemption_request.remarks = request.data.get('remarks')
                
                redemption_request.save()
                
                logger.info(f"Request #{redemption_request.id} cancelled by {user.username}")
        
        except Exception as e:
            logger.error(f"Failed to cancel request #{redemption_request.id}: {str(e)}")
            return Response(
                {'error': 'Failed to cancel request', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        serializer = self.get_serializer(redemption_request)
        return Response(serializer.data)


from rest_framework.views import APIView
from django.db.models import Count, Q

class DashboardStatsView(APIView):
    """
    API endpoint for superadmin dashboard statistics.
    Returns counts of all requests by status and processing status.
    No role-based filtering - returns all system data.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get dashboard statistics for all requests in the system"""
        try:
            # Get all request counts
            total_requests = RedemptionRequest.objects.count()
            pending_count = RedemptionRequest.objects.filter(status='PENDING').count()
            approved_count = RedemptionRequest.objects.filter(status='APPROVED').count()
            rejected_count = RedemptionRequest.objects.filter(status='REJECTED').count()
            
            processed_count = RedemptionRequest.objects.filter(processing_status='PROCESSED').count()
            not_processed_count = RedemptionRequest.objects.filter(processing_status='NOT_PROCESSED').count()
            cancelled_count = RedemptionRequest.objects.filter(processing_status='CANCELLED').count()
            
            # Get on-board distributors count
            from distributers.models import Distributor
            on_board_count = Distributor.objects.count()
            
            return Response({
                'total_requests': total_requests,
                'pending_count': pending_count,
                'approved_count': approved_count,
                'rejected_count': rejected_count,
                'processed_count': processed_count,
                'not_processed_count': not_processed_count,
                'cancelled_count': cancelled_count,
                'on_board_count': on_board_count,
            })
        except Exception as e:
            logger.error(f"Error fetching dashboard stats: {str(e)}")
            return Response(
                {'error': 'Failed to fetch dashboard statistics', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DashboardRedemptionRequestsView(APIView):
    """
    API endpoint for superadmin dashboard redemption requests.
    Returns all RedemptionRequest records with pagination.
    No role-based filtering - returns all system data.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all redemption requests with pagination"""
        try:
            # Get pagination parameters
            limit = int(request.query_params.get('limit', 10))
            offset = int(request.query_params.get('offset', 0))
            
            # Validate limit to prevent abuse
            limit = min(limit, 100)  # Max 100 items per page
            limit = max(limit, 1)    # Min 1 item per page
            
            # Get all redemption requests with related data
            all_requests = RedemptionRequest.objects.all().prefetch_related(
                'items',
                'items__variant',
                'requested_by',
                'requested_for',
                'reviewed_by',
                'processed_by',
                'cancelled_by',
                'team'
            ).order_by('-date_requested')
            
            # Get total count
            total_count = all_requests.count()
            
            # Apply pagination
            paginated_requests = all_requests[offset:offset + limit]
            
            # Serialize the data
            serializer = RedemptionRequestSerializer(paginated_requests, many=True)
            
            return Response({
                'count': total_count,
                'limit': limit,
                'offset': offset,
                'results': serializer.data
            })
        except ValueError as e:
            return Response(
                {'error': 'Invalid pagination parameters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error fetching dashboard redemption requests: {str(e)}")
            return Response(
                {'error': 'Failed to fetch redemption requests', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResetAllPointsView(APIView):
    """
    API endpoint to reset all points to zero for both agents and distributors.
    Requires superadmin authentication and password verification.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Reset all points to zero with password verification"""
        try:
            # Check if user is superadmin
            profile = getattr(request.user, 'profile', None)
            is_admin = (not profile) or (profile and profile.position in ['Admin'])
            
            if not is_admin:
                return Response(
                    {'error': 'Only superadmins can reset all points'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get password from request
            password = request.data.get('password', '')
            
            if not password:
                return Response(
                    {'error': 'Password is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify password
            if not request.user.check_password(password):
                return Response(
                    {'error': 'Invalid password'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Reset all points using transaction for data consistency
            with transaction.atomic():
                # Reset all distributor points
                Distributor.objects.all().update(points=0)
                
                # Reset all user profile points
                UserProfile.objects.all().update(points=0)
            
            logger.info(f"Superadmin {request.user.username} reset all points to zero")
            
            return Response({
                'success': True,
                'message': 'All points have been reset to zero for both agents and distributors'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error resetting all points: {str(e)}")
            return Response(
                {'error': 'Failed to reset points', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
