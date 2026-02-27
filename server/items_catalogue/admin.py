from django.contrib import admin
from .models import Product, StockAuditLog


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['item_code', 'item_name', 'category', 'legend', 'has_stock', 'stock', 'committed_stock', 'points', 'price', 'is_archived']
    list_filter = ['legend', 'has_stock', 'is_archived', 'pricing_type']
    search_fields = ['item_code', 'item_name', 'description', 'category']
    list_editable = ['has_stock']
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


@admin.register(StockAuditLog)
class StockAuditLogAdmin(admin.ModelAdmin):
    list_display = ['product_name', 'adjustment_type', 'previous_stock', 'new_stock', 'stock_delta', 'reason', 'changed_by', 'created_at']
    list_filter = ['adjustment_type', 'created_at']
    search_fields = ['product_name', 'reason']
    readonly_fields = ['product', 'product_name', 'previous_stock', 'new_stock', 'stock_delta', 'adjustment_type', 'reason', 'changed_by', 'batch_id', 'created_at']
    ordering = ['-created_at']

