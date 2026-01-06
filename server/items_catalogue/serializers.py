from rest_framework import serializers
from .models import CatalogueItem, Variant


class UserRelatedField(serializers.PrimaryKeyRelatedField):
    def to_representation(self, value):
        try:
            return value.id
        except Exception:
            return None


class VariantNestedSerializer(serializers.ModelSerializer):
    """Serializer for Variant when nested in CatalogueItem"""
    class Meta:
        model = Variant
        fields = ['item_code', 'option_description', 'points', 'price', 'image_url', 'stock', 'reorder_level']
        extra_kwargs = {
            'item_code': {'required': True},
            'points': {'required': True},
            'price': {'required': True},
        }


class CatalogueItemSerializer(serializers.ModelSerializer):
    """Serializer for CatalogueItem model"""
    added_by = UserRelatedField(read_only=True)
    archived_by = UserRelatedField(read_only=True)
    variants = VariantNestedSerializer(many=True, read_only=True)
    
    class Meta:
        model = CatalogueItem
        fields = [
            'id', 'reward', 'item_name', 'description',
            'purpose', 'specifications', 'legend',
            'added_by', 'is_archived', 'date_archived', 'archived_by', 'variants'
        ]


class VariantSerializer(serializers.ModelSerializer):
    """Serializer for Variant model with nested CatalogueItem"""
    catalogue_item = CatalogueItemSerializer(read_only=True)
    catalogue_item_id = serializers.IntegerField(write_only=True, required=True)
    
    class Meta:
        model = Variant
        fields = [
            'id', 'catalogue_item', 'catalogue_item_id', 'item_code', 'option_description',
            'points', 'price', 'image_url', 'stock', 'reorder_level'
        ]
        
    def create(self, validated_data):
        catalogue_item_id = validated_data.pop('catalogue_item_id')
        catalogue_item = CatalogueItem.objects.get(id=catalogue_item_id)
        variant = Variant.objects.create(catalogue_item=catalogue_item, **validated_data)
        return variant
    
    def validate_points(self, value):
        """Validate points field"""
        if not value or not value.strip():
            raise serializers.ValidationError("Points field cannot be empty")
        return value.strip()
    
    def validate_price(self, value):
        """Validate price field"""
        if not value or not value.strip():
            raise serializers.ValidationError("Price field cannot be empty")
        return value.strip()
        
    def validate_points(self, value):
        """Validate points field"""
        if not value or not value.strip():
            raise serializers.ValidationError("Points field cannot be empty")
        return value.strip()
    
    def validate_price(self, value):
        """Validate price field"""
        if not value or not value.strip():
            raise serializers.ValidationError("Price field cannot be empty")
        return value.strip()
