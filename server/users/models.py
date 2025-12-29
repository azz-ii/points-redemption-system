from django.db import models
from django.utils import timezone
from django.conf import settings

class UserProfile(models.Model):
    POSITION_CHOICES = [
        ('Admin', 'Admin'),
        ('Sales Agent', 'Sales Agent'),
        ('Approver', 'Approver'),
        ('Marketing', 'Marketing'),
        ('Reception', 'Reception'),
        ('Executive Assistant', 'Executive Assistant'),
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    position = models.CharField(max_length=100, choices=POSITION_CHOICES)
    full_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(max_length=254, unique=True)
    is_activated = models.BooleanField(default=True)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.TextField(blank=True, null=True)
    ban_message = models.TextField(blank=True, null=True)
    ban_duration = models.IntegerField(blank=True, null=True, help_text='Duration (in days)')
    ban_date = models.DateTimeField(blank=True, null=True)
    unban_date = models.DateTimeField(blank=True, null=True)
    uses_points = models.BooleanField(default=False, help_text='Whether this user uses the points system')
    points = models.PositiveIntegerField(default=0, help_text='Current points balance for the user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name or self.user.get_username()} ({self.position})"

    class Meta:
        db_table = 'user_profiles'
        ordering = ['-created_at']
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'