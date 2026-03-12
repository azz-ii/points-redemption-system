from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'sales_channel', 'is_prospect', 'is_archived', 'date_added', 'added_by']
    list_filter = ['is_prospect', 'is_archived', 'sales_channel']
    search_fields = ['name', 'brand', 'sales_channel']
    readonly_fields = ['date_added', 'date_archived', 'archived_by']
    ordering = ['name']
