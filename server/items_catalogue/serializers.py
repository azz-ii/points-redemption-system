from rest_framework import serializers
from .models import CatalogueItem


class CatalogueItemSerializer(serializers.ModelSerializer):
    """Serializer for CatalogueItem model"""
    
    class Meta:
        model = CatalogueItem
        fields = [
            'id', 'reward', 'item_name', 'item_code', 'description', 
            'purpose', 'specifications', 'options', 'points', 'price', 'legend'
        ]
        
    def validate_item_name(self, value):
        """Ensure item name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Item name cannot be empty")
        return value.strip()
    
    def validate_points(self, value):
        """Validate points field"""
        if not value or not value.strip():
            raise serializers.ValidationError("Points field cannot be empty")
        return value.strip()
