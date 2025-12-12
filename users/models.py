from django.db import models
from django.utils import timezone
from django.conf import settings

class ItemLegend(models.TextChoices):
    COLLATERAL = 'COLLATERAL', 'Collateral'
    GIVEAWAY = 'GIVEAWAY', 'Giveaway'
    ASSET = 'ASSET', 'Asset'
    BENEFIT = 'BENEFIT', 'Benefit'

class CatalogueItem(models.Model):
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

    def __str__(self):
        return f"{self.item_name} [{self.item_code}]"

    class Meta:
        verbose_name = "Catalogue Item"
        verbose_name_plural = "Catalogue Items"
        ordering = ['date_added']


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    position = models.CharField(max_length=100)
    full_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(max_length=254, unique=True)
    is_activated = models.BooleanField(default=True)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.TextField(blank=True, null=True)
    ban_message = models.TextField(blank=True, null=True)
    ban_duration = models.IntegerField(blank=True, null=True, help_text='Duration (in days)')
    ban_date = models.DateTimeField(blank=True, null=True)
    unban_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name or self.user.get_username()} ({self.position})"

    class Meta:
        db_table = 'user_profiles'
        ordering = ['-created_at']
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'