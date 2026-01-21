from django.db import models
from django.utils import timezone
from django.conf import settings
from distributers.models import Distributor
from items_catalogue.models import Variant
from teams.models import Team

class PointsDeductionChoice(models.TextChoices):
    SELF = 'SELF', 'Self (Sales Agent)'
    DISTRIBUTOR = 'DISTRIBUTOR', 'Distributor'

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
        help_text='Distributor for whom the items are being redeemed'
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
    requires_marketing_approval = models.BooleanField(
        default=False,
        help_text='Whether this request requires marketing approval'
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
    marketing_approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatusChoice.choices,
        default=ApprovalStatusChoice.NOT_REQUIRED,
        help_text='Marketing approval status'
    )
    marketing_approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='marketing_approved_requests',
        help_text='Marketing user who approved/rejected this request'
    )
    marketing_approval_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time of marketing approval/rejection'
    )
    marketing_rejection_reason = models.TextField(
        blank=True,
        null=True,
        help_text='Reason for marketing approval rejection'
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

    def __str__(self):
        return f"Request #{self.id} by {self.requested_by.username} for {self.requested_for.name}"

    def compute_approval_requirements(self):
        """
        Compute what approvals are required based on items in the request.
        Should be called after items are added.
        """
        from items_catalogue.models import ApprovalType
        
        requires_sales = False
        requires_marketing = False
        
        for item in self.items.all():
            approval_type = item.variant.catalogue_item.approval_type
            if approval_type == ApprovalType.SALES_ONLY:
                requires_sales = True
            elif approval_type == ApprovalType.MARKETING_ONLY:
                requires_marketing = True
            elif approval_type == ApprovalType.BOTH:
                requires_sales = True
                requires_marketing = True
        
        self.requires_sales_approval = requires_sales
        self.requires_marketing_approval = requires_marketing
        
        # Set initial statuses based on requirements
        if requires_sales:
            self.sales_approval_status = ApprovalStatusChoice.PENDING
        else:
            self.sales_approval_status = ApprovalStatusChoice.NOT_REQUIRED
            
        if requires_marketing:
            self.marketing_approval_status = ApprovalStatusChoice.PENDING
        else:
            self.marketing_approval_status = ApprovalStatusChoice.NOT_REQUIRED
        
        self.save()

    def update_overall_status(self):
        """
        Update the overall status based on individual approval tracks.
        Call this after any approval action.
        """
        # If either track is rejected, overall is rejected
        if (self.sales_approval_status == ApprovalStatusChoice.REJECTED or 
            self.marketing_approval_status == ApprovalStatusChoice.REJECTED):
            self.status = RequestStatus.REJECTED
            # Combine rejection reasons
            reasons = []
            if self.sales_rejection_reason:
                reasons.append(f"Sales: {self.sales_rejection_reason}")
            if self.marketing_rejection_reason:
                reasons.append(f"Marketing: {self.marketing_rejection_reason}")
            self.rejection_reason = " | ".join(reasons) if reasons else None
        
        # If all required tracks are approved, overall is approved
        elif self.is_fully_approved():
            self.status = RequestStatus.APPROVED
        
        # Otherwise still pending
        else:
            self.status = RequestStatus.PENDING
        
        self.save()

    def is_fully_approved(self):
        """Check if all required approvals have been granted."""
        sales_ok = (self.sales_approval_status in 
                   [ApprovalStatusChoice.APPROVED, ApprovalStatusChoice.NOT_REQUIRED])
        marketing_ok = (self.marketing_approval_status in 
                       [ApprovalStatusChoice.APPROVED, ApprovalStatusChoice.NOT_REQUIRED])
        return sales_ok and marketing_ok

    def get_pending_approvals(self):
        """Get list of pending approval types."""
        pending = []
        if self.sales_approval_status == ApprovalStatusChoice.PENDING:
            pending.append('sales')
        if self.marketing_approval_status == ApprovalStatusChoice.PENDING:
            pending.append('marketing')
        return pending

    def get_required_marketing_users(self):
        """
        Get set of unique Marketing users (mktg_admin) required to process this request.
        Returns User objects for all items that have a mktg_admin assigned.
        """
        users = set()
        for item in self.items.select_related('variant__catalogue_item__mktg_admin').all():
            mktg_admin = item.variant.catalogue_item.mktg_admin
            if mktg_admin:
                users.add(mktg_admin)
        return users

    def get_items_for_marketing_user(self, user):
        """
        Get items assigned to a specific Marketing user.
        Returns QuerySet of RedemptionRequestItem where the item's mktg_admin == user.
        """
        return self.items.filter(variant__catalogue_item__mktg_admin=user)

    def get_items_pending_processing(self, user):
        """
        Get items assigned to this Marketing user that haven't been processed yet.
        """
        return self.items.filter(
            variant__catalogue_item__mktg_admin=user,
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
            variant__catalogue_item__mktg_admin__isnull=False
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
            variant__catalogue_item__mktg_admin__isnull=False
        ).select_related('variant__catalogue_item__mktg_admin', 'item_processed_by')
        
        total = items_with_mktg.count()
        processed = items_with_mktg.filter(item_processed_by__isnull=False).count()
        
        # Group by marketing user
        user_status = {}
        for item in items_with_mktg:
            mktg_user = item.variant.catalogue_item.mktg_admin
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
    variant = models.ForeignKey(
        Variant,
        on_delete=models.CASCADE,
        related_name='redemption_items',
        help_text='The catalogue item variant being redeemed'
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
    
    # Dynamic pricing fields - snapshots from variant at request time
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
        return f"{self.quantity}x {self.variant} for Request #{self.request.id}"

    class Meta:
        verbose_name = "Redemption Request Item"
        verbose_name_plural = "Redemption Request Items"
        ordering = ['id']
