from django.contrib import admin
from .models import Team, TeamMembership


class TeamMembershipInline(admin.TabularInline):
    """Inline admin for team memberships"""
    model = TeamMembership
    extra = 1
    autocomplete_fields = ['user']
    readonly_fields = ['joined_at']
    verbose_name = 'Team Member'
    verbose_name_plural = 'Team Members'


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    """Admin interface for Team model"""
    list_display = ['name', 'approver_name', 'marketing_admin_name', 'member_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'approver__profile__full_name', 'approver__username', 'marketing_admin__profile__full_name', 'marketing_admin__username']
    autocomplete_fields = ['approver', 'marketing_admin']
    inlines = [TeamMembershipInline]
    readonly_fields = ['created_at', 'updated_at', 'member_count']
    
    fieldsets = (
        ('Team Information', {
            'fields': ('name', 'approver', 'marketing_admin')
        }),
        ('Statistics', {
            'fields': ('member_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def approver_name(self, obj):
        """Display approver's full name"""
        if obj.approver and hasattr(obj.approver, 'profile'):
            return obj.approver.profile.full_name
        return 'No Approver'
    approver_name.short_description = 'Approver'
    approver_name.admin_order_field = 'approver__profile__full_name'

    def marketing_admin_name(self, obj):
        """Display marketing admin's full name"""
        if obj.marketing_admin and hasattr(obj.marketing_admin, 'profile'):
            return obj.marketing_admin.profile.full_name
        return 'No Marketing Admin'
    marketing_admin_name.short_description = 'Marketing Admin'
    marketing_admin_name.admin_order_field = 'marketing_admin__profile__full_name'

    def member_count(self, obj):
        """Display number of team members"""
        return obj.memberships.count()
    member_count.short_description = 'Members'


@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
    """Admin interface for TeamMembership model"""
    list_display = ['user_name', 'team', 'joined_at']
    list_filter = ['team', 'joined_at']
    search_fields = ['user__profile__full_name', 'user__username', 'team__name']
    autocomplete_fields = ['user', 'team']
    readonly_fields = ['joined_at']
    
    def user_name(self, obj):
        """Display user's full name"""
        if hasattr(obj.user, 'profile'):
            return obj.user.profile.full_name
        return obj.user.username
    user_name.short_description = 'Member'
    user_name.admin_order_field = 'user__profile__full_name'
