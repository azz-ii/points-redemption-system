from django.db import models
from django.conf import settings


class Team(models.Model):
    """
    Represents a team with multiple sales agents and one approver.
    """
    name = models.CharField(max_length=255, unique=True, help_text='Team name')
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_teams',
        limit_choices_to={'profile__position__in': ['Approver', 'Admin']},
        help_text='Approver who manages this team'
    )
    is_archived = models.BooleanField(default=False, help_text='Whether this team is archived')
    date_archived = models.DateTimeField(null=True, blank=True, help_text='Date and time when the team was archived')
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='archived_teams',
        help_text='User who archived this team'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teams_team'
        ordering = ['name']
        verbose_name = 'Team'
        verbose_name_plural = 'Teams'

    def __str__(self):
        return f"{self.name}"

    @property
    def member_count(self):
        """Return the number of members in this team"""
        return self.memberships.count()

    @property
    def members(self):
        """Return all user members of this team"""
        return [membership.user for membership in self.memberships.all()]


class TeamMembership(models.Model):
    """
    Represents membership of a user (Sales Agent) in a team.
    Enforces single team membership per user.
    """
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='memberships',
        help_text='Team this membership belongs to'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='team_memberships',
        limit_choices_to={'profile__position__in': ['Sales Agent', 'Approver']},
        help_text='User who is a member of the team'
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'teams_teammembership'
        unique_together = ('team', 'user')
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                name='one_team_per_user',
                violation_error_message='A user can only belong to one team.'
            )
        ]
        ordering = ['joined_at']
        verbose_name = 'Team Membership'
        verbose_name_plural = 'Team Memberships'

    def __str__(self):
        user_name = self.user.profile.full_name if hasattr(self.user, 'profile') else self.user.username
        return f"{user_name} → {self.team.name}"

    def clean(self):
        """Validate that user is a Sales Agent or an Approver with self-request capability"""
        if self.user and hasattr(self.user, 'profile'):
            if self.user.profile.position not in ('Sales Agent', 'Approver'):
                raise ValidationError({'user': 'Only Sales Agents and Approvers can be team members.'})

    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()
        super().save(*args, **kwargs)
