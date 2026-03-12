from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile, LoginAttempt


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    fk_name = 'user'
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = (
        'full_name', 'email', 'position',
        'is_activated', 'uses_points', 'points', 'can_self_request',
        'is_archived', 'date_archived', 'archived_by',
    )
    readonly_fields = ('date_archived', 'archived_by')


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'get_full_name_display', 'get_email_display', 'get_position', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'profile__position')
    search_fields = ('username', 'profile__full_name', 'profile__email')

    def get_full_name_display(self, obj):
        return obj.profile.full_name if hasattr(obj, 'profile') else '-'
    get_full_name_display.short_description = 'Full Name'

    def get_email_display(self, obj):
        return obj.profile.email if hasattr(obj, 'profile') else '-'
    get_email_display.short_description = 'Email'

    def get_position(self, obj):
        return obj.profile.position if hasattr(obj, 'profile') else '-'
    get_position.short_description = 'Position'


# Re-register User with extended admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'email', 'position', 'is_activated', 'is_archived', 'points', 'created_at']
    list_filter = ['position', 'is_activated', 'is_archived', 'uses_points']
    search_fields = ['user__username', 'full_name', 'email']
    readonly_fields = ['created_at', 'updated_at', 'date_archived', 'archived_by']

    fieldsets = (
        ('User Information', {
            'fields': ('user', 'full_name', 'email')
        }),
        ('Role & Status', {
            'fields': ('position', 'is_activated', 'uses_points', 'points', 'can_self_request')
        }),
        ('Archive', {
            'fields': ('is_archived', 'date_archived', 'archived_by'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ['username', 'ip_address', 'attempted_at']
    list_filter = ['attempted_at']
    search_fields = ['username', 'ip_address']
    readonly_fields = ['username', 'ip_address', 'attempted_at']
    ordering = ['-attempted_at']
    actions = ['clear_attempts']

    def clear_attempts(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'{count} login attempt record(s) deleted.')
    clear_attempts.short_description = 'Delete selected login attempts (unlocks account)'
