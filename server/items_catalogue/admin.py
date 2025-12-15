from django.contrib import admin
from .models import CatalogueItem


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
