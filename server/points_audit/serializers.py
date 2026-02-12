from rest_framework import serializers
from .models import PointsAuditLog


class PointsAuditLogSerializer(serializers.ModelSerializer):
    changed_by_username = serializers.SerializerMethodField()
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    entity_type_display = serializers.CharField(source='get_entity_type_display', read_only=True)

    class Meta:
        model = PointsAuditLog
        fields = [
            'id',
            'entity_type',
            'entity_type_display',
            'entity_id',
            'entity_name',
            'previous_points',
            'new_points',
            'points_delta',
            'action_type',
            'action_type_display',
            'changed_by',
            'changed_by_username',
            'reason',
            'batch_id',
            'created_at',
        ]

    def get_changed_by_username(self, obj):
        if obj.changed_by:
            # Try to get full_name from profile, fall back to username
            if hasattr(obj.changed_by, 'profile') and obj.changed_by.profile.full_name:
                return obj.changed_by.profile.full_name
            return obj.changed_by.username
        return 'System'
