from django.db import models
from django.utils import timezone
from django.conf import settings


class LoginAttempt(models.Model):
    """Tracks failed login attempts per username for rate-limiting / lockout."""

    username = models.CharField(max_length=150, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'login_attempts'
        ordering = ['-attempted_at']

    def __str__(self):
        return f"{self.username} @ {self.attempted_at}"

    # ---- helpers --------------------------------------------------------

    LOCKOUT_THRESHOLD = 5          # max failures before lockout
    LOCKOUT_WINDOW_MINUTES = 15    # rolling window for counting failures

    @classmethod
    def recent_failures(cls, username):
        """Return the number of failed attempts within the lockout window."""
        cutoff = timezone.now() - timezone.timedelta(minutes=cls.LOCKOUT_WINDOW_MINUTES)
        return cls.objects.filter(username=username, attempted_at__gte=cutoff).count()

    @classmethod
    def is_locked_out(cls, username):
        return cls.recent_failures(username) >= cls.LOCKOUT_THRESHOLD

    @classmethod
    def record_failure(cls, username, ip_address=None):
        cls.objects.create(username=username, ip_address=ip_address)

    @classmethod
    def clear_failures(cls, username):
        """Remove all failure records for this username (called on successful login)."""
        cls.objects.filter(username=username).delete()

    @classmethod
    def lockout_seconds_remaining(cls, username):
        """Seconds until the oldest relevant failure falls outside the window."""
        cutoff = timezone.now() - timezone.timedelta(minutes=cls.LOCKOUT_WINDOW_MINUTES)
        oldest = (
            cls.objects
            .filter(username=username, attempted_at__gte=cutoff)
            .order_by('attempted_at')
            .first()
        )
        if oldest is None:
            return 0
        unlock_at = oldest.attempted_at + timezone.timedelta(minutes=cls.LOCKOUT_WINDOW_MINUTES)
        remaining = (unlock_at - timezone.now()).total_seconds()
        return max(int(remaining), 0)


class UserProfile(models.Model):
    POSITION_CHOICES = [
        ('Admin', 'Admin'),
        ('Sales Agent', 'Sales Agent'),
        ('Approver', 'Approver'),
        ('Marketing', 'Marketing'),
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    position = models.CharField(max_length=100, choices=POSITION_CHOICES)
    full_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(max_length=254, unique=True)
    is_activated = models.BooleanField(default=True)
    uses_points = models.BooleanField(default=False, help_text='Whether this user uses the points system')
    points = models.IntegerField(default=0, help_text='Current points balance for the user (can be negative)')
    can_self_request = models.BooleanField(default=False, help_text='Whether this approver can create redemption requests for themselves')
    is_archived = models.BooleanField(default=False, help_text='Whether this user profile is archived')
    date_archived = models.DateTimeField(null=True, blank=True, help_text='Date and time when the user profile was archived')
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='archived_user_profiles',
        help_text='User who archived this user profile'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name or self.user.get_username()} ({self.position})"

    class Meta:
        db_table = 'user_profiles'
        ordering = ['-created_at']
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'