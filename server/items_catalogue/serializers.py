from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import Product, StockAuditLog, ProductExtraField

User = get_user_model()


class RelativeImageField(serializers.ImageField):
    """Always return a relative URL (/media/...) instead of an absolute one.

    DRF's default ImageField builds absolute URLs using the request host,
    which resolves to localhost:8000 behind the IIS reverse proxy.  Remote
    browsers can't reach that address, so images break.  Returning a
    host-relative path lets the browser resolve it against the current
    origin (e.g. points-redemption.n01tb.com).
    """

    def to_representation(self, value):
        if not value:
            return None
        return f"{settings.MEDIA_URL}{value.name}"


class UserRelatedField(serializers.PrimaryKeyRelatedField):
    def to_representation(self, value):
        try:
            return value.id
        except Exception:
            return None


class ProductExtraFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductExtraField
        fields = ['field_key', 'label', 'field_type', 'choices_json', 'is_required', 'display_order']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for the flat Product model"""
    added_by = UserRelatedField(read_only=True)
    archived_by = UserRelatedField(read_only=True)
    available_stock = serializers.IntegerField(read_only=True)
    request_count = serializers.IntegerField(read_only=True, default=0)
    mktg_admin_username = serializers.SerializerMethodField()
    image = RelativeImageField(required=False, allow_null=True)
    extra_fields = ProductExtraFieldSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'id', 'item_code', 'item_name', 'legend', 'category',
            'description', 'purpose', 'specifications',
            'points', 'price', 'pricing_formula', 'points_multiplier',
            'min_order_qty', 'max_order_qty',
            'has_stock', 'stock', 'committed_stock', 'available_stock',
            'mktg_admin', 'mktg_admin_username', 'requires_sales_approval',
            'image',
            'date_added', 'added_by', 'is_archived', 'date_archived', 'archived_by',
            'request_count', 'extra_fields'
        ]
        extra_kwargs = {
            'item_code': {'required': True},
            'item_name': {'required': True},
            'points': {'required': True},
            'price': {'required': True},
        }

    def to_internal_value(self, data):
        # Handle FormData where extra_fields could be a stringified JSON array
        if 'extra_fields' in data and isinstance(data['extra_fields'], str):
            import json
            try:
                # Copy immutable QueryDict if necessary
                mutable_data = data.copy() if hasattr(data, 'copy') else data
                mutable_data['extra_fields'] = json.loads(data['extra_fields'])
                data = mutable_data
            except (json.JSONDecodeError, TypeError, AttributeError):
                pass # Unparseable JSON, let DRF validation handle it normally
        return super().to_internal_value(data)

    def create(self, validated_data):
        extra_fields_data = validated_data.pop('extra_fields', [])
        product = super().create(validated_data)
        for extra_field_data in extra_fields_data:
            ProductExtraField.objects.create(product=product, **extra_field_data)
        return product

    def update(self, instance, validated_data):
        # Prevent direct stock edits via catalogue endpoint — stock is managed via inventory API
        validated_data.pop('stock', None)
        
        extra_fields_data = validated_data.pop('extra_fields', None)
        instance = super().update(instance, validated_data)

        if extra_fields_data is not None:
            instance.extra_fields.all().delete()
            for extra_field_data in extra_fields_data:
                ProductExtraField.objects.create(product=instance, **extra_field_data)
                
        return instance

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
            'points', 'price', 'pricing_formula', 'points_multiplier',
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
