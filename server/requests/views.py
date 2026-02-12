from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.hashers import check_password
import logging
from .models import RedemptionRequest, RedemptionRequestItem, ApprovalStatusChoice, RequestStatus, RequestedForType
from .serializers import (
    RedemptionRequestSerializer, 
    CreateRedemptionRequestSerializer,
    RedemptionRequestItemSerializer
)
from utils.email_service import (
    send_request_approved_email, 
    send_request_rejected_email,
    send_request_submitted_email,
    send_request_processed_email,
    send_approved_request_notification_to_admin
)
from users.models import UserProfile
from distributers.models import Distributor
from customers.models import Customer

# Configure logger for request operations
logger = logging.getLogger('email')


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session authentication without CSRF checks for API endpoints"""
    def enforce_csrf(self, request):
        return  # Skip CSRF check


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
            return RedemptionRequest.objects.filter(status='APPROVED').prefetch_related('items', 'items__product')
        
        # Sales Agent - team-scoped access
        if profile.position == 'Sales Agent':
            # Sales agents see only their team's requests
            membership = TeamMembership.objects.filter(user=user).first()
            if membership:
                # Show requests that belong to their team
                return RedemptionRequest.objects.filter(
                    team=membership.team
                ).distinct().prefetch_related('items', 'items__product')
            # If not in a team, only see own requests
            return RedemptionRequest.objects.filter(requested_by=user).prefetch_related('items', 'items__product')
        
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
                # Only show requests that require sales approval
                queryset = RedemptionRequest.objects.filter(
                    Q(team__in=managed_teams) | Q(team__isnull=True, requested_by_id__in=team_member_ids),
                    requires_sales_approval=True
                ).distinct().prefetch_related('items', 'items__product')
                
                logger.info(f"🔍 [APPROVER DEBUG] Total requests found: {queryset.count()}")
                logger.info(f"🔍 [APPROVER DEBUG] Request details: {list(queryset.values('id', 'team_id', 'requested_by_id', 'status'))}")
                
                return queryset
            # If not managing any team, see no requests
            logger.warning(f"⚠️ [APPROVER DEBUG] User {user.username} is not managing any teams!")
            return RedemptionRequest.objects.none()
        
        # Marketing - see only APPROVED requests with items assigned to them
        elif profile.position == 'Marketing':
            return RedemptionRequest.objects.filter(
                status='APPROVED',
                items__product__mktg_admin=user
            ).distinct().prefetch_related('items', 'items__product')
        
        # Admin - see all APPROVED requests for processing
        elif profile.position == 'Admin':
            return RedemptionRequest.objects.filter(
                status='APPROVED'
            ).distinct().prefetch_related('items', 'items__product')
        
        # Other administrative support positions - global access to approved requests
        elif profile.position in ['Reception', 'Executive Assistant']:
            return RedemptionRequest.objects.filter(status='APPROVED').prefetch_related('items', 'items__product')
        
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
                entity = redemption_request.get_requested_for_entity()
                email_sent = send_request_submitted_email(
                    request_obj=redemption_request,
                    distributor=entity,
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
                    distributor=redemption_request.get_requested_for_entity(),
                    approvers_emails=approvers_emails
                )
        
        # Return the created request with full details
        response_serializer = RedemptionRequestSerializer(redemption_request)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a redemption request (legacy endpoint).
        For dual approval requests, this works as the sales approval track.
        For sales-only requests, this fully approves and deducts points/stock.
        """
        from teams.models import Team
        
        redemption_request = self.get_object()
        
        # Check if this request requires sales approval
        if not redemption_request.requires_sales_approval:
            return Response(
                {'error': 'This request does not require sales approval and has been auto-approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
        
        # Use transaction to ensure atomicity
        try:
            with transaction.atomic():
                # Handle dual approval system
                if redemption_request.requires_sales_approval:
                    # Update sales approval track
                    if redemption_request.sales_approval_status == ApprovalStatusChoice.PENDING:
                        redemption_request.sales_approval_status = ApprovalStatusChoice.APPROVED
                        redemption_request.sales_approved_by = user
                        redemption_request.sales_approval_date = timezone.now()
                        redemption_request.save()
                
                # Update overall status based on approval tracks
                redemption_request.update_overall_status()
                
                # Only deduct points and stock if fully approved
                if redemption_request.is_fully_approved():
                    success, error_response = self._deduct_points_and_stock(redemption_request)
                    if not success:
                        return error_response
                    
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
                        distributor=redemption_request.get_requested_for_entity(),
                        approved_by=request.user
                    )
                    
                    if email_sent:
                        logger.info(f"✓ Approval email sent for request #{redemption_request.id}")
                    else:
                        logger.warning(f"⚠ Failed to send approval email for request #{redemption_request.id}")
                    
                    # Send notification to superadmins that request is ready for processing
                    admin_email_sent = send_approved_request_notification_to_admin(
                        request_obj=redemption_request,
                        distributor=redemption_request.get_requested_for_entity(),
                        approved_by=request.user
                    )
                    
                    if admin_email_sent:
                        logger.info(f"✓ Admin notification sent for request #{redemption_request.id}")
                    else:
                        logger.warning(f"⚠ Failed to send admin notification for request #{redemption_request.id}")
                else:
                    # Still awaiting other approvals
                    logger.info(f"Request #{redemption_request.id} sales approved, pending approvals: {redemption_request.get_pending_approvals()}")
                    if 'remarks' in request.data:
                        redemption_request.remarks = request.data['remarks']
                    redemption_request.save()
        
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
        """
        Reject a redemption request (legacy endpoint).
        For dual approval requests, this works as the sales rejection track.
        """
        from teams.models import Team
        
        redemption_request = self.get_object()
        
        # Check if this request requires sales approval
        if not redemption_request.requires_sales_approval:
            return Response(
                {'error': 'This request does not require sales approval and has been auto-approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
        
        # Use transaction to ensure atomicity when uncommitting stock
        try:
            with transaction.atomic():
                # Handle dual approval system
                if redemption_request.requires_sales_approval:
                    if redemption_request.sales_approval_status == ApprovalStatusChoice.PENDING:
                        redemption_request.sales_approval_status = ApprovalStatusChoice.REJECTED
                        redemption_request.sales_approved_by = user
                        redemption_request.sales_approval_date = timezone.now()
                        redemption_request.sales_rejection_reason = rejection_reason
                
                # Update request status
                redemption_request.status = 'REJECTED'
                redemption_request.reviewed_by = request.user
                redemption_request.date_reviewed = timezone.now()
                redemption_request.rejection_reason = rejection_reason
                
                # Get remarks if provided
                if 'remarks' in request.data:
                    redemption_request.remarks = request.data['remarks']
                
                redemption_request.save()
                redemption_request.update_overall_status()
                
                # Release committed stock
                self._uncommit_stock(redemption_request)
                
        except Exception as e:
            logger.error(f"Failed to process rejection for request #{redemption_request.id}: {str(e)}")
            return Response(
                {'error': 'Failed to process rejection', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Send rejection email notification
        logger.info(f"Request #{redemption_request.id} rejected, sending email notification...")
        email_sent = send_request_rejected_email(
            request_obj=redemption_request,
            distributor=redemption_request.get_requested_for_entity(),
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
        
        # Check if all Marketing users have processed their items
        if not redemption_request.is_marketing_processing_complete():
            processing_status = redemption_request.get_marketing_processing_status()
            return Response(
                {
                    'error': 'Not all Marketing users have processed their items',
                    'detail': 'All assigned Marketing users must process their items before Admin can mark the request as processed',
                    'marketing_processing_status': processing_status
                },
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
        
        # Send processed email notification
        logger.info(f"Request #{redemption_request.id} processed, sending email notification...")
        email_sent = send_request_processed_email(
            request_obj=redemption_request,
            distributor=redemption_request.get_requested_for_entity(),
            processed_by=user
        )
        
        if email_sent:
            logger.info(f"✓ Processed email sent for request #{redemption_request.id}")
        else:
            logger.warning(f"⚠ Failed to send processed email for request #{redemption_request.id}")
        
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
        
        # Use transaction to ensure atomicity when refunding points and uncommitting stock
        try:
            with transaction.atomic():
                # Refund points if the request was approved (points were deducted)
                if redemption_request.points_deducted_from == 'SELF':
                    user_profile = redemption_request.requested_by.profile
                    user_profile.points += redemption_request.total_points
                    user_profile.save()
                    logger.info(f"Refunded {redemption_request.total_points} points to sales agent {redemption_request.requested_by.username}")
                elif redemption_request.points_deducted_from == 'DISTRIBUTOR':
                    distributor = redemption_request.requested_for
                    if distributor:
                        distributor.points += redemption_request.total_points
                        distributor.save()
                        logger.info(f"Refunded {redemption_request.total_points} points to distributor {distributor.name}")
                elif redemption_request.points_deducted_from == 'CUSTOMER':
                    customer = redemption_request.requested_for_customer
                    if customer:
                        customer.points += redemption_request.total_points
                        customer.save()
                        logger.info(f"Refunded {redemption_request.total_points} points to customer {customer.name}")
                
                # Release committed stock (stock was not deducted at approval, only committed at creation)
                self._uncommit_stock(redemption_request)
                
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

    @action(detail=True, methods=['post'])
    def withdraw_request(self, request, pk=None):
        """Allow sales agent to withdraw their own pending request"""
        redemption_request = self.get_object()
        user = request.user
        
        # Verify the user is the one who created this request
        if redemption_request.requested_by != user:
            return Response(
                {'error': 'Permission denied: You can only withdraw your own requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only pending requests can be withdrawn
        if redemption_request.status != 'PENDING':
            return Response(
                {'error': 'Only pending requests can be withdrawn'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cannot withdraw if sales approver has already approved
        if redemption_request.sales_approval_status == 'APPROVED':
            return Response(
                {'error': 'Request cannot be withdrawn after sales approval'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Withdrawal reason is required
        withdrawal_reason = request.data.get('withdrawal_reason')
        if not withdrawal_reason:
            return Response(
                {'error': 'Withdrawal reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use transaction to ensure atomicity when uncommitting stock
        try:
            with transaction.atomic():
                # Update request status to WITHDRAWN
                redemption_request.status = 'WITHDRAWN'
                redemption_request.withdrawal_reason = withdrawal_reason
                redemption_request.cancelled_by = user
                redemption_request.date_cancelled = timezone.now()
                
                # Get remarks if provided
                if 'remarks' in request.data:
                    redemption_request.remarks = request.data.get('remarks')
                
                redemption_request.save()
                
                # Release committed stock
                self._uncommit_stock(redemption_request)
                
        except Exception as e:
            logger.error(f"Failed to process withdrawal for request #{redemption_request.id}: {str(e)}")
            return Response(
                {'error': 'Failed to process withdrawal', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        logger.info(f"Request #{redemption_request.id} withdrawn by sales agent {user.username}")
        
        # Send withdrawal email notification to the team approver
        from utils.email_service import send_request_withdrawn_email, send_request_withdrawn_confirmation_email
        
        if redemption_request.team and redemption_request.team.approver:
            approver = redemption_request.team.approver
            if hasattr(approver, 'profile') and approver.profile.email:
                email_sent = send_request_withdrawn_email(
                    request_obj=redemption_request,
                    distributor=redemption_request.get_requested_for_entity(),
                    withdrawn_by=user
                )
                if email_sent:
                    logger.info(f"Withdrawal notification sent to approver {approver.username}")
                else:
                    logger.warning(f"Failed to send withdrawal notification to approver {approver.username}")
        
        # Send confirmation email to the sales agent
        confirmation_sent = send_request_withdrawn_confirmation_email(
            request_obj=redemption_request,
            distributor=redemption_request.get_requested_for_entity(),
            withdrawn_by=user
        )
        if confirmation_sent:
            logger.info(f"Withdrawal confirmation sent to sales agent {user.username}")
        else:
            logger.warning(f"Failed to send withdrawal confirmation to sales agent {user.username}")
        
        serializer = self.get_serializer(redemption_request)
        return Response(serializer.data)

    def _deduct_points_and_stock(self, redemption_request):
        """
        Helper method to deduct points when a request is fully approved.
        Stock is committed at request creation and deducted at processing.
        Should only be called within a transaction.
        Returns (success, error_response) tuple.
        """
        # Check if sufficient points are available
        if redemption_request.points_deducted_from == 'SELF':
            user_profile = redemption_request.requested_by.profile
            if user_profile.points < redemption_request.total_points:
                return False, Response(
                    {
                        'error': 'Insufficient points',
                        'detail': f'Sales agent has {user_profile.points} points but needs {redemption_request.total_points} points'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif redemption_request.points_deducted_from == 'DISTRIBUTOR':
            distributor = redemption_request.requested_for
            if not distributor:
                return False, Response(
                    {'error': 'No distributor assigned to this request'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if distributor.points < redemption_request.total_points:
                return False, Response(
                    {
                        'error': 'Insufficient points',
                        'detail': f'Distributor has {distributor.points} points but needs {redemption_request.total_points} points'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif redemption_request.points_deducted_from == 'CUSTOMER':
            customer = redemption_request.requested_for_customer
            if not customer:
                return False, Response(
                    {'error': 'No customer assigned to this request'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if customer.points < redemption_request.total_points:
                return False, Response(
                    {
                        'error': 'Insufficient points',
                        'detail': f'Customer has {customer.points} points but needs {redemption_request.total_points} points'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Note: Stock is already committed at request creation.
        # Stock deduction happens when marketing processes the request.
        
        # Deduct points from the appropriate account
        if redemption_request.points_deducted_from == 'SELF':
            user_profile = redemption_request.requested_by.profile
            user_profile.points -= redemption_request.total_points
            user_profile.save()
        elif redemption_request.points_deducted_from == 'DISTRIBUTOR':
            distributor = redemption_request.requested_for
            distributor.points -= redemption_request.total_points
            distributor.save()
        elif redemption_request.points_deducted_from == 'CUSTOMER':
            customer = redemption_request.requested_for_customer
            customer.points -= redemption_request.total_points
            customer.save()
        
        return True, None
    
    def _uncommit_stock(self, redemption_request):
        """
        Helper method to release committed stock when a request is rejected/withdrawn/cancelled.
        Should only be called within a transaction.
        """
        for item in redemption_request.items.all():
            product = item.product
            product.uncommit_stock(item.quantity)
            logger.info(f"Uncommitted {item.quantity} units of {product.item_code}")

    @action(detail=True, methods=['post'])
    def sales_approve(self, request, pk=None):
        """Approve a redemption request from the sales approver track"""
        redemption_request = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Permission check: Only Approvers can use this endpoint
        if not profile or profile.position != 'Approver':
            return Response(
                {'error': 'Permission denied: Only Approvers can approve via sales track'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if this request requires sales approval
        if not redemption_request.requires_sales_approval:
            return Response(
                {'error': 'This request does not require sales approval'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already actioned
        if redemption_request.sales_approval_status != ApprovalStatusChoice.PENDING:
            return Response(
                {'error': f'Sales approval is already {redemption_request.sales_approval_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check team permission
        if redemption_request.team and redemption_request.team.approver != user:
            return Response(
                {'error': 'Permission denied: You can only approve requests from your team'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            with transaction.atomic():
                # Update sales approval track
                redemption_request.sales_approval_status = ApprovalStatusChoice.APPROVED
                redemption_request.sales_approved_by = user
                redemption_request.sales_approval_date = timezone.now()
                
                if 'remarks' in request.data:
                    redemption_request.remarks = request.data['remarks']
                
                redemption_request.save()
                
                # Update overall status
                redemption_request.update_overall_status()
                
                # If fully approved now, deduct points and stock
                if redemption_request.is_fully_approved():
                    success, error_response = self._deduct_points_and_stock(redemption_request)
                    if not success:
                        raise Exception(error_response.data.get('detail', 'Failed to deduct points/stock'))
                    
                    redemption_request.reviewed_by = user
                    redemption_request.date_reviewed = timezone.now()
                    redemption_request.save()
                    
                    # Send approval emails
                    logger.info(f"Request #{redemption_request.id} fully approved, sending notifications...")
                    send_request_approved_email(
                        request_obj=redemption_request,
                        distributor=redemption_request.get_requested_for_entity(),
                        approved_by=user
                    )
                    send_approved_request_notification_to_admin(
                        request_obj=redemption_request,
                        distributor=redemption_request.get_requested_for_entity(),
                        approved_by=user
                    )
                else:
                    logger.info(f"Request #{redemption_request.id} sales approved, awaiting marketing approval")
        
        except Exception as e:
            logger.error(f"Failed to process sales approval for request #{redemption_request.id}: {str(e)}")
            return Response(
                {'error': 'Failed to process approval', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        serializer = self.get_serializer(redemption_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def sales_reject(self, request, pk=None):
        """Reject a redemption request from the sales approver track"""
        redemption_request = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Permission check
        if not profile or profile.position != 'Approver':
            return Response(
                {'error': 'Permission denied: Only Approvers can reject via sales track'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if this request requires sales approval
        if not redemption_request.requires_sales_approval:
            return Response(
                {'error': 'This request does not require sales approval'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already actioned
        if redemption_request.sales_approval_status != ApprovalStatusChoice.PENDING:
            return Response(
                {'error': f'Sales approval is already {redemption_request.sales_approval_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check team permission
        if redemption_request.team and redemption_request.team.approver != user:
            return Response(
                {'error': 'Permission denied: You can only reject requests from your team'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Rejection reason required
        rejection_reason = request.data.get('rejection_reason')
        if not rejection_reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use transaction to ensure atomicity when uncommitting stock
        try:
            with transaction.atomic():
                # Update sales rejection
                redemption_request.sales_approval_status = ApprovalStatusChoice.REJECTED
                redemption_request.sales_approved_by = user
                redemption_request.sales_approval_date = timezone.now()
                redemption_request.sales_rejection_reason = rejection_reason
                
                if 'remarks' in request.data:
                    redemption_request.remarks = request.data['remarks']
                
                redemption_request.save()
                redemption_request.update_overall_status()
                
                # Release committed stock
                self._uncommit_stock(redemption_request)
                
        except Exception as e:
            logger.error(f"Failed to process sales rejection for request #{redemption_request.id}: {str(e)}")
            return Response(
                {'error': 'Failed to process rejection', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Send rejection email
        logger.info(f"Request #{redemption_request.id} sales rejected, sending notification...")
        send_request_rejected_email(
            request_obj=redemption_request,
            distributor=redemption_request.get_requested_for_entity(),
            rejected_by=user
        )
        
        serializer = self.get_serializer(redemption_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_items_processed(self, request, pk=None):
        """
        Marketing or Admin user marks their assigned items as processed.
        Each user must process their own assigned items.
        """
        redemption_request = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Permission check: Only Marketing or Admin position can use this endpoint
        if not profile or profile.position not in ['Marketing', 'Admin']:
            return Response(
                {'error': 'Permission denied: Only Marketing or Admin users can process items'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Request must be approved
        if redemption_request.status != 'APPROVED':
            return Response(
                {'error': 'Only approved requests can have items processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get items assigned to this Marketing user
        my_items = redemption_request.get_items_for_marketing_user(user)
        
        if not my_items.exists():
            return Response(
                {'error': 'You have no items assigned to you in this request'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get items that haven't been processed yet
        pending_items = my_items.filter(item_processed_by__isnull=True)
        
        if not pending_items.exists():
            return Response(
                {'error': 'All your items have already been processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use transaction to ensure atomicity for stock deduction
        try:
            with transaction.atomic():
                # Process each pending item: mark as processed and deduct stock
                now = timezone.now()
                processed_count = 0
                
                for item in pending_items:
                    # Mark item as processed
                    item.item_processed_by = user
                    item.item_processed_at = now
                    item.save()
                    
                    # Deduct actual stock and release committed stock
                    product = item.product
                    product.deduct_stock(item.quantity)
                    logger.info(f"Deducted {item.quantity} units from {product.item_code} stock (processed by {user.username})")
                    
                    processed_count += 1
                
                logger.info(f"Marketing user {user.username} processed {processed_count} items for request #{redemption_request.id}")
                
                # Check if all marketing processing is now complete
                is_complete = redemption_request.is_marketing_processing_complete()
                
                # If all items are processed, automatically update the request's processing_status
                if is_complete and redemption_request.processing_status != 'PROCESSED':
                    redemption_request.processing_status = 'PROCESSED'
                    redemption_request.processed_by = user
                    redemption_request.date_processed = now
                    redemption_request.save()
                    
                    logger.info(f"Request #{redemption_request.id} auto-marked as PROCESSED (all items complete)")
                    
                    # Send processed email notification
                    email_sent = send_request_processed_email(
                        request_obj=redemption_request,
                        distributor=redemption_request.get_requested_for_entity(),
                        processed_by=user
                    )
                    if email_sent:
                        logger.info(f"✓ Processed email sent for request #{redemption_request.id}")
                    else:
                        logger.warning(f"⚠ Failed to send processed email for request #{redemption_request.id}")
        
        except Exception as e:
            logger.error(f"Failed to process items for request #{redemption_request.id}: {str(e)}")
            return Response(
                {'error': 'Failed to process items', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        serializer = self.get_serializer(redemption_request)
        return Response({
            'message': f'Successfully processed {processed_count} item(s)',
            'processed_count': processed_count,
            'all_processing_complete': is_complete,
            'request': serializer.data
        })

    @action(detail=True, methods=['get'])
    def my_processing_status(self, request, pk=None):
        """
        Get the current user's processing status for this request.
        Shows which items are assigned to them and their processed status.
        """
        redemption_request = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        
        if not profile or profile.position not in ['Marketing', 'Admin']:
            return Response(
                {'error': 'This endpoint is for Marketing or Admin users only'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        my_items = redemption_request.get_items_for_marketing_user(user)
        pending_items = my_items.filter(item_processed_by__isnull=True)
        processed_items = my_items.filter(item_processed_by__isnull=False)
        
        return Response({
            'request_id': redemption_request.id,
            'total_assigned_items': my_items.count(),
            'pending_items': pending_items.count(),
            'processed_items': processed_items.count(),
            'all_my_items_processed': pending_items.count() == 0,
            'overall_processing_complete': redemption_request.is_marketing_processing_complete(),
            'items': RedemptionRequestItemSerializer(my_items, many=True).data
        })


from rest_framework.views import APIView
from django.db.models import Count, Q

class DashboardStatsView(APIView):
    """
    API endpoint for superadmin dashboard statistics.
    Returns counts of all requests by status and processing status.
    No role-based filtering - returns all system data.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
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
            
            # Get on-board distributors and customers count (exclude archived)
            from distributers.models import Distributor
            from customers.models import Customer
            on_board_count = Distributor.objects.filter(is_archived=False).count()
            customers_count = Customer.objects.filter(is_archived=False).count()
            
            return Response({
                'total_requests': total_requests,
                'pending_count': pending_count,
                'approved_count': approved_count,
                'rejected_count': rejected_count,
                'processed_count': processed_count,
                'not_processed_count': not_processed_count,
                'cancelled_count': cancelled_count,
                'on_board_count': on_board_count,
                'customers_count': customers_count,
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
    authentication_classes = [CsrfExemptSessionAuthentication]
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
                'items__product',
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


class AgentDashboardStatsView(APIView):
    """
    API endpoint for agent dashboard statistics.
    Returns counts specific to the logged-in agent's requests and team.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get dashboard statistics for the logged-in agent"""
        try:
            from teams.models import TeamMembership, Team
            from django.db.models import Count, Q
            
            user = request.user
            profile = getattr(user, 'profile', None)
            
            # Get agent's team membership
            membership = TeamMembership.objects.filter(user=user).first()
            
            if membership:
                agent_team = membership.team
                # Get requests from the agent's team
                team_requests = RedemptionRequest.objects.filter(team=agent_team)
            else:
                # If not in a team, only count own requests
                team_requests = RedemptionRequest.objects.filter(requested_by=user)
            
            # Calculate agent-specific statistics
            pending_count = team_requests.filter(status='PENDING').count()
            approved_count = team_requests.filter(status='APPROVED').count()
            processed_count = team_requests.filter(processing_status='PROCESSED').count()
            
            # Get agent's current points
            agent_points = profile.points if profile else 0
            
            # Get count of active distributors in agent's team (if applicable)
            if membership:
                # Get distributors associated with this team (exclude archived)
                active_distributors_count = Distributor.objects.filter(is_archived=False).count()
            else:
                active_distributors_count = 0
            
            return Response({
                'pending_count': pending_count,
                'approved_count': approved_count,
                'processed_count': processed_count,
                'agent_points': agent_points,
                'active_distributors_count': active_distributors_count,
                'team_name': membership.team.name if membership else 'No Team',
                'agent_name': user.get_full_name() or user.username,
            })
        except Exception as e:
            logger.error(f"Error fetching agent dashboard stats: {str(e)}")
            return Response(
                {'error': 'Failed to fetch agent dashboard statistics', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProcessedRequestHistoryView(APIView):
    """View for getting all processed redemption requests (Admin only)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all processed requests regardless of assignment"""
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Only allow Admin position users (not Sales Agents, Approvers, etc.)
        if profile and profile.position not in ['Admin']:
            return Response({
                'error': 'Access denied. Admin role required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get all processed requests
        processed_requests = RedemptionRequest.objects.filter(
            processing_status='PROCESSED'
        ).prefetch_related(
            'items',
            'items__product'
        ).order_by('-date_requested')
        
        serializer = RedemptionRequestSerializer(processed_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MarketingHistoryView(APIView):
    """View for getting processed requests where the current marketing user has processed items"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all requests where the current marketing user has processed items"""
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Only allow Marketing position users
        if profile and profile.position != 'Marketing':
            return Response({
                'error': 'Access denied. Marketing role required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get all requests where this user has processed at least one item
        # This shows history regardless of current item legend assignment
        # (item_processed_by tracks who actually processed the item)
        processed_requests = RedemptionRequest.objects.filter(
            items__item_processed_by=user
        ).distinct().prefetch_related(
            'items',
            'items__product'
        ).order_by('-date_requested')
        
        serializer = RedemptionRequestSerializer(processed_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
