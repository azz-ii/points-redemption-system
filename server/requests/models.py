import logging
from django.db import models
from django.core.validators import FileExtensionValidator
from django.utils import timezone
from django.conf import settings
from distributers.models import Distributor
from customers.models import Customer
from items_catalogue.models import Product
from teams.models import Team
from points_audit.utils import log_points_change

class PointsDeductionChoice(models.TextChoices):
    SELF = 'SELF', 'Self (Sales Agent)'
    DISTRIBUTOR = 'DISTRIBUTOR', 'Distributor'

class RequestedForType(models.TextChoices):
    DISTRIBUTOR = 'DISTRIBUTOR', 'Distributor'
    CUSTOMER = 'CUSTOMER', 'Customer'
    SELF = 'SELF', 'Self'

class RequestStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

class ProcessingStatus(models.TextChoices):
    NOT_PROCESSED = 'NOT_PROCESSED', 'Not Processed'
    PARTIALLY_PROCESSED = 'PARTIALLY_PROCESSED', 'Partially Processed'
    PROCESSED = 'PROCESSED', 'Processed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class ApprovalStatusChoice(models.TextChoices):
    """Status for individual approval tracks (sales/handler)"""
    NOT_REQUIRED = 'NOT_REQUIRED', 'Not Required'
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'

class AcknowledgementReceiptStatus(models.TextChoices):
    NOT_REQUIRED = 'NOT_REQUIRED', 'Not Required'
    PENDING = 'PENDING', 'Pending'
    UPLOADED = 'UPLOADED', 'Uploaded'

class SvcDriverChoice(models.TextChoices):
    WITH_DRIVER = 'WITH_DRIVER', 'With Driver'
    WITHOUT_DRIVER = 'WITHOUT_DRIVER', 'Without Driver'

class RedemptionRequest(models.Model):
    id = models.AutoField(primary_key=True)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='redemption_requests',
        help_text='Sales agent who created this request'
    )
    requested_for = models.ForeignKey(
        Distributor,
        on_delete=models.CASCADE,
        related_name='redemption_requests',
        null=True,
        blank=True,
        help_text='Distributor for whom the items are being redeemed'
    )
    requested_for_customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='redemption_requests',
        null=True,
        blank=True,
        help_text='Customer for whom the items are being redeemed'
    )
    requested_for_type = models.CharField(
        max_length=20,
        choices=RequestedForType.choices,
        default=RequestedForType.DISTRIBUTOR,
        help_text='Type of entity this request is for (Distributor or Customer)'
    )
    team = models.ForeignKey(
        'teams.Team',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='redemption_requests',
        help_text='Team that this request belongs to (set at creation time)'
    )
    points_deducted_from = models.CharField(
        max_length=20,
        choices=PointsDeductionChoice.choices,
        default=PointsDeductionChoice.SELF,
        help_text='Whether points are deducted from the sales agent or distributor'
    )
    total_points = models.PositiveIntegerField(
        default=0,
        help_text='Total points for all items in this request'
    )
    status = models.CharField(
        max_length=20,
        choices=RequestStatus.choices,
        default=RequestStatus.PENDING,
        help_text='Current approval status of the request (Approver level)'
    )
    processing_status = models.CharField(
        max_length=20,
        choices=ProcessingStatus.choices,
        default=ProcessingStatus.NOT_PROCESSED,
        help_text='Current processing status of the request (Superadmin level)'
    )
    date_requested = models.DateTimeField(
        default=timezone.now,
        help_text='Date and time when the request was created'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_requests',
        help_text='Approver who approved or rejected this request'
    )
    date_reviewed = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time when the request was reviewed by approver'
    )
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_requests',
        help_text='Superadmin who marked this request as processed'
    )
    date_processed = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time when the request was marked as processed'
    )
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cancelled_requests',
        help_text='Superadmin who cancelled this request'
    )
    date_cancelled = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time when the request was cancelled'
    )
    remarks = models.TextField(
        blank=True,
        null=True,
        help_text='Additional notes or remarks about the request'
    )
    rejection_reason = models.TextField(
        blank=True,
        null=True,
        help_text='Reason for rejection, if applicable'
    )
    withdrawal_reason = models.TextField(
        blank=True,
        null=True,
        help_text='Reason for withdrawal by sales agent, if applicable'
    )
    
    # Dual Approval System Fields
    # Tracks what type of approval is required for this request (computed from items)
    requires_sales_approval = models.BooleanField(
        default=True,
        help_text='Whether this request requires sales approver approval'
    )
    
    # Sales Approval Track
    sales_approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatusChoice.choices,
        default=ApprovalStatusChoice.PENDING,
        help_text='Sales approver approval status'
    )
    sales_approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales_approved_requests',
        help_text='Sales approver who approved/rejected this request'
    )
    sales_approval_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time of sales approval/rejection'
    )
    sales_rejection_reason = models.TextField(
        blank=True,
        null=True,
        help_text='Reason for sales approval rejection'
    )
    
    # Marketing Approval Track
    marketing_rejection_reason = models.TextField(
        blank=True,
        null=True,
        help_text='Reason for marketing approval rejection (dual-approval marketing track)'
    )
    
    # Service Vehicle Use fields (Deprecated - Use Generic Items Extra Fields System)
    svc_date = models.DateField(
        blank=True,
        null=True,
        help_text='[DEPRECATED] Service vehicle use date'
    )
    svc_time = models.TimeField(
        blank=True,
        null=True,
        help_text='[DEPRECATED] Service vehicle use time'
    )
    svc_driver = models.CharField(
        max_length=20,
        choices=SvcDriverChoice.choices,
        blank=True,
        null=True,
        help_text='[DEPRECATED] Whether the service vehicle includes a driver'
    )
    plate_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text='[DEPRECATED] Vehicle plate number for service delivery'
    )
    driver_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='[DEPRECATED] Name of the driver for service delivery'
    )

    # Acknowledgement Receipt fields (for customer requests)
    ar_number = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        help_text='Auto-generated AR number (PRS-XXXX)'
    )
    ar_status = models.CharField(
        max_length=20,
        choices=AcknowledgementReceiptStatus.choices,
        default=AcknowledgementReceiptStatus.NOT_REQUIRED,
        help_text='Status of acknowledgement receipt upload (only for customer requests)'
    )
    acknowledgement_receipt = models.FileField(
        upload_to='acknowledgement_receipts/%Y/%m/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'png', 'jpg', 'jpeg', 'webp'])],
        help_text='Photo or PDF of the acknowledgement receipt (max 5MB)'
    )
    ar_uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ar_uploaded_requests',
        help_text='Sales agent who uploaded the acknowledgement receipt'
    )
    ar_uploaded_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time when the acknowledgement receipt was uploaded'
    )

    # E-signature fields (for customer acknowledgement)
    received_by_signature = models.ImageField(
        upload_to='signatures/%Y/%m/',
        blank=True,
        null=True,
        help_text='Digital or photo signature of the customer (received by field)'
    )
    received_by_signature_method = models.CharField(
        max_length=10,
        choices=[('DRAWN', 'Digital Signature Pad'), ('PHOTO', 'Photo Upload')],
        blank=True,
        null=True,
        help_text='Method used to capture the signature'
    )
    received_by_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text='Printed name of the person who received the items'
    )
    received_by_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time when the items were received'
    )

    def __str__(self):
        entity_name = self.get_requested_for_name()
        return f"Request #{self.id} by {self.requested_by.username} for {entity_name}"

    def get_requested_for_entity(self):
        """Get the entity (Distributor or Customer) this request is for."""
        if self.requested_for_type == RequestedForType.SELF:
            return None
        if self.requested_for_type == RequestedForType.CUSTOMER:
            return self.requested_for_customer
        return self.requested_for

    def get_requested_for_name(self):
        """Get the name of the entity this request is for."""
        if self.requested_for_type == RequestedForType.SELF:
            profile = getattr(self.requested_by, 'profile', None)
            if profile:
                return profile.full_name or self.requested_by.username
            return self.requested_by.username
        entity = self.get_requested_for_entity()
        return entity.name if entity else 'Unknown'

    def compute_approval_requirements(self):
        """
        Compute whether sales approval is required based on items.
        If ANY item's product requires sales approval, the whole request requires it.
        If no items require sales approval, auto-approve and deduct points.
        Should be called after items are added.
        """
        # Check if any item requires sales approval
        requires_sales = any(
            item.product and item.product.requires_sales_approval
            for item in self.items.select_related('product').all()
        )
        
        self.requires_sales_approval = requires_sales
        
        if requires_sales:
            # Requires approval - set to PENDING
            self.sales_approval_status = ApprovalStatusChoice.PENDING
            self.status = RequestStatus.PENDING
        else:
            # Does not require approval - auto-approve
            self.sales_approval_status = ApprovalStatusChoice.NOT_REQUIRED
            self.status = RequestStatus.APPROVED
            
            # Deduct points immediately since we're bypassing approval
            try:
                self.deduct_points()
            except ValueError as e:
                # If points deduction fails, raise exception
                # The serializer should handle this in a transaction
                raise
        
        self.save()
    
    def deduct_points(self):
        """
        Deduct points from the appropriate account (agent or distributor).
        Raises ValueError if insufficient points.
        Should be called within a transaction.
        """
        # Check if sufficient points are available
        if self.points_deducted_from == 'SELF':
            user_profile = self.requested_by.profile
            previous_points = user_profile.points
            user_profile.points -= self.total_points
            user_profile.save()
            log_points_change(
                entity_type='USER',
                entity_id=user_profile.user_id,
                entity_name=user_profile.full_name or self.requested_by.username,
                previous_points=previous_points,
                new_points=user_profile.points,
                action_type='REDEMPTION_DEDUCT',
                changed_by=self.requested_by,
                reason=f'Redemption request #{self.id}',
            )
            
        elif self.points_deducted_from == 'DISTRIBUTOR':
            distributor = self.requested_for
            if not distributor:
                raise ValueError('No distributor assigned to this request')
            if distributor.points < self.total_points:
                raise ValueError(
                    f'Insufficient points: Distributor has {distributor.points} points but needs {self.total_points} points'
                )
            previous_points = distributor.points
            distributor.points -= self.total_points
            distributor.save()
            log_points_change(
                entity_type='DISTRIBUTOR',
                entity_id=distributor.id,
                entity_name=distributor.name,
                previous_points=previous_points,
                new_points=distributor.points,
                action_type='REDEMPTION_DEDUCT',
                changed_by=self.requested_by,
                reason=f'Redemption request #{self.id}',
            )
        else:
            logger = logging.getLogger(__name__)
            logger.warning(f'Unexpected points_deducted_from value: {self.points_deducted_from!r} on request #{self.id}')
            raise ValueError(f'Invalid points_deducted_from: {self.points_deducted_from}')

    def update_overall_status(self):
        """
        Update the overall status based on sales approval track.
        Call this after any approval action.
        """
        # If sales rejected, overall is rejected
        if self.sales_approval_status == ApprovalStatusChoice.REJECTED:
            self.status = RequestStatus.REJECTED
            self.rejection_reason = self.sales_rejection_reason
        
        # If sales approved, overall is approved
        elif self.is_fully_approved():
            self.status = RequestStatus.APPROVED
        
        # Otherwise still pending
        else:
            self.status = RequestStatus.PENDING
        
        self.save()

    def is_fully_approved(self):
        """Check if sales approval has been granted."""
        return self.sales_approval_status in [ApprovalStatusChoice.APPROVED, ApprovalStatusChoice.NOT_REQUIRED]

    def get_pending_approvals(self):
        """Get list of pending approval types."""
        pending = []
        if self.sales_approval_status == ApprovalStatusChoice.PENDING:
            pending.append('sales')
        return pending

    def get_required_handler_users(self):
        """
        Get set of unique Handler users (mktg_admin) required to process this request.
        Returns User objects for all items that have a mktg_admin assigned.
        """
        users = set()
        for item in self.items.select_related('product__mktg_admin').all():
            if item.product and item.product.mktg_admin:
                users.add(item.product.mktg_admin)
        return users

    def get_items_for_handler_user(self, user):
        """
        Get items assigned to a specific Handler user.
        Returns QuerySet of RedemptionRequestItem where the item's product mktg_admin == user.
        """
        return self.items.filter(product__mktg_admin=user)

    def get_items_for_admin_user(self, user):
        """
        Get items assigned to an Admin user: explicitly assigned to them OR unassigned (mktg_admin is None).
        Returns QuerySet of RedemptionRequestItem.
        """
        from django.db.models import Q
        return self.items.filter(Q(product__mktg_admin=user) | Q(product__mktg_admin__isnull=True))

    def get_items_pending_processing(self, user):
        """
        Get items assigned to this Handler user that haven't been processed yet.
        """
        return self.items.filter(
            product__mktg_admin=user,
            item_processed_by__isnull=True
        )

    def has_any_fulfillment_progress(self):
        """Return True if any item has at least one fulfillment pass recorded."""
        from django.db.models import Q
        return self.items.filter(
            Q(fulfilled_quantity__gt=0) | Q(item_processed_by__isnull=False)
        ).exists()

    def update_processing_status_after_fulfillment(self, processed_by_user):
        """
        Promote request processing_status after a fulfillment pass.
        Returns the new processing_status value.
        """
        if self.is_handler_processing_complete():
            if self.processing_status != ProcessingStatus.PROCESSED:
                self.processing_status = ProcessingStatus.PROCESSED
                self.processed_by = processed_by_user
                self.date_processed = timezone.now()
                requires_ar = (
                    self.requested_for_type == RequestedForType.CUSTOMER
                    and self.items.filter(product__has_stock=True).exists()
                )
                self.ar_status = (
                    AcknowledgementReceiptStatus.PENDING if requires_ar
                    else AcknowledgementReceiptStatus.NOT_REQUIRED
                )
                self.save()
            return ProcessingStatus.PROCESSED
        elif self.has_any_fulfillment_progress():
            if self.processing_status not in [ProcessingStatus.PARTIALLY_PROCESSED, ProcessingStatus.PROCESSED]:
                self.processing_status = ProcessingStatus.PARTIALLY_PROCESSED
                self.save()
            return ProcessingStatus.PARTIALLY_PROCESSED
        return self.processing_status

    def is_handler_processing_complete(self):
        """
        Check if all items with assigned mktg_admin have been processed.
        Returns True if:
        - No items have mktg_admin assigned, OR
        - All items with mktg_admin have been processed
        """
        items_with_mktg = self.items.filter(
            product__mktg_admin__isnull=False
        )
        if not items_with_mktg.exists():
            return True
        
        unprocessed = items_with_mktg.filter(item_processed_by__isnull=True)
        return not unprocessed.exists()

    def get_handler_processing_status(self):
        """
        Get detailed status of handler processing.
        Uses Python-level filtering over prefetched items to avoid N+1 queries.
        self.items.all() hits the prefetch cache when this is called during a
        list request (via _base_queryset); falls back to a single DB query
        when called in a non-list context (e.g. a detail or write endpoint).
        """
        all_items = list(self.items.all())
        items_with_mktg = [
            item for item in all_items
            if item.product_id and item.product.mktg_admin_id
        ]

        total = len(items_with_mktg)
        processed = sum(1 for item in items_with_mktg if item.item_processed_by_id is not None)

        user_status = {}
        for item in items_with_mktg:
            mktg_user = item.product.mktg_admin
            uid = mktg_user.id
            if uid not in user_status:
                user_status[uid] = {
                    'user_id': uid,
                    'username': mktg_user.username,
                    'total_items': 0,
                    'processed_items': 0,
                }
            user_status[uid]['total_items'] += 1
            if item.item_processed_by_id is not None:
                user_status[uid]['processed_items'] += 1

        return {
            'total_items': total,
            'processed_items': processed,
            'is_complete': processed == total if total > 0 else True,
            'users': list(user_status.values())
        }

    class Meta:
        verbose_name = "Redemption Request"
        verbose_name_plural = "Redemption Requests"
        ordering = ['-date_requested']
        indexes = [
            # Supports the default ORDER BY -date_requested on every list query
            models.Index(fields=['date_requested'], name='req_date_requested_idx'),
            # Filtered in every role branch (APPROVED, PENDING, etc.)
            models.Index(fields=['status'], name='req_status_idx'),
            # Filtered by Admin / Handler processing views
            models.Index(fields=['processing_status'], name='req_processing_status_idx'),
            # Composite for the Approver query: filter(team=X, status=Y)
            models.Index(fields=['team', 'status'], name='req_team_status_idx'),
        ]

class RedemptionRequestItem(models.Model):
    id = models.AutoField(primary_key=True)
    request = models.ForeignKey(
        RedemptionRequest,
        on_delete=models.CASCADE,
        related_name='items',
        help_text='The redemption request this item belongs to'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='redemption_items',
        help_text='The product being redeemed'
    )
    quantity = models.PositiveIntegerField(
        default=1,
        help_text='Number of units requested'
    )
    points_per_item = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Points per item at the time of request (snapshot)'
    )
    total_points = models.PositiveIntegerField(
        help_text='Total points for this line item'
    )
    
    # Dynamic pricing fields - snapshots from product at request time
    points_multiplier = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Snapshot of points multiplier at request time'
    )
    
    # Partial fulfillment tracking
    fulfilled_quantity = models.PositiveIntegerField(
        default=0,
        help_text='Cumulative units fulfilled across all processing passes'
    )

    # Item-level processing by Marketing user
    item_processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_request_items',
        help_text='Handler user who fully processed this specific item'
    )
    item_processed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time when this item was fully processed'
    )
    
    extra_data = models.JSONField(
        blank=True, null=True,
        help_text='Snapshot of extra field values provided at request time'
    )
    pricing_formula = models.CharField(
        max_length=30, blank=True, null=True,
        help_text='Snapshot of formula slug used for pricing at request time'
    )

    @property
    def is_fully_fulfilled(self):
        """True when all units have been fulfilled or item has been marked done."""
        if self.quantity > 1 or self.pricing_formula in ['NONE', 'STANDARD']:
            return self.fulfilled_quantity >= self.quantity
        return self.item_processed_by is not None

    @property
    def remaining_quantity(self):
        """Remaining units to be fulfilled."""
        return max(0, self.quantity - self.fulfilled_quantity)

    def save(self, *args, **kwargs):
        # Ensure total_points is computed if not set (normally done in serializer)
        if not self.total_points and self.points_per_item:
            self.total_points = self.quantity * self.points_per_item
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity}x {self.product} for Request #{self.request.id}"

    class Meta:
        verbose_name = "Redemption Request Item"
        verbose_name_plural = "Redemption Request Items"
        ordering = ['id']


class ItemFulfillmentLog(models.Model):
    """Audit log for each partial or full fulfillment pass on a redemption request item."""
    id = models.AutoField(primary_key=True)
    item = models.ForeignKey(
        RedemptionRequestItem,
        on_delete=models.CASCADE,
        related_name='fulfillment_logs',
        help_text='The request item this log entry belongs to'
    )
    fulfilled_quantity = models.PositiveIntegerField(
        default=0,
        help_text='Units fulfilled in this pass'
    )
    fulfilled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='item_fulfillment_logs',
        help_text='User who performed this fulfillment pass'
    )
    fulfilled_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Date and time of this fulfillment pass'
    )
    notes = models.TextField(
        blank=True,
        null=True,
        help_text='Optional notes about this fulfillment pass'
    )

    def __str__(self):
        return f"FulfillmentLog item #{self.item_id}: {self.fulfilled_quantity} units by {self.fulfilled_by}"

    class Meta:
        verbose_name = "Item Fulfillment Log"
        verbose_name_plural = "Item Fulfillment Logs"
        ordering = ['fulfilled_at']


class ProcessingPhoto(models.Model):
    """Photo proof of handover uploaded during item processing."""
    id = models.AutoField(primary_key=True)
    request = models.ForeignKey(
        RedemptionRequest,
        on_delete=models.CASCADE,
        related_name='processing_photos',
        help_text='The redemption request this photo belongs to'
    )
    photo = models.ImageField(
        upload_to='processing_photos/%Y/%m/',
        help_text='Photo proof of item handover (max 5MB, PNG/JPG/WebP)'
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processing_photos',
        help_text='User who uploaded this photo'
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Date and time when this photo was uploaded'
    )
    caption = models.TextField(
        blank=True,
        null=True,
        help_text='Optional caption or note for this photo'
    )

    def __str__(self):
        return f"ProcessingPhoto #{self.id} for request #{self.request_id} by {self.uploaded_by}"

    class Meta:
        verbose_name = "Processing Photo"
        verbose_name_plural = "Processing Photos"
        ordering = ['uploaded_at']
