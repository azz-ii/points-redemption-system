from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import random
import string
from datetime import timedelta

class OTP(models.Model):
    """OTP model for password reset"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    code = models.CharField(max_length=6)
    email = models.EmailField()
    is_valid = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'otp_codes'
        ordering = ['-created_at']
        verbose_name = 'OTP Code'
        verbose_name_plural = 'OTP Codes'
    
    def save(self, *args, **kwargs):
        if not self.pk:
            # Set expiration to 10 minutes from now
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)
    
    def is_expired(self):
        """Check if OTP is expired"""
        return timezone.now() > self.expires_at
    
    def mark_as_used(self):
        """Mark OTP as used"""
        self.is_valid = False
        self.used_at = timezone.now()
        self.save()
    
    @staticmethod
    def generate_code():
        """Generate a random 6-digit OTP code"""
        return ''.join(random.choices(string.digits, k=6))
    
    @staticmethod
    def create_otp(user, email):
        """Create a new OTP for a user"""
        # Invalidate all previous OTPs for this user
        OTP.objects.filter(user=user, is_valid=True).update(is_valid=False)
        
        # Generate new OTP
        code = OTP.generate_code()
        otp = OTP.objects.create(
            user=user,
            code=code,
            email=email
        )
        return otp
    
    def __str__(self):
        return f"OTP for {self.user.username} - {self.code}"
