from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CatalogueItem, Variant

User = get_user_model()


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
        fields = [
            'id', 'item_code', 'option_description', 'points', 'price', 'image_url', 
            'stock', 'reorder_level', 'pricing_type', 'points_multiplier', 'price_multiplier'
        ]
        extra_kwargs = {
            'item_code': {'required': True},
            'points': {'required': True},
            'price': {'required': True},
        }


class CatalogueItemSerializer(serializers.ModelSerializer):
    """Serializer for CatalogueItem model"""
    added_by = UserRelatedField(read_only=True)
    archived_by = UserRelatedField(read_only=True)
    mktg_admin = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    approver = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    mktg_admin_name = serializers.SerializerMethodField()
    approver_name = serializers.SerializerMethodField()
    variants = VariantNestedSerializer(many=True, read_only=True)
    
    def get_mktg_admin_name(self, obj):
        if not obj.mktg_admin:
            return None
        if hasattr(obj.mktg_admin, 'profile') and obj.mktg_admin.profile:
            return obj.mktg_admin.profile.full_name or obj.mktg_admin.username
        return obj.mktg_admin.username
    
    def get_approver_name(self, obj):
        if not obj.approver:
            return None
        if hasattr(obj.approver, 'profile') and obj.approver.profile:
            return obj.approver.profile.full_name or obj.approver.username
        return obj.approver.username
    
    class Meta:
        model = CatalogueItem
        fields = [
            'id', 'reward', 'item_name', 'description',
            'purpose', 'specifications', 'legend', 'approval_type', 'needs_driver',
            'added_by', 'mktg_admin', 'mktg_admin_name', 'approver', 'approver_name',
            'is_archived', 'date_archived', 'archived_by', 'variants'
        ]


class BulkApprovalTypeSerializer(serializers.Serializer):
    """Serializer for bulk updating approval_type on multiple items"""
    item_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text='List of catalogue item IDs to update'
    )
    legend = serializers.ChoiceField(
        choices=['COLLATERAL', 'GIVEAWAY', 'ASSET', 'BENEFIT'],
        required=False,
        help_text='Update all items with this legend'
    )
    approval_type = serializers.ChoiceField(
        choices=['SALES', 'MARKETING', 'BOTH'],
        required=True,
        help_text='The approval type to set'
    )
    
    def validate(self, data):
        if not data.get('item_ids') and not data.get('legend'):
            raise serializers.ValidationError(
                "Either 'item_ids' or 'legend' must be provided"
            )
        return data


class VariantSerializer(serializers.ModelSerializer):
    """Serializer for Variant model with nested CatalogueItem"""
    catalogue_item = CatalogueItemSerializer(read_only=True)
    catalogue_item_id = serializers.IntegerField(write_only=True, required=True)
    
    class Meta:
        model = Variant
        fields = [
            'id', 'catalogue_item', 'catalogue_item_id', 'item_code', 'option_description',
            'points', 'price', 'image_url', 'stock', 'reorder_level',
            'pricing_type', 'points_multiplier', 'price_multiplier'
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


class InventoryVariantSerializer(serializers.ModelSerializer):
    """Serializer for Variant with inventory-focused fields"""
    item_name = serializers.CharField(source='catalogue_item.item_name', read_only=True)
    legend = serializers.CharField(source='catalogue_item.legend', read_only=True)
    catalogue_item_id = serializers.IntegerField(source='catalogue_item.id', read_only=True)
    stock_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Variant
        fields = [
            'id', 'catalogue_item_id', 'item_name', 'item_code', 'option_description',
            'points', 'price', 'image_url', 'stock', 'reorder_level', 'legend', 'stock_status',
            'pricing_type', 'points_multiplier', 'price_multiplier'
        ]
    
    def get_stock_status(self, obj):
        """Calculate stock status based on stock and reorder_level"""
        if obj.stock == 0:
            return 'Out of Stock'
        elif obj.stock <= obj.reorder_level:
            return 'Low Stock'
        else:
            return 'In Stock'
