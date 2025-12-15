from django.db import models
from django.utils import timezone
from django.conf import settings
from distributers.models import Distributor
from items_catalogue.models import Variant

class PointsDeductionChoice(models.TextChoices):
    SELF = 'SELF', 'Self (Sales Agent)'
    DISTRIBUTOR = 'DISTRIBUTOR', 'Distributor'

class RequestStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'

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
        help_text='Current status of the request'
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
        help_text='User who approved or rejected this request'
    )
    date_reviewed = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Date and time when the request was reviewed'
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

    def __str__(self):
        return f"Request #{self.id} by {self.requested_by.username} for {self.requested_for.name}"

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
        help_text='Number of units requested'
    )
    points_per_item = models.PositiveIntegerField(
        help_text='Points per item at the time of request (snapshot)'
    )
    total_points = models.PositiveIntegerField(
        help_text='Total points for this line item (quantity × points_per_item)'
    )

    def save(self, *args, **kwargs):
        # Automatically calculate total_points if not provided
        if not self.total_points:
            self.total_points = self.quantity * self.points_per_item
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity}x {self.variant} for Request #{self.request.id}"

    class Meta:
        verbose_name = "Redemption Request Item"
        verbose_name_plural = "Redemption Request Items"
        ordering = ['id']
