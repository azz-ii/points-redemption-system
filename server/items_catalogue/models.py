import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings


class ItemLegend(models.TextChoices):
    COLLATERAL = 'Collateral', 'Collateral'
    GIVEAWAY = 'Giveaway', 'Giveaway'
    ASSET = 'Asset', 'Asset'
    BENEFIT = 'Benefit', 'Benefit'



class PricingFormula(models.TextChoices):
    NONE = 'NONE', 'None (use standard pricing)'
    PER_SQFT = 'PER_SQFT', 'Per Square Foot (sqft × multiplier)'
    PER_INVOICE = 'PER_INVOICE', 'Per Invoice (amount × multiplier)'
    PER_DAY = 'PER_DAY', 'Per Day (days × multiplier)'
    DRIVER_MULTIPLIER = 'DRIVER_MULTIPLIER', 'Driver Multiplier (2x if with driver)'
    AREA_RATE = 'AREA_RATE', 'Area Rate (L × W × H × rate)'


class Product(models.Model):
    """
    Flat product model - each product is independent (no parent-variant hierarchy).
    Example: "Shirt - Small", "Shirt - Medium" are separate products.
    """
    # Identification
    item_code = models.CharField(max_length=50, unique=True)
    item_name = models.CharField(max_length=255)
    
    # Description fields
    description = models.TextField(blank=True, default='')
    purpose = models.TextField(blank=True, default='')
    specifications = models.TextField(blank=True, default='')
    
    # Categories
    legend = models.CharField(
        max_length=20,
        choices=ItemLegend.choices,
        default=ItemLegend.GIVEAWAY
    )
    category = models.CharField(max_length=100, blank=True, default='')
    
    # Marketing assignment - marketing user responsible for processing items of this legend
    mktg_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mktg_admin_products',
        help_text='Marketing admin assigned to process this product'
    )
    
    # Approval requirements
    requires_sales_approval = models.BooleanField(
        default=True,
        help_text='Whether requests containing this product require sales approver approval. If False, skips directly to marketing processing.'
    )
    
    # Pricing
    points = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pricing_formula = models.CharField(
        max_length=30,
        choices=PricingFormula.choices,
        default=PricingFormula.NONE,
        help_text='Pre-built formula for computing points from extra field inputs'
    )
    points_multiplier = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Rate for dynamic pricing (e.g. 25 for "25 pts per sq ft"). Unused for FIXED pricing.'
    )
    
    # Order quantity limits
    min_order_qty = models.PositiveIntegerField(
        default=1,
        help_text='Minimum quantity per order. Default is 1.'
    )
    max_order_qty = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Maximum quantity per order. Null means unlimited.'
    )
    
    # Stock management
    has_stock = models.BooleanField(
        default=True,
        help_text='Whether this item tracks inventory. False for made-to-order items.'
    )
    stock = models.PositiveIntegerField(default=0)
    committed_stock = models.PositiveIntegerField(default=0)
    
    # Image
    image = models.ImageField(
        upload_to='catalogue_images/%Y/%m/',
        blank=True,
        null=True,
        help_text='Product image (max 5MB, PNG/JPG/WebP)'
    )

    # Audit fields
    is_archived = models.BooleanField(default=False)
    date_added = models.DateTimeField(auto_now_add=True)
    date_archived = models.DateTimeField(blank=True, null=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products_added'
    )
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products_archived'
    )
    
    @property
    def available_stock(self):
        """Returns stock available for new requests (stock minus committed).
        For items without stock tracking (has_stock=False), returns unlimited (999999).
        """
        if not self.has_stock:
            return 999999  # Unlimited for made-to-order items
        return max(0, self.stock - self.committed_stock)
    
    def commit_stock(self, quantity):
        """Reserve stock for a pending request. No-op for items without stock tracking."""
        if not self.has_stock:
            return  # No stock tracking for made-to-order items
        self.committed_stock += quantity
        self.save(update_fields=['committed_stock'])
    
    def uncommit_stock(self, quantity):
        """Release reserved stock (on rejection/cancellation). No-op for items without stock tracking."""
        if not self.has_stock:
            return  # No stock tracking for made-to-order items
        self.committed_stock = max(0, self.committed_stock - quantity)
        self.save(update_fields=['committed_stock'])
    
    def deduct_stock(self, quantity):
        """Deduct actual stock and release committed (on processing). No-op for items without stock tracking."""
        if not self.has_stock:
            return  # No stock tracking for made-to-order items
        self.stock -= quantity
        self.committed_stock = max(0, self.committed_stock - quantity)
        self.save(update_fields=['stock', 'committed_stock'])


class FieldType(models.TextChoices):
    TEXT = 'TEXT', 'Text'
    NUMBER = 'NUMBER', 'Number'
    CHOICE = 'CHOICE', 'Choice (Dropdown)'


class ProductExtraField(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='extra_fields')
    field_key = models.SlugField(max_length=50)       # e.g. "driver_name", "length"
    label = models.CharField(max_length=100)            # e.g. "Driver Name", "Length (ft)"
    field_type = models.CharField(max_length=10, choices=FieldType.choices)
    choices_json = models.JSONField(blank=True, null=True)  # for CHOICE type: ["WITH_DRIVER","WITHOUT_DRIVER"]
    is_required = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"{self.product.item_name} - {self.label}"


class StockAuditLog(models.Model):
    """Tracks all manual stock changes for inventory-tracked products."""

    class AdjustmentType(models.TextChoices):
        ADD = 'ADD', 'Add Stock'
        DECREASE = 'DECREASE', 'Decrease Stock'
        BULK_ADD = 'BULK_ADD', 'Bulk Add'
        BULK_DECREASE = 'BULK_DECREASE', 'Bulk Decrease'
        BULK_RESET = 'BULK_RESET', 'Bulk Reset'

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='stock_audit_logs',
    )
    product_name = models.CharField(max_length=255, help_text='Denormalized name for display')
    previous_stock = models.PositiveIntegerField()
    new_stock = models.PositiveIntegerField()
    stock_delta = models.IntegerField(help_text='new_stock - previous_stock')
    adjustment_type = models.CharField(max_length=20, choices=AdjustmentType.choices)
    reason = models.TextField(blank=True, default='', help_text='Required for stock decreases')
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_audit_logs',
        help_text='The user who made the change',
    )
    batch_id = models.UUIDField(
        null=True,
        blank=True,
        help_text='Groups records from a single bulk/batch API call',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'stock_audit_log'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product'], name='idx_stock_product'),
            models.Index(fields=['created_at'], name='idx_stock_created_at'),
            models.Index(fields=['batch_id'], name='idx_stock_batch_id'),
            models.Index(fields=['changed_by'], name='idx_stock_changed_by'),
        ]
        verbose_name = 'Stock Audit Log'
        verbose_name_plural = 'Stock Audit Logs'

    def __str__(self):
        return f"{self.get_adjustment_type_display()} | {self.product_name} | {self.stock_delta:+d} units"


def log_stock_change(product, previous_stock, new_stock, adjustment_type, changed_by, reason='', batch_id=None):
    """Create a single stock audit log entry."""
    return StockAuditLog.objects.create(
        product=product,
        product_name=product.item_name,
        previous_stock=previous_stock,
        new_stock=new_stock,
        stock_delta=new_stock - previous_stock,
        adjustment_type=adjustment_type,
        changed_by=changed_by,
        reason=reason,
        batch_id=batch_id,
    )


def bulk_log_stock_changes(entries):
    """Create multiple stock audit log entries efficiently using bulk_create."""
    logs = [
        StockAuditLog(
            product=e['product'],
            product_name=e['product_name'],
            previous_stock=e['previous_stock'],
            new_stock=e['new_stock'],
            stock_delta=e['new_stock'] - e['previous_stock'],
            adjustment_type=e['adjustment_type'],
            changed_by=e['changed_by'],
            reason=e.get('reason', ''),
            batch_id=e.get('batch_id'),
        )
        for e in entries
    ]
    return StockAuditLog.objects.bulk_create(logs)


def generate_stock_batch_id():
    """Generate a UUID for grouping stock audit entries from a single API call."""
    return uuid.uuid4()
    
    def __str__(self):
        return f"{self.item_name} ({self.item_code})"
    
    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ['item_name']