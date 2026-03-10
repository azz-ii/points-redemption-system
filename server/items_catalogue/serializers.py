from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product, StockAuditLog

User = get_user_model()


class UserRelatedField(serializers.PrimaryKeyRelatedField):
    def to_representation(self, value):
        try:
            return value.id
        except Exception:
            return None


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for the flat Product model"""
    added_by = UserRelatedField(read_only=True)
    archived_by = UserRelatedField(read_only=True)
    available_stock = serializers.IntegerField(read_only=True)
    request_count = serializers.IntegerField(read_only=True, default=0)
    mktg_admin_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'item_code', 'item_name', 'legend', 'category',
            'description', 'purpose', 'specifications',
            'points', 'price', 'pricing_type', 'points_multiplier',
            'min_order_qty', 'max_order_qty',
            'has_stock', 'stock', 'committed_stock', 'available_stock',
            'mktg_admin', 'mktg_admin_username', 'requires_sales_approval',
            'image',
            'date_added', 'added_by', 'is_archived', 'date_archived', 'archived_by',
            'request_count',
        ]
        extra_kwargs = {
            'item_code': {'required': True},
            'item_name': {'required': True},
            'points': {'required': True},
            'price': {'required': True},
        }

    def update(self, instance, validated_data):
        # Prevent direct stock edits via catalogue endpoint — stock is managed via inventory API
        validated_data.pop('stock', None)
        return super().update(instance, validated_data)

    def get_mktg_admin_username(self, obj):
        if obj.mktg_admin:
            profile = getattr(obj.mktg_admin, 'profile', None)
            return (profile.full_name if profile and profile.full_name else None) or obj.mktg_admin.username
        return None


class ProductInventorySerializer(serializers.ModelSerializer):
    """Serializer for Product with inventory-focused fields"""
    available_stock = serializers.IntegerField(read_only=True)
    stock_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'item_code', 'item_name', 'legend', 'category',
            'points', 'price', 'pricing_type', 'points_multiplier',
            'min_order_qty', 'max_order_qty',
            'has_stock', 'stock', 'committed_stock', 'available_stock',
            'stock_status'
        ]
    
    def get_stock_status(self, obj):
        """Calculate stock status for inventory-tracked items only."""
        available = obj.available_stock
        if available == 0:
            return 'Out of Stock'
        elif available <= 10:  # Fixed threshold since reorder_level doesn't exist
            return 'Low Stock'
        else:
            return 'In Stock'


class StockAuditLogSerializer(serializers.ModelSerializer):
    changed_by_username = serializers.SerializerMethodField()

    class Meta:
        model = StockAuditLog
        fields = [
            'id', 'product', 'product_name', 'previous_stock', 'new_stock',
            'stock_delta', 'adjustment_type', 'reason', 'changed_by_username',
            'batch_id', 'created_at',
        ]

    def get_changed_by_username(self, obj):
        return obj.changed_by.username if obj.changed_by else "System"
