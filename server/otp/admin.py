from django.contrib import admin
from .models import OTP

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'email', 'is_valid', 'created_at', 'expires_at']
    list_filter = ['is_valid', 'created_at']
    search_fields = ['user__username', 'email', 'code']
    readonly_fields = ['created_at', 'expires_at', 'used_at']
