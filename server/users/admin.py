from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'email', 'position', 'is_activated', 'is_banned', 'created_at']
    list_filter = ['position', 'is_activated', 'is_banned']
    search_fields = ['user__username', 'full_name', 'email', 'position']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'full_name', 'email')
        }),
        ('Role & Status', {
            'fields': ('position', 'is_activated', 'is_banned')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
