from django.db import models
from django.utils import timezone
from django.conf import settings


class ItemLegend(models.TextChoices):
    GIVEAWAY = 'GIVEAWAY', 'Giveaway'
    MERCH = 'MERCH', 'Merch'
    PROMO = 'PROMO', 'Promo'
    AD_MATERIALS = 'AD_MATERIALS', 'Ad Materials'
    POINT_OF_SALE = 'POINT_OF_SALE', 'Point of Sale'
    OTHERS = 'OTHERS', 'Others'


class PricingType(models.TextChoices):
    """Pricing types for dynamic point/price calculation"""
    FIXED = 'FIXED', 'Fixed'
    PER_SQFT = 'PER_SQFT', 'Per Sq Ft'
    PER_INVOICE = 'PER_INVOICE', 'Per Invoice'
    PER_DAY = 'PER_DAY', 'Per Day'
    PER_EU_SRP = 'PER_EU_SRP', 'Per EU SRP'


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
    
    # Pricing
    points = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pricing_type = models.CharField(
        max_length=20,
        choices=PricingType.choices,
        default=PricingType.FIXED
    )
    
    # Stock management
    stock = models.PositiveIntegerField(default=0)
    committed_stock = models.PositiveIntegerField(default=0)
    
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
        """Returns stock available for new requests (stock minus committed)"""
        return max(0, self.stock - self.committed_stock)
    
    def commit_stock(self, quantity):
        """Reserve stock for a pending request"""
        self.committed_stock += quantity
        self.save(update_fields=['committed_stock'])
    
    def uncommit_stock(self, quantity):
        """Release reserved stock (on rejection/cancellation)"""
        self.committed_stock = max(0, self.committed_stock - quantity)
        self.save(update_fields=['committed_stock'])
    
    def deduct_stock(self, quantity):
        """Deduct actual stock and release committed (on processing)"""
        self.stock -= quantity
        self.committed_stock = max(0, self.committed_stock - quantity)
        self.save(update_fields=['stock', 'committed_stock'])
    
    def __str__(self):
        return f"{self.item_name} ({self.item_code})"
    
    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ['item_name']