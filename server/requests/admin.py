from django.contrib import admin
from .models import RedemptionRequest, RedemptionRequestItem


class RedemptionRequestItemInline(admin.TabularInline):
    model = RedemptionRequestItem
    extra = 0
    fields = ('variant', 'quantity', 'points_per_item', 'total_points')
    readonly_fields = ('total_points',)


@admin.register(RedemptionRequest)
class RedemptionRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'requested_by', 'requested_for', 'status', 'total_points', 'date_requested', 'reviewed_by')
    list_filter = ('status', 'points_deducted_from', 'date_requested')
    search_fields = ('requested_by__username', 'requested_for__name')
    readonly_fields = ('date_requested', 'date_reviewed')
    inlines = [RedemptionRequestItemInline]
    
    fieldsets = (
        ('Request Information', {
            'fields': ('requested_by', 'requested_for', 'points_deducted_from', 'total_points', 'date_requested')
        }),
        ('Status', {
            'fields': ('status', 'reviewed_by', 'date_reviewed')
        }),
        ('Notes', {
            'fields': ('remarks', 'rejection_reason')
        }),
    )


@admin.register(RedemptionRequestItem)
class RedemptionRequestItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'request', 'variant', 'quantity', 'points_per_item', 'total_points')
    list_filter = ('request__status',)
    search_fields = ('request__id', 'variant__item_code', 'variant__catalogue_item__item_name')
    readonly_fields = ('total_points',)
