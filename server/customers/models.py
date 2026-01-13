from django.db import models
from django.utils import timezone
from django.conf import settings
from datetime import date

class Customer(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, help_text="Name of the customer")
    contact_email = models.EmailField(max_length=254, help_text="Contact email address")
    phone = models.CharField(max_length=20, help_text="Contact phone number")
    location = models.CharField(max_length=255, help_text="Location of the customer")
    points = models.PositiveIntegerField(default=0, help_text='Current points balance for the customer')
    date_added = models.DateField(auto_now_add=True, help_text="Date the customer was added")
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='added_customers',
        help_text='User who added this customer'
    )
    is_archived = models.BooleanField(default=False, help_text='Whether this customer is archived')
    date_archived = models.DateTimeField(null=True, blank=True, help_text='Date and time when the customer was archived')
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='archived_customers',
        help_text='User who archived this customer'
    )

    def __str__(self):
        return f"{self.name}"

    class Meta:
        verbose_name = "Customer"
        verbose_name_plural = "Customers"
        ordering = ['name']
