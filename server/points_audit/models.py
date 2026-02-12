import uuid
from django.db import models
from django.conf import settings


class PointsAuditLog(models.Model):
    """Tracks all superadmin-initiated points changes across Users, Distributors, and Customers."""

    class EntityType(models.TextChoices):
        USER = 'USER', 'User Account'
        DISTRIBUTOR = 'DISTRIBUTOR', 'Distributor'
        CUSTOMER = 'CUSTOMER', 'Customer'

    class ActionType(models.TextChoices):
        INDIVIDUAL_SET = 'INDIVIDUAL_SET', 'Individual Set'
        BULK_DELTA = 'BULK_DELTA', 'Bulk Delta'
        BULK_RESET = 'BULK_RESET', 'Bulk Reset'

    entity_type = models.CharField(max_length=20, choices=EntityType.choices)
    entity_id = models.IntegerField(help_text='Primary key of the affected entity')
    entity_name = models.CharField(max_length=255, help_text='Denormalized name for display')
    previous_points = models.IntegerField()
    new_points = models.IntegerField()
    points_delta = models.IntegerField(help_text='new_points - previous_points')
    action_type = models.CharField(max_length=20, choices=ActionType.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='points_audit_logs',
        help_text='The superadmin who made the change'
    )
    reason = models.TextField(blank=True, default='', help_text='Optional reason/note for the change')
    batch_id = models.UUIDField(
        null=True,
        blank=True,
        help_text='Groups records from a single bulk/batch API call'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'points_audit_log'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['entity_type', 'entity_id'], name='idx_entity'),
            models.Index(fields=['created_at'], name='idx_created_at'),
            models.Index(fields=['batch_id'], name='idx_batch_id'),
            models.Index(fields=['changed_by'], name='idx_changed_by'),
        ]
        verbose_name = 'Points Audit Log'
        verbose_name_plural = 'Points Audit Logs'

    def __str__(self):
        return f"{self.get_action_type_display()} | {self.entity_type}:{self.entity_name} | {self.points_delta:+d} pts"
