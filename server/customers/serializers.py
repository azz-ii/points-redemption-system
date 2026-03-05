from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    added_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'brand', 'sales_channel',
            'date_added', 
            'added_by', 'added_by_name',
            'is_prospect',
            'is_archived', 'date_archived', 'archived_by'
        ]
        read_only_fields = ['id', 'date_added', 'added_by', 'added_by_name', 'is_prospect', 'is_archived', 'date_archived', 'archived_by']
    
    def get_added_by_name(self, obj):
        """
        Get the full name from the user's profile, with fallbacks.
        """
        if not obj.added_by:
            return None
        
        # Try to get full_name from UserProfile
        if hasattr(obj.added_by, 'profile') and obj.added_by.profile:
            return obj.added_by.profile.full_name or obj.added_by.username
        
        # Fallback to username if profile doesn't exist
        return obj.added_by.username


class ProspectCustomerSerializer(serializers.ModelSerializer):
    """Lightweight serializer for creating prospect customers (name only)."""
    class Meta:
        model = Customer
        fields = ['id', 'name', 'is_prospect']
        read_only_fields = ['id', 'is_prospect']
