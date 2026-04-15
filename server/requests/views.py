from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.hashers import check_password
import logging
from .models import RedemptionRequest, RedemptionRequestItem, ItemFulfillmentLog, ProcessingPhoto, ApprovalStatusChoice, RequestStatus, RequestedForType, AcknowledgementReceiptStatus, ProcessingStatus
from .serializers import (
    RedemptionRequestSerializer, 
    CreateRedemptionRequestSerializer,
    RedemptionRequestItemSerializer,
    PartialFulfillmentSerializer,
)
from utils.email_service import (
    send_request_approved_email, 
    send_request_rejected_email,
    send_request_submitted_email,
    send_request_processed_email,
    send_approved_request_notification_to_admin,
    send_ar_required_email
)
from utils.sse import publish_sse_event
from users.models import UserProfile
from distributers.models import Distributor
from customers.models import Customer
from points_audit.utils import log_points_change, bulk_log_points_changes, generate_batch_id
from points_audit.models import PointsAuditLog

# Configure logger for request operations
logger = logging.getLogger('email')


def _build_base_queryset():
    """
    Shared helper that builds a fully-prefetched RedemptionRequest queryset.
    Used by both RedemptionRequestViewSet and the standalone APIViews so all
    list endpoints share the same N+1-free access pattern.
    """
    from django.db.models import Prefetch
    return RedemptionRequest.objects.select_related(
        'requested_by__profile',
        'requested_for',
        'requested_for_customer',
        'team',
        'reviewed_by__profile',
        'processed_by__profile',
        'cancelled_by__profile',
        'sales_approved_by__profile',
        'ar_uploaded_by__profile',
    ).prefetch_related(
        Prefetch(
            'items',
            queryset=RedemptionRequestItem.objects.select_related(
                'product__mktg_admin',
                'item_processed_by__profile',
            ).prefetch_related(
                Prefetch(
                    'fulfillment_logs',
                    queryset=ItemFulfillmentLog.objects.select_related(
                        'fulfilled_by__profile'
                    )
                )
            )
        ),
        Prefetch(
            'processing_photos',
            queryset=ProcessingPhoto.objects.select_related(
                'uploaded_by__profile'
            )
        ),
    )


class RedemptionRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RedemptionRequestSerializer

    def _base_queryset(self):
        return _build_base_queryset()

    def get_queryset(self):
        """Filter requests based on user role and team"""
        from django.db.models import Q
        from teams.models import TeamMembership, Team

        user = self.request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            # Super admin without profile sees only approved requests
            return self._base_queryset().filter(status='APPROVED')

        # Sales Agent - only see their own requests
        if profile.position == 'Sales Agent':
            return self._base_queryset().filter(requested_by=user)

        # Approver - see requests from teams they manage + their own self-requests
        elif profile.position == 'Approver':
            qs = self._base_queryset().filter(
                Q(team__isnull=False, team__approver=user, requires_sales_approval=True) |
                Q(requested_by=user)
            ).distinct()
            # Optional server-side pre-filter: ?not_processed=1 returns only
            # NOT_PROCESSED requests, shrinking the payload the client must
            # download and parse on every poll.
            if self.request.query_params.get('not_processed') == '1':
                qs = qs.filter(processing_status='NOT_PROCESSED')
            elif self.request.query_params.get('processed') == '1':
                qs = qs.filter(processing_status='PROCESSED')
            return qs

        # Handler - see only APPROVED requests with items assigned to them
        elif profile.position == 'Handler':
            return self._base_queryset().filter(
                status='APPROVED',
                items__product__mktg_admin=user
            ).distinct()

        # Admin - see APPROVED requests with items assigned to them (explicit or unassigned)
        #       + requests from teams they manage as approver + their own self-requests
        elif profile.position == 'Admin':
            qs = self._base_queryset().filter(
                Q(status='APPROVED') & (
                    Q(items__product__mktg_admin=user) | Q(items__product__mktg_admin__isnull=True)
                )
                | Q(team__isnull=False, team__approver=user, requires_sales_approval=True)
                | Q(requested_by=user)
            ).distinct()
            if self.request.query_params.get('not_processed') == '1':
                qs = qs.filter(processing_status='NOT_PROCESSED')
            elif self.request.query_params.get('processed') == '1':
                qs = qs.filter(processing_status='PROCESSED')
            return qs

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
        
        # Approvers may only create DISTRIBUTOR or CUSTOMER requests
        approver_profile = getattr(user, 'profile', None)
        if approver_profile and approver_profile.position == 'Approver':
            requested_for_type = serializer.validated_data.get('requested_for_type')
            if requested_for_type not in ['DISTRIBUTOR', 'CUSTOMER']:
                raise ValidationError({
                    "detail": "Approvers can only create distributor or customer requests."
                })
        
        # Create the request with team assignment (handled by serializer)
        redemption_request = serializer.save()
        
        logger.info(f"✅ [CREATE DEBUG] Request #{redemption_request.id} created with team_id={redemption_request.team_id}")
        
        # Notify the team's approver of the new request
        approvers_emails = []
        if redemption_request.team and redemption_request.team.approver:
            approver_profile = getattr(redemption_request.team.approver, 'profile', None)
            if approver_profile and approver_profile.email:
                approvers_emails = [approver_profile.email]
        
        if not approvers_emails:
            logger.warning(f"⚠ No team approver email found for request #{redemption_request.id}, falling back to all approvers")
            approvers = UserProfile.objects.filter(position='Approver').exclude(email__isnull=True).exclude(email='')
            approvers_emails = list(approvers.values_list('email', flat=True))

        if approvers_emails:
            logger.info(f"New request #{redemption_request.id} created, sending notification to approvers...")
            entity = redemption_request.get_requested_for_entity()
            email_sent = send_request_submitted_email(
                request_obj=redemption_request,
                distributor=entity,
                approvers_emails=approvers_emails
            )
            if email_sent:
                logger.info(f"✓ Submission notification sent to approvers for request #{redemption_request.id}")
            else:
                logger.warning(f"⚠ Failed to send notification to approvers for request #{redemption_request.id}")
        else:
            logger.warning(f"⚠ No approvers with emails found for request #{redemption_request.id}")
        
        # Return the created request with full details
        response_serializer = RedemptionRequestSerializer(redemption_request)

        # SSE: notify team approver about new pending request
        sse_targets = []
        if redemption_request.team and redemption_request.team.approver_id:
            sse_targets.append(redemption_request.team.approver_id)
        # Also notify admins if auto-approved (no sales approval needed)
        if not redemption_request.requires_sales_approval:
            admin_ids = list(
                UserProfile.objects.filter(position='Admin')
                .values_list('user_id', flat=True)
            )
            sse_targets.extend(admin_ids)
        if sse_targets:
            publish_sse_event('request_created', {
                'request_id': redemption_request.id,
                'requested_by_name': redemption_request.requested_by.username,
            }, target_users=sse_targets)

        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a redemption request (legacy endpoint).
        For dual approval requests, this works as the sales approval track.
        For sales-only requests, this fully approves and deducts points/stock.
        """
        redemption_request = self.get_object()
        user = request.user
        
        # Check if this request requires sales approval
        if not redemption_request.requires_sales_approval:
            return Response(
                {'error': 'This request does not require sales approval and has been auto-approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check team-approver permission
        if not redemption_request.team or redemption_request.team.approver != user:
            return Response(
                {'error': 'Permission denied: You can only approve requests from your team'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Prevent self-approval
        if redemption_request.requested_by == user:
            return Response(
                {'error': 'You cannot approve your own request'},
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
                    try:
                        redemption_request.deduct_points()
                    except ValueError as e:
                        return Response(
                            {'error': 'Insufficient points', 'detail': str(e)},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
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

        # SSE: notify sales agent + admins about approval
        sse_targets = [redemption_request.requested_by_id]
        admin_ids = list(
            UserProfile.objects.filter(position='Admin')
            .values_list('user_id', flat=True)
        )
        sse_targets.extend(admin_ids)
        publish_sse_event('request_approved', {
            'request_id': redemption_request.id,
            'status': redemption_request.status,
        }, target_users=sse_targets)

        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject a redemption request (legacy endpoint).
        For dual approval requests, this works as the sales rejection track.
        """
        redemption_request = self.get_object()
        user = request.user
        
        # Check if this request requires sales approval
        if not redemption_request.requires_sales_approval:
            return Response(
                {'error': 'This request does not require sales approval and has been auto-approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check team-approver permission
        if not redemption_request.team or redemption_request.team.approver != user:
            return Response(
                {'error': 'Permission denied: You can only reject requests from your team'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Prevent self-rejection
        if redemption_request.requested_by == user:
            return Response(
                {'error': 'You cannot reject your own request'},
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

        # SSE: notify sales agent about rejection
        publish_sse_event('request_rejected', {
            'request_id': redemption_request.id,
        }, target_users=[redemption_request.requested_by_id])

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
        
        # Check if all Handler users have processed their items
        if not redemption_request.is_handler_processing_complete():
            processing_status = redemption_request.get_handler_processing_status()
            return Response(
                {
                    'error': 'Not all Handler users have processed their items',
                    'detail': 'All assigned Handler users must process their items before Admin can mark the request as processed',
                    'marketing_processing_status': processing_status
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update processing status
        redemption_request.processing_status = 'PROCESSED'
        redemption_request.processed_by = user
        redemption_request.date_processed = timezone.now()
        
        # Set AR status: required only for customer requests that contain at least one inventoried item
        requires_ar = (
            redemption_request.requested_for_type == RequestedForType.CUSTOMER
            and redemption_request.items.filter(product__has_stock=True).exists()
        )
        redemption_request.ar_status = (
            AcknowledgementReceiptStatus.PENDING if requires_ar
            else AcknowledgementReceiptStatus.NOT_REQUIRED
        )
        
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
        
        # Send AR required email if applicable
        if redemption_request.ar_status == AcknowledgementReceiptStatus.PENDING:
            ar_email_sent = send_ar_required_email(request_obj=redemption_request)
            if ar_email_sent:
                logger.info(f"✓ AR required email sent for request #{redemption_request.id}")
            else:
                logger.warning(f"⚠ Failed to send AR required email for request #{redemption_request.id}")
        
        serializer = self.get_serializer(redemption_request)

        # SSE: notify sales agent about processing
        publish_sse_event('request_processed', {
            'request_id': redemption_request.id,
        }, target_users=[redemption_request.requested_by_id])

        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel_request(self, request, pk=None):
        """Cancel an approved or processed redemption request (superadmin only)"""
        redemption_request = self.get_object()
        
        # Check if user is superadmin
        user = request.user
        profile = getattr(user, 'profile', None)
        
        if not profile or profile.position not in ['Admin', 'Handler']:
            return Response(
                {'error': 'Permission denied: Only superadmins and handler users can cancel requests'},
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
                # Compute points to refund: only for unfulfilled quantities/items
                refund_points = 0
                for item in redemption_request.items.select_related('product').all():
                    is_fixed = item.pricing_formula in (None, 'NONE')
                    if is_fixed:
                        remaining = max(0, item.quantity - item.fulfilled_quantity)
                        if item.points_per_item and remaining > 0:
                            refund_points += remaining * item.points_per_item
                    else:
                        # Dynamic pricing: refund full item points only if not yet processed
                        if not item.item_processed_by:
                            refund_points += item.total_points

                if refund_points > 0:
                    if redemption_request.points_deducted_from == 'SELF':
                        user_profile = redemption_request.requested_by.profile
                        previous_points = user_profile.points
                        user_profile.points += refund_points
                        user_profile.save()
                        log_points_change(
                            entity_type='USER',
                            entity_id=user_profile.user_id,
                            entity_name=user_profile.full_name or redemption_request.requested_by.username,
                            previous_points=previous_points,
                            new_points=user_profile.points,
                            action_type='REDEMPTION_REFUND',
                            changed_by=user,
                            reason=f'Cancellation of request #{redemption_request.id}',
                        )
                        logger.info(f"Refunded {refund_points} points to sales agent {redemption_request.requested_by.username}")
                    elif redemption_request.points_deducted_from == 'DISTRIBUTOR':
                        distributor = redemption_request.requested_for
                        if distributor:
                            previous_points = distributor.points
                            distributor.points += refund_points
                            distributor.save()
                            log_points_change(
                                entity_type='DISTRIBUTOR',
                                entity_id=distributor.id,
                                entity_name=distributor.name,
                                previous_points=previous_points,
                                new_points=distributor.points,
                                action_type='REDEMPTION_REFUND',
                                changed_by=user,
                                reason=f'Cancellation of request #{redemption_request.id}',
                            )
                            logger.info(f"Refunded {refund_points} points to distributor {distributor.name}")
                
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

        # SSE: notify sales agent + admins about cancellation
        sse_targets = [redemption_request.requested_by_id]
        admin_ids = list(
            UserProfile.objects.filter(position='Admin')
            .exclude(user_id=request.user.id)
            .values_list('user_id', flat=True)
        )
        sse_targets.extend(admin_ids)
        publish_sse_event('request_cancelled', {
            'request_id': redemption_request.id,
        }, target_users=sse_targets)

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
        
        # Send withdrawal email notification to approvers
        from utils.email_service import send_request_withdrawn_email, send_request_withdrawn_confirmation_email
        
        email_sent = send_request_withdrawn_email(
            request_obj=redemption_request,
            distributor=redemption_request.get_requested_for_entity(),
            withdrawn_by=user
        )
        if email_sent:
            logger.info(f"Withdrawal notification sent to approvers for request #{redemption_request.id}")
        else:
            logger.warning(f"Failed to send withdrawal notification for request #{redemption_request.id}")
        
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

        # SSE: notify team approver about withdrawal
        sse_targets = []
        if redemption_request.team and redemption_request.team.approver_id:
            sse_targets.append(redemption_request.team.approver_id)
        if sse_targets:
            publish_sse_event('request_withdrawn', {
                'request_id': redemption_request.id,
            }, target_users=sse_targets)

        return Response(serializer.data)

    def _uncommit_stock(self, redemption_request):
        """
        Release committed stock when a request is rejected/withdrawn/cancelled.
        Only uncommits the remaining (unfulfilled) quantity per item, since
        deduct_stock() already released committed_stock for fulfilled units.
        Should only be called within a transaction.
        """
        for item in redemption_request.items.all():
            product = item.product
            is_fixed = item.pricing_formula in (None, 'NONE')
            if is_fixed:
                remaining = max(0, item.quantity - item.fulfilled_quantity)
            else:
                # Dynamic pricing: if fully processed (item_processed_by set), stock already deducted; no uncommit
                remaining = 0 if item.item_processed_by else item.quantity
            if remaining > 0:
                product.uncommit_stock(remaining)
                logger.info(f"Uncommitted {remaining} units of {product.item_code}")

    @action(detail=True, methods=['post'])
    def mark_items_processed(self, request, pk=None):
        """
        Handler or Admin user partially or fully fulfills their assigned items.

        Request body:
          { "items": [{ "item_id": int, "fulfilled_quantity": int, "notes": str? }, ...] }

        Authorisation per item:
          - Handler: product.mktg_admin == request.user
          - Admin:     product.mktg_admin is null  OR  product.mktg_admin == request.user

        For FIXED pricing: fulfilled_quantity is required and must be <= remaining_quantity.
        For non-FIXED pricing: fulfilled_quantity is ignored; the entire item is marked done.
        Each call creates an ItemFulfillmentLog entry and advances fulfilled_quantity.
        When fulfilled_quantity reaches quantity (FIXED) the item is marked fully done.
        """
        redemption_request = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile or profile.position not in ['Handler', 'Admin']:
            return Response(
                {'error': 'Permission denied: Only Handler or Admin users can process items'},
                status=status.HTTP_403_FORBIDDEN
            )

        if redemption_request.status != 'APPROVED':
            return Response(
                {'error': 'Only approved requests can have items processed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate request body
        serializer = PartialFulfillmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        items_data = serializer.validated_data['items']

        # Collect and validate all items before any writes
        validated_items = []
        for entry in items_data:
            item_id = entry['item_id']
            try:
                item = redemption_request.items.select_related('product').get(id=item_id)
            except RedemptionRequestItem.DoesNotExist:
                return Response(
                    {'error': f'Item {item_id} does not belong to this request'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            product = item.product
            # Authorization check per item
            if profile.position == 'Handler':
                if not product or product.mktg_admin != user:
                    return Response(
                        {'error': f'Item {item_id} is not assigned to you'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:  # Admin
                if product and product.mktg_admin is not None and product.mktg_admin != user:
                    return Response(
                        {'error': f'Item {item_id} is assigned to a Handler user, not you'},
                        status=status.HTTP_403_FORBIDDEN
                    )

            pricing = 'FIXED' if item.pricing_formula in (None, 'NONE') else item.pricing_formula

            if pricing == 'FIXED':
                fulfill_qty = entry.get('fulfilled_quantity')
                if not fulfill_qty:
                    return Response(
                        {'error': f'fulfilled_quantity is required for FIXED pricing item {item_id}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                remaining = item.remaining_quantity
                if remaining == 0:
                    return Response(
                        {'error': f'Item {item_id} has already been fully fulfilled'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if fulfill_qty > remaining:
                    return Response(
                        {'error': f'Item {item_id}: fulfilled_quantity ({fulfill_qty}) exceeds remaining quantity ({remaining})'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                validated_items.append({
                    'item': item,
                    'pricing': 'FIXED',
                    'fulfill_qty': fulfill_qty,
                    'notes': entry.get('notes') or '',
                })
            else:
                # Non-FIXED: check not already processed
                if item.item_processed_by is not None:
                    return Response(
                        {'error': f'Item {item_id} has already been fully processed'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                validated_items.append({
                    'item': item,
                    'pricing': pricing,
                    'fulfill_qty': 0,  # sentinel for non-FIXED
                    'notes': entry.get('notes') or '',
                })

        # Apply fulfillment inside a transaction
        try:
            with transaction.atomic():
                now = timezone.now()
                partially_processed_count = 0
                fully_processed_count = 0

                for entry in validated_items:
                    item = entry['item']
                    product = item.product
                    pricing = entry['pricing']
                    notes = entry['notes']

                    if pricing == 'FIXED':
                        fulfill_qty = entry['fulfill_qty']
                        item.fulfilled_quantity += fulfill_qty
                        item.save(update_fields=['fulfilled_quantity'])

                        # Deduct actual stock and release committed reservation for fulfilled units
                        product.deduct_stock(fulfill_qty)

                        # Create audit log
                        ItemFulfillmentLog.objects.create(
                            item=item,
                            fulfilled_quantity=fulfill_qty,
                            fulfilled_by=user,
                            notes=notes,
                        )

                        # Check if now fully fulfilled
                        if item.is_fully_fulfilled:
                            item.item_processed_by = user
                            item.item_processed_at = now
                            item.save(update_fields=['item_processed_by', 'item_processed_at'])
                            fully_processed_count += 1
                            logger.info(
                                f"Item #{item.id} ({product.item_code}) fully fulfilled "
                                f"({item.quantity} units) by {user.username}"
                            )
                        else:
                            partially_processed_count += 1
                            logger.info(
                                f"Item #{item.id} ({product.item_code}) partially fulfilled "
                                f"({item.fulfilled_quantity}/{item.quantity} units) by {user.username}"
                            )
                    else:
                        # Non-FIXED: mark fully done in one pass
                        item.item_processed_by = user
                        item.item_processed_at = now
                        item.save(update_fields=['item_processed_by', 'item_processed_at'])

                        product.deduct_stock(item.quantity)

                        ItemFulfillmentLog.objects.create(
                            item=item,
                            fulfilled_quantity=0,
                            fulfilled_by=user,
                            notes=notes,
                        )
                        fully_processed_count += 1
                        logger.info(
                            f"Item #{item.id} ({product.item_code}) (non-FIXED) fully processed "
                            f"by {user.username}"
                        )

                # Advance the request's processing status
                new_status = redemption_request.update_processing_status_after_fulfillment(user)
                is_complete = new_status == 'PROCESSED'

                if is_complete:
                    logger.info(f"Request #{redemption_request.id} auto-marked as PROCESSED")
                    email_sent = send_request_processed_email(
                        request_obj=redemption_request,
                        distributor=redemption_request.get_requested_for_entity(),
                        processed_by=user
                    )
                    if email_sent:
                        logger.info(f"✓ Processed email sent for request #{redemption_request.id}")
                    else:
                        logger.warning(f"⚠ Failed to send processed email for request #{redemption_request.id}")

                    if redemption_request.ar_status == AcknowledgementReceiptStatus.PENDING:
                        ar_sent = send_ar_required_email(request_obj=redemption_request)
                        if ar_sent:
                            logger.info(f"✓ AR required email sent for request #{redemption_request.id}")
                        else:
                            logger.warning(f"⚠ Failed to send AR required email for request #{redemption_request.id}")

        except Exception as e:
            logger.error(f"Failed to process items for request #{redemption_request.id}: {str(e)}")
            return Response(
                {'error': 'Failed to process items', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer_out = self.get_serializer(redemption_request)

        # SSE: notify admins + sales agent about items processing
        sse_targets = list(
            UserProfile.objects.filter(position='Admin')
            .exclude(user_id=request.user.id)
            .values_list('user_id', flat=True)
        )
        if is_complete:
            sse_targets.append(redemption_request.requested_by_id)
            if redemption_request.team and redemption_request.team.approver_id:
                sse_targets.append(redemption_request.team.approver_id)
        publish_sse_event('items_processed', {
            'request_id': redemption_request.id,
            'all_complete': is_complete,
        }, target_users=sse_targets)

        return Response({
            'message': (
                f'Successfully processed {fully_processed_count + partially_processed_count} item(s) '
                f'({fully_processed_count} fully fulfilled, {partially_processed_count} partially fulfilled)'
            ),
            'partially_processed_count': partially_processed_count,
            'fully_processed_count': fully_processed_count,
            'remaining_count': (
                redemption_request.items
                .filter(item_processed_by__isnull=True)
                .count()
            ),
            'all_processing_complete': is_complete,
            'request': serializer_out.data,
        })

    @action(detail=True, methods=['get'])
    def my_processing_status(self, request, pk=None):
        """
        Get the current user's processing status for this request.
        Shows which items are assigned to them and their fulfilled/remaining counts.
        """
        redemption_request = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile or profile.position not in ['Handler', 'Admin']:
            return Response(
                {'error': 'This endpoint is for Handler or Admin users only'},
                status=status.HTTP_403_FORBIDDEN
            )

        if profile.position == 'Admin':
            my_items = redemption_request.get_items_for_admin_user(user)
        else:
            my_items = redemption_request.get_items_for_handler_user(user)
        # "pending" here means not yet fully processed (item_processed_by is null)
        pending_items = my_items.filter(item_processed_by__isnull=True)
        processed_items = my_items.filter(item_processed_by__isnull=False)

        return Response({
            'request_id': redemption_request.id,
            'total_assigned_items': my_items.count(),
            'pending_items': pending_items.count(),
            'processed_items': processed_items.count(),
            'all_my_items_processed': pending_items.count() == 0,
            'overall_processing_complete': redemption_request.is_handler_processing_complete(),
            'items': RedemptionRequestItemSerializer(my_items, many=True).data,
        })

    @action(detail=True, methods=['post'], url_path='upload_acknowledgement_receipt')
    def upload_acknowledgement_receipt(self, request, pk=None):
        """Upload an acknowledgement receipt photo and customer signature for a customer request."""
        redemption_request = self.get_object()
        user = request.user

        # Only the original requesting sales agent can upload
        if redemption_request.requested_by != user:
            return Response(
                {'error': 'Permission denied: Only the requesting sales agent can upload the acknowledgement receipt'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Must be a processed customer request awaiting AR
        if redemption_request.ar_status != AcknowledgementReceiptStatus.PENDING:
            return Response(
                {'error': 'This request does not require an acknowledgement receipt upload'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if redemption_request.processing_status != 'PROCESSED':
            return Response(
                {'error': 'Only processed requests can have an acknowledgement receipt uploaded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate AR receipt file is present
        if 'acknowledgement_receipt' not in request.FILES:
            return Response(
                {'error': 'No acknowledgement receipt file provided. Please upload a file.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ar_file = request.FILES['acknowledgement_receipt']
        sig_file = request.FILES.get('received_by_signature')  # Optional
        signature_method = request.POST.get('received_by_signature_method')  # Optional
        received_by_name = request.POST.get('received_by_name', '').strip()  # Optional

        # Validate AR file type
        allowed_types_ar = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        if ar_file.content_type not in allowed_types_ar:
            return Response(
                {'error': 'Invalid AR file type. Please upload a PDF, PNG, JPG, or WebP file.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate AR file size (5MB max)
        if ar_file.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'AR file too large. Maximum size is 5MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate signature file if provided
        if sig_file:
            allowed_types_sig = ['image/jpeg', 'image/png', 'image/webp']
            if sig_file.content_type not in allowed_types_sig:
                return Response(
                    {'error': 'Invalid signature file type. Please use PNG, JPG, or WebP.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if sig_file.size > 5 * 1024 * 1024:
                return Response(
                    {'error': 'Signature file too large. Maximum size is 5MB.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Validate signature method when signature file is provided
            if signature_method not in ['DRAWN', 'PHOTO']:
                return Response(
                    {'error': 'Invalid signature method. Must be either DRAWN or PHOTO.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Delete old files if replacing
        if redemption_request.acknowledgement_receipt:
            redemption_request.acknowledgement_receipt.delete(save=False)
        if sig_file and redemption_request.received_by_signature:
            redemption_request.received_by_signature.delete(save=False)

        redemption_request.acknowledgement_receipt = ar_file
        if sig_file:
            redemption_request.received_by_signature = sig_file
            redemption_request.received_by_signature_method = signature_method
        if received_by_name:
            redemption_request.received_by_name = received_by_name
        redemption_request.received_by_date = timezone.now()
        redemption_request.ar_status = AcknowledgementReceiptStatus.UPLOADED
        redemption_request.ar_uploaded_by = user
        redemption_request.ar_uploaded_at = timezone.now()
        redemption_request.save()

        logger.info(f"AR with signature uploaded for request #{redemption_request.id} by {user.username}. Signature method: {signature_method}")

        serializer = self.get_serializer(redemption_request)

        # SSE: notify admins about AR upload
        admin_ids = list(
            UserProfile.objects.filter(position='Admin')
            .values_list('user_id', flat=True)
        )
        if admin_ids:
            publish_sse_event('ar_uploaded', {
                'request_id': redemption_request.id,
            }, target_users=admin_ids)

        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='upload_processing_photo')
    def upload_processing_photo(self, request, pk=None):
        """Upload a handover proof photo during item processing."""
        redemption_request = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)

        # Only Handler or Admin users can upload processing photos
        if not profile or profile.position not in ['Handler', 'Admin']:
            return Response(
                {'error': 'Permission denied: Only Handler or Admin users can upload processing photos'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Request must be approved and at least partially processed (or about to be)
        if redemption_request.status != 'APPROVED':
            return Response(
                {'error': 'Only approved requests can have processing photos uploaded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file is present
        if 'photo' not in request.FILES:
            return Response(
                {'error': 'No file provided. Please upload an image file.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_file = request.FILES['photo']

        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if uploaded_file.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type. Please upload a PNG, JPG, or WebP image.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size (5MB max)
        if uploaded_file.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'File too large. Maximum size is 5MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        caption = request.data.get('caption', '')

        ProcessingPhoto.objects.create(
            request=redemption_request,
            photo=uploaded_file,
            uploaded_by=user,
            caption=caption,
        )

        logger.info(f"Processing photo uploaded for request #{redemption_request.id} by {user.username}")

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
            # Two annotated GROUP-BY queries instead of seven separate COUNT queries
            status_counts = {
                row['status']: row['count']
                for row in RedemptionRequest.objects.values('status').annotate(count=Count('id'))
            }
            proc_counts = {
                row['processing_status']: row['count']
                for row in RedemptionRequest.objects.values('processing_status').annotate(count=Count('id'))
            }

            # Get on-board distributors and customers count (exclude archived)
            from distributers.models import Distributor
            from customers.models import Customer
            on_board_count = Distributor.objects.filter(is_archived=False).count()
            customers_count = Customer.objects.filter(is_archived=False).count()

            return Response({
                'total_requests': sum(status_counts.values()),
                'pending_count': status_counts.get('PENDING', 0),
                'approved_count': status_counts.get('APPROVED', 0),
                'rejected_count': status_counts.get('REJECTED', 0),
                'processed_count': proc_counts.get('PROCESSED', 0),
                'not_processed_count': proc_counts.get('NOT_PROCESSED', 0),
                'cancelled_count': proc_counts.get('CANCELLED', 0),
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
            
            # Use the shared helper for correct select_related + prefetch chains
            all_requests = _build_base_queryset().order_by('-date_requested')
            
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
    API endpoint to reset all points to zero for agents, distributors, and customers.
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
                batch_id = generate_batch_id()
                audit_entries = []

                # Snapshot entities with non-zero points before resetting
                for dist in Distributor.objects.filter(points__gt=0).only('id', 'name', 'points'):
                    audit_entries.append({
                        'entity_type': 'DISTRIBUTOR',
                        'entity_id': dist.id,
                        'entity_name': dist.name,
                        'previous_points': dist.points,
                        'new_points': 0,
                        'action_type': PointsAuditLog.ActionType.BULK_RESET,
                        'changed_by': request.user,
                        'reason': 'Reset all points to zero',
                        'batch_id': batch_id,
                    })

                for up in UserProfile.objects.filter(points__gt=0).select_related('user').only('user_id', 'full_name', 'points'):
                    audit_entries.append({
                        'entity_type': 'USER',
                        'entity_id': up.user_id,
                        'entity_name': up.full_name or up.user.username,
                        'previous_points': up.points,
                        'new_points': 0,
                        'action_type': PointsAuditLog.ActionType.BULK_RESET,
                        'changed_by': request.user,
                        'reason': 'Reset all points to zero',
                        'batch_id': batch_id,
                    })

                if audit_entries:
                    bulk_log_points_changes(audit_entries)

                # Reset all distributor points
                Distributor.objects.all().update(points=0)
                
                # Reset all user profile points
                UserProfile.objects.all().update(points=0)
            
            logger.info(f"Superadmin {request.user.username} reset all points to zero")
            
            return Response({
                'success': True,
                'message': 'All points have been reset to zero for agents and distributors'
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
            
            # Always count only the agent's own requests, regardless of team membership.
            team_requests = RedemptionRequest.objects.filter(requested_by=user)
            
            # Single aggregate query instead of three separate COUNT queries
            stats = team_requests.aggregate(
                pending_count=Count('id', filter=Q(status='PENDING')),
                approved_count=Count('id', filter=Q(status='APPROVED')),
                processed_count=Count('id', filter=Q(processing_status='PROCESSED')),
            )

            # Get agent's current points
            agent_points = profile.points if profile else 0

            # Get count of active distributors in agent's team (if applicable)
            if membership:
                # Get distributors associated with this team (exclude archived)
                active_distributors_count = Distributor.objects.filter(is_archived=False).count()
            else:
                active_distributors_count = 0

            return Response({
                'pending_count': stats['pending_count'],
                'approved_count': stats['approved_count'],
                'processed_count': stats['processed_count'],
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


class ApproverDashboardStatsView(APIView):
    """
    API endpoint for approver dashboard statistics.
    Returns counts scoped to teams managed by the logged-in approver.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from teams.models import Team

        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile or profile.position != 'Approver':
            return Response(
                {'error': 'Access denied. Approver role required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Requests from all teams this approver manages
        team_requests = RedemptionRequest.objects.filter(
            team__isnull=False,
            team__approver=user,
            requires_sales_approval=True,
        )

        # Single aggregate query instead of four separate COUNT queries
        stats = team_requests.aggregate(
            pending_count=Count('id', filter=Q(status='PENDING')),
            approved_count=Count('id', filter=Q(status='APPROVED')),
            rejected_count=Count('id', filter=Q(status='REJECTED')),
            processed_count=Count('id', filter=Q(processing_status='PROCESSED')),
        )

        managed_teams = Team.objects.filter(approver=user)
        team_count = managed_teams.count()
        team_names = list(managed_teams.values_list('name', flat=True))

        return Response({
            'pending_count': stats['pending_count'],
            'approved_count': stats['approved_count'],
            'rejected_count': stats['rejected_count'],
            'processed_count': stats['processed_count'],
            'team_count': team_count,
            'team_names': team_names,
            'approver_name': user.get_full_name() or user.username,
        })


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
        
        all_requests = _build_base_queryset().order_by('-date_requested')
        serializer = RedemptionRequestSerializer(all_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HandlerHistoryView(APIView):
    """View for getting processed requests where the current handler user has processed items"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all requests where the current handler user has processed items"""
        from django.db.models import Q
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Only allow Handler position users
        if profile and profile.position != 'Handler':
            return Response({
                'error': 'Access denied. Handler role required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get all requests where handler is involved (assigned or processed items)
        # filtered to show PARTIALLY_PROCESSED, PROCESSED, or CANCELLED status
        # (Shows history of all requests handler has worked on or is assigned to)
        processed_requests = _build_base_queryset().filter(
            Q(items__product__mktg_admin=user) | Q(items__item_processed_by=user),
            processing_status__in=[
                ProcessingStatus.PARTIALLY_PROCESSED,
                ProcessingStatus.PROCESSED,
                ProcessingStatus.CANCELLED
            ]
        ).distinct().order_by('-date_requested')
        serializer = RedemptionRequestSerializer(processed_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
