from django.contrib import admin
from .models import Distributor


@admin.register(Distributor)
class DistributorAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'sales_channel', 'points', 'is_archived', 'date_added', 'added_by']
    list_filter = ['is_archived', 'sales_channel']
    search_fields = ['name', 'brand', 'sales_channel']
    readonly_fields = ['date_added', 'date_archived', 'archived_by']
    ordering = ['name']
