from rest_framework import serializers
from .models import Distributor

class DistributorSerializer(serializers.ModelSerializer):
    added_by_name = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Distributor
        fields = [
            'id', 'name', 'contact_email', 'phone', 'location', 
            'region', 'points', 'team', 'team_name', 'date_added', 
            'added_by', 'added_by_name'
        ]
        read_only_fields = ['id', 'date_added', 'added_by', 'added_by_name', 'team_name']
    
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
    
    def get_team_name(self, obj):
        """
        Get the team name if distributor is assigned to a team.
        """
        if obj.team:
            return obj.team.name
        return None
    
    def create(self, validated_data):
        # Set the added_by field to the current user
        validated_data['added_by'] = self.context['request'].user
        return super().create(validated_data)