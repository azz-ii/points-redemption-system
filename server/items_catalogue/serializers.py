from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product

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
    
    class Meta:
        model = Product
        fields = [
            'id', 'item_code', 'item_name', 'legend', 'category',
            'description', 'purpose', 'specifications',
            'points', 'price', 'pricing_type',
            'min_order_qty', 'max_order_qty',
            'has_stock', 'stock', 'committed_stock', 'available_stock',
            'mktg_admin', 'requires_sales_approval',
            'date_added', 'added_by', 'is_archived', 'date_archived', 'archived_by'
        ]
        extra_kwargs = {
            'item_code': {'required': True},
            'item_name': {'required': True},
            'points': {'required': True},
            'price': {'required': True},
        }


class ProductInventorySerializer(serializers.ModelSerializer):
    """Serializer for Product with inventory-focused fields"""
    available_stock = serializers.IntegerField(read_only=True)
    stock_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'item_code', 'item_name', 'legend', 'category',
            'points', 'price', 'pricing_type',
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
