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
    item_code = models.TextField(help_text="Item code(s), can be multiple separated by commas (e.g., '[ MC0001 ]' or '[01345, 01346, 01347, 01348]')")
    description = models.TextField(help_text="Detailed description of the item")
    purpose = models.TextField(help_text="Purpose of the item")
    specifications = models.TextField(help_text="Specifications of the item")
    options = models.TextField(blank=True, null=True, help_text="Available options (e.g., sizes, colors, variants)")
    points = models.CharField(max_length=100, help_text="Points required (can be numeric or formula like '1/inv amt')")
    price = models.CharField(max_length=100, help_text="Price (e.g., '₱130.00' or 'P0.50/inv amt.')")
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
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text='URL to the item image')

    def __str__(self):
        return f"{self.item_name} [{self.item_code}]"

    class Meta:
        verbose_name = "Catalogue Item"
        verbose_name_plural = "Catalogue Items"
        ordering = ['item_name']