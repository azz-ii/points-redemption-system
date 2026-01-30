from django.db import models
from django.utils import timezone
from django.conf import settings
from distributers.models import Distributor
from customers.models import Customer
from items_catalogue.models import Product
from teams.models import Team

class PointsDeductionChoice(models.TextChoices):
    SELF = 'SELF', 'Self (Sales Agent)'
    DISTRIBUTOR = 'DISTRIBUTOR', 'Distributor'
    CUSTOMER = 'CUSTOMER', 'Customer'

class RequestedForType(models.TextChoices):
    DISTRIBUTOR = 'DISTRIBUTOR', 'Distributor'
    CUSTOMER = 'CUSTOMER', 'Customer'

class RequestStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

class ProcessingStatus(models.TextChoices):
    NOT_PROCESSED = 'NOT_PROCESSED', 'Not Processed'
    PROCESSED = 'PROCESSED', 'Processed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class ApprovalStatusChoice(models.TextChoices):
    """Status for individual approval tracks (sales/marketing)"""
    NOT_REQUIRED = 'NOT_REQUIRED', 'Not Required'
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'

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
    
    # Service Vehicle Use fields
    svc_date = models.DateField(
        blank=True,
        null=True,
        help_text='Service vehicle use date'
    )
    svc_time = models.TimeField(
        blank=True,
        null=True,
        help_text='Service vehicle use time'
    )
    svc_driver = models.CharField(
        max_length=20,
        choices=SvcDriverChoice.choices,
        blank=True,
        null=True,
        help_text='Whether the service vehicle includes a driver'
    )
    plate_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text='Vehicle plate number for service delivery'
    )
    driver_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Name of the driver for service delivery'
    )

    def __str__(self):
        entity_name = self.get_requested_for_name()
        return f"Request #{self.id} by {self.requested_by.username} for {entity_name}"

    def get_requested_for_entity(self):
        """Get the entity (Distributor or Customer) this request is for."""
        if self.requested_for_type == RequestedForType.CUSTOMER:
            return self.requested_for_customer
        return self.requested_for

    def get_requested_for_name(self):
        """Get the name of the entity this request is for."""
        entity = self.get_requested_for_entity()
        return entity.name if entity else 'Unknown'

    def compute_approval_requirements(self):
        """
        All requests require sales approval. Marketing only processes items.
        Should be called after items are added.
        """
        self.requires_sales_approval = True
        self.sales_approval_status = ApprovalStatusChoice.PENDING
        self.save()

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

    def get_required_marketing_users(self):
        """
        Get set of unique Marketing users (mktg_admin) required to process this request.
        Returns User objects for all items that have a mktg_admin assigned.
        """
        users = set()
        for item in self.items.select_related('product__mktg_admin').all():
            if item.product and item.product.mktg_admin:
                users.add(item.product.mktg_admin)
        return users

    def get_items_for_marketing_user(self, user):
        """
        Get items assigned to a specific Marketing user.
        Returns QuerySet of RedemptionRequestItem where the item's product mktg_admin == user.
        """
        return self.items.filter(product__mktg_admin=user)

    def get_items_pending_processing(self, user):
        """
        Get items assigned to this Marketing user that haven't been processed yet.
        """
        return self.items.filter(
            product__mktg_admin=user,
            item_processed_by__isnull=True
        )

    def is_marketing_processing_complete(self):
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

    def get_marketing_processing_status(self):
        """
        Get detailed status of marketing processing.
        Returns dict with counts and user-specific info.
        """
        items_with_mktg = self.items.filter(
            product__mktg_admin__isnull=False
        ).select_related('product__mktg_admin', 'item_processed_by')
        
        total = items_with_mktg.count()
        processed = items_with_mktg.filter(item_processed_by__isnull=False).count()
        
        # Group by marketing user
        user_status = {}
        for item in items_with_mktg:
            mktg_user = item.product.mktg_admin
            if mktg_user.id not in user_status:
                user_status[mktg_user.id] = {
                    'user_id': mktg_user.id,
                    'username': mktg_user.username,
                    'total_items': 0,
                    'processed_items': 0,
                }
            user_status[mktg_user.id]['total_items'] += 1
            if item.item_processed_by:
                user_status[mktg_user.id]['processed_items'] += 1
        
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
        on_delete=models.CASCADE,
        related_name='redemption_items',
        help_text='The product being redeemed'
    )
    quantity = models.PositiveIntegerField(
        default=1,
        help_text='Number of units requested (for FIXED pricing items)'
    )
    points_per_item = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Points per item at the time of request (snapshot, for FIXED pricing)'
    )
    total_points = models.PositiveIntegerField(
        help_text='Total points for this line item'
    )
    
    # Dynamic pricing fields - snapshots from product at request time
    pricing_type = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        help_text='Pricing type snapshot (FIXED, PER_SQFT, PER_INVOICE, PER_DAY, PER_EU_SRP)'
    )
    dynamic_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='User-provided value for dynamic calculation (e.g., sq ft, invoice amount, days)'
    )
    points_multiplier = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Snapshot of points multiplier at request time'
    )
    
    # Item-level processing by Marketing user
    item_processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_request_items',
        help_text='Marketing user who processed this specific item'
    )
    item_processed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time when this item was processed by Marketing'
    )

    def save(self, *args, **kwargs):
        # Automatically calculate total_points based on pricing type
        if not self.total_points:
            if self.pricing_type and self.pricing_type != 'FIXED' and self.dynamic_quantity and self.points_multiplier:
                # Dynamic pricing: total = dynamic_quantity * points_multiplier
                from decimal import Decimal
                self.total_points = int(Decimal(self.dynamic_quantity) * Decimal(self.points_multiplier))
            elif self.points_per_item:
                # Fixed pricing: total = quantity * points_per_item
                self.total_points = self.quantity * self.points_per_item
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity}x {self.product} for Request #{self.request.id}"

    class Meta:
        verbose_name = "Redemption Request Item"
        verbose_name_plural = "Redemption Request Items"
        ordering = ['id']
