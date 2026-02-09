from django.contrib import admin
from .models import PointsAuditLog


@admin.register(PointsAuditLog)
class PointsAuditLogAdmin(admin.ModelAdmin):
    list_display = ('entity_type', 'entity_name', 'action_type', 'points_delta', 'previous_points', 'new_points', 'changed_by', 'created_at')
    list_filter = ('entity_type', 'action_type', 'created_at')
    search_fields = ('entity_name', 'reason')
    readonly_fields = ('entity_type', 'entity_id', 'entity_name', 'previous_points', 'new_points', 'points_delta', 'action_type', 'changed_by', 'reason', 'batch_id', 'created_at')
    ordering = ('-created_at',)
