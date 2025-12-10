from django.contrib import admin
from .models import CatalogueItem


@admin.register(CatalogueItem)
class CatalogueItemAdmin(admin.ModelAdmin):
    list_display = ['item_code', 'item_name', 'legend', 'points', 'price']
    list_filter = ['legend']
    search_fields = ['item_name', 'item_code', 'description', 'reward']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('reward', 'item_name', 'item_code')
        }),
        ('Details', {
            'fields': ('description', 'purpose', 'specifications', 'options')
        }),
        ('Pricing & Category', {
            'fields': ('points', 'price', 'legend')
        }),
    )
