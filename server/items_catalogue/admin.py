from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['item_code', 'item_name', 'category', 'legend', 'has_stock', 'stock', 'committed_stock', 'points', 'price', 'is_archived']
    list_filter = ['legend', 'has_stock', 'is_archived', 'pricing_type']
    search_fields = ['item_code', 'item_name', 'description', 'category']
    list_editable = ['stock', 'has_stock']
    ordering = ['item_name', 'item_code']
    
    fieldsets = (
        ('Identification', {
            'fields': ('item_code', 'item_name', 'category')
        }),
        ('Category', {
            'fields': ('legend',)
        }),
        ('Details', {
            'fields': ('description', 'purpose', 'specifications')
        }),
        ('Pricing', {
            'fields': ('points', 'price', 'pricing_type')
        }),
        ('Inventory', {
            'fields': ('has_stock', 'stock', 'committed_stock'),
            'description': 'Set "Has stock" to False for made-to-order items that don\'t track inventory.'
        }),
        ('Audit', {
            'fields': ('date_added', 'added_by', 'is_archived', 'date_archived', 'archived_by')
        }),
    )

