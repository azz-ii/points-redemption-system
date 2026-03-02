from rest_framework import serializers
from .models import Cart, CartItem
from items_catalogue.models import Product


class CartItemSerializer(serializers.ModelSerializer):
    # Write: accept product pk; read: expose it as product_id
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_archived=False),
        source='product',
    )

    class Meta:
        model = CartItem
        fields = ['product_id', 'quantity', 'dynamic_quantity', 'needs_driver']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True)

    class Meta:
        model = Cart
        fields = ['items', 'updated_at']
