from django.db import models
from django.utils import timezone
from django.conf import settings
from datetime import date

class Distributor(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, help_text="Name of the distributor")
    contact_email = models.EmailField(max_length=254, help_text="Contact email address")
    phone = models.CharField(max_length=20, help_text="Contact phone number")
    location = models.CharField(max_length=255, help_text="Location of the distributor")
    region = models.CharField(max_length=100, help_text="Region where the distributor operates")
    points = models.PositiveIntegerField(default=0, help_text='Current points balance for the distributor')
    date_added = models.DateField(auto_now_add=True, help_text="Date the distributor was added")
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='added_distributors',
        help_text='User who added this distributor'
    )
    team = models.ForeignKey(
        'teams.Team',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='distributors',
        help_text='Team that this distributor is assigned to'
    )

    def __str__(self):
        return f"{self.name}"

    class Meta:
        verbose_name = "Distributor"
        verbose_name_plural = "Distributors"
        ordering = ['name']
