from django.db import models
from django.utils import timezone
from django.conf import settings

class ItemLegend(models.TextChoices):
    COLLATERAL = 'COLLATERAL', 'Collateral'
    GIVEAWAY = 'GIVEAWAY', 'Giveaway'
    ASSET = 'ASSET', 'Asset'
    BENEFIT = 'BENEFIT', 'Benefit'

class CatalogueItem(models.Model):
    id = models.AutoField(primary_key=True)
    reward = models.CharField(max_length=255, blank=True, null=True, help_text="Reward category, if applicable (e.g., 'SIGNAGE')")
    item_name = models.CharField(max_length=255, help_text="Name of the item (e.g., 'PLATINUM SHIRT')")
    description = models.TextField(help_text="Detailed description of the item")
    purpose = models.TextField(help_text="Purpose of the item")
    specifications = models.TextField(help_text="Specifications of the item")
    legend = models.CharField(
        max_length=20,
        choices=ItemLegend.choices,
        default=ItemLegend.GIVEAWAY,
        help_text="Category legend: Collateral (red), Giveaway (blue), Asset (yellow), Benefit (green)"
    )
    date_added = models.DateField(default=timezone.now, help_text="Date the item was added to the catalogue")
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='added_items',
        help_text='User who added this catalogue item'
    )
    mktg_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mktg_admin_items',
        help_text='Marketing admin assigned to this catalogue item'
    )
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approver_items',
        help_text='Approver assigned to this catalogue item'
    )
    is_archived = models.BooleanField(default=False, help_text='Whether the item is archived')
    date_archived = models.DateTimeField(blank=True, null=True, help_text='Timestamp when the item was archived')
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='archived_items',
        help_text='User who archived this catalogue item'
    )

    def __str__(self):
        return f"{self.item_name}"

    class Meta:
        verbose_name = "Catalogue Item"
        verbose_name_plural = "Catalogue Items"
        ordering = ['item_name']

class Variant(models.Model):
    catalogue_item = models.ForeignKey(CatalogueItem, on_delete=models.CASCADE, related_name='variants')
    item_code = models.CharField(max_length=50, unique=True, help_text="Unique code for this variant (e.g., '01345')")
    option_description = models.CharField(max_length=100, blank=True, null=True, help_text="Description of the variant (e.g., 'S', 'Blue S')")
    points = models.CharField(max_length=100, help_text="Points required (can be numeric or formula like '1/inv amt')")
    price = models.CharField(max_length=100, help_text="Price (e.g., '₱130.00' or 'P0.50/inv amt.')")
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text='URL to the variant image')
    stock = models.IntegerField(default=0, help_text='Current stock quantity available')
    reorder_level = models.IntegerField(default=10, help_text='Stock level at which to trigger low stock alert')

    def __str__(self):
        return f"{self.catalogue_item.item_name} - {self.item_code} ({self.option_description})"

    class Meta:
        verbose_name = "Variant"
        verbose_name_plural = "Variants"
        unique_together = ('catalogue_item', 'item_code')
        ordering = ['item_code']