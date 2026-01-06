from django.contrib import admin
from .models import CatalogueItem, Variant


@admin.register(CatalogueItem)
class CatalogueItemAdmin(admin.ModelAdmin):
    list_display = ['item_name', 'legend', 'date_added', 'is_archived']
    list_filter = ['legend', 'is_archived']
    search_fields = ['item_name', 'description', 'reward']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('reward', 'item_name')
        }),
        ('Details', {
            'fields': ('description', 'purpose', 'specifications')
        }),
        ('Category', {
            'fields': ('legend',)
        }),
        ('Archiving', {
            'fields': ('is_archived', 'date_archived', 'archived_by')
        }),
    )


@admin.register(Variant)
class VariantAdmin(admin.ModelAdmin):
    list_display = ['item_code', 'catalogue_item', 'option_description', 'stock', 'reorder_level', 'points', 'price']
    list_filter = ['catalogue_item__legend']
    search_fields = ['item_code', 'option_description', 'catalogue_item__item_name']
    list_editable = ['stock', 'reorder_level']
    ordering = ['catalogue_item__item_name', 'item_code']
    
    fieldsets = (
        ('Product Information', {
            'fields': ('catalogue_item', 'item_code', 'option_description')
        }),
        ('Pricing', {
            'fields': ('points', 'price')
        }),
        ('Inventory', {
            'fields': ('stock', 'reorder_level')
        }),
        ('Media', {
            'fields': ('image_url',)
        }),
    )
