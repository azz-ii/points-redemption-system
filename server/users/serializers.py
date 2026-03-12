from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, LoginAttempt
from teams.models import Team
from utils.validators import validate_password_min_length

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    class Meta:
        model = UserProfile
        fields = [
            'full_name', 'email', 'position', 'is_activated',
            'uses_points', 'points', 'can_self_request',
            'is_archived', 'date_archived', 'archived_by',
            'created_at', 'updated_at'
        ]

class SalesAgentOptionSerializer(serializers.ModelSerializer):
    """Lightweight serializer for sales agent dropdown options"""
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    email = serializers.EmailField(source='profile.email', read_only=True)
    points = serializers.IntegerField(source='profile.points', read_only=True)
    team_id = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'points', 'team_id', 'team_name']
    
    def get_team_id(self, obj):
        """Get team ID if user is in a team"""
        membership = obj.team_memberships.first()
        return membership.team.id if membership else None

    def get_team_name(self, obj):
        """Get team name if user is in a team"""
        membership = obj.team_memberships.first()
        return membership.team.name if membership else None

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with profile"""
    profile = UserProfileSerializer(read_only=True)
    position = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    full_name = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    email = serializers.EmailField(write_only=True, required=False, allow_null=True)
    is_activated = serializers.BooleanField(write_only=True, required=False, default=False)
    uses_points = serializers.BooleanField(write_only=True, required=False, default=False)
    points = serializers.IntegerField(write_only=True, required=False, default=0)
    can_self_request = serializers.BooleanField(write_only=True, required=False, default=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'position', 'full_name', 'email',
            'is_activated', 'uses_points', 'points', 'can_self_request', 'profile', 'is_active', 'date_joined'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'is_active': {'read_only': True},
        }
    
    def validate(self, data):
        """Validate team membership for Sales Agents"""
        position = data.get('position')
        
        # Note: Team validation is enforced at the team assignment level
        # Sales Agents should be assigned to a team after creation
        # The TeamMembership model enforces single team membership
        
        return data
    
    def create(self, validated_data):
        """Create user with profile"""
        position = validated_data.pop('position', None)
        full_name = validated_data.pop('full_name', None)
        email = validated_data.pop('email', None)
        if not position or not full_name or not email:
            raise serializers.ValidationError({
                'detail': 'position, full_name and email are required when creating a user.'
            })
        is_activated = validated_data.pop('is_activated', False)
        validated_data.pop('uses_points', None)  # derived from position, ignore any client-supplied value
        uses_points = (position in ('Sales Agent', 'Approver'))
        points = validated_data.pop('points', 0)
        can_self_request = validated_data.pop('can_self_request', False)
        # can_self_request only meaningful for Approvers
        if position != 'Approver':
            can_self_request = False
        password = validated_data.pop('password')

        # Superadmin create path: only minimum length required (no complexity rules)
        pw_error = validate_password_min_length(password, min_length=8)
        if pw_error:
            raise serializers.ValidationError({'password': pw_error})

        # Create user
        username = validated_data.pop('username')
        user = User.objects.create_user(username=username, password=password, **validated_data)

        
        # Create profile
        UserProfile.objects.create(
            user=user,
            position=position,
            full_name=full_name,
            email=email,
            is_activated=is_activated,
            uses_points=uses_points,
            points=points,
            can_self_request=can_self_request,
        )
        
        return user
    
    def update(self, instance, validated_data):
        """Update user and profile"""
        position = validated_data.pop('position', None)
        full_name = validated_data.pop('full_name', None)
        email = validated_data.pop('email', None)
        is_activated = validated_data.pop('is_activated', None)
        uses_points = validated_data.pop('uses_points', None)
        points = validated_data.pop('points', None)
        can_self_request = validated_data.pop('can_self_request', None)
        password = validated_data.pop('password', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        
        # Update profile
        if hasattr(instance, 'profile'):
            if position is not None:
                instance.profile.position = position
            if full_name is not None:
                instance.profile.full_name = full_name
            if email is not None:
                instance.profile.email = email
            if is_activated is not None:
                instance.profile.is_activated = is_activated
            # Always sync uses_points from effective position
            effective_position = position if position is not None else instance.profile.position
            instance.profile.uses_points = (effective_position in ('Sales Agent', 'Approver'))
            # Sync can_self_request: only meaningful for Approvers
            if can_self_request is not None:
                instance.profile.can_self_request = can_self_request
            if effective_position != 'Approver':
                instance.profile.can_self_request = False
            if points is not None:
                instance.profile.points = points
            instance.profile.save()
        elif any([position, full_name, email]):
            UserProfile.objects.create(
                user=instance,
                position=position or '',
                full_name=full_name or '',
                email=email or '',
                is_activated=is_activated if is_activated is not None else True,
                uses_points=((position or '') == 'Sales Agent'),
                points=points if points is not None else 0,
            )
        
        return instance

class UserListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing users"""
    position = serializers.CharField(source='profile.position', read_only=True)
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    email = serializers.EmailField(source='profile.email', read_only=True)
    is_activated = serializers.BooleanField(source='profile.is_activated', read_only=True)
    uses_points = serializers.BooleanField(source='profile.uses_points', read_only=True)
    points = serializers.IntegerField(source='profile.points', read_only=True)
    can_self_request = serializers.BooleanField(source='profile.can_self_request', read_only=True)
    is_archived = serializers.BooleanField(source='profile.is_archived', read_only=True)
    date_archived = serializers.DateTimeField(source='profile.date_archived', read_only=True)
    archived_by = serializers.IntegerField(source='profile.archived_by_id', read_only=True)
    archived_by_username = serializers.SerializerMethodField()
    
    # Lockout status
    is_locked = serializers.SerializerMethodField()

    # Team information
    team_id = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()
    is_team_approver = serializers.SerializerMethodField()
    approver_teams = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'position', 'is_activated',
            'uses_points', 'points', 'can_self_request',
            'is_archived', 'date_archived', 'archived_by', 'archived_by_username',
            'is_active', 'date_joined',
            'team_id', 'team_name', 'is_team_approver', 'approver_teams',
            'is_locked',
        ]
    
    def get_team_id(self, obj):
        """Get team ID if user is a Sales Agent or Approver with membership"""
        if hasattr(obj, 'profile') and obj.profile.position in ('Sales Agent', 'Approver'):
            membership = obj.team_memberships.first()
            return membership.team.id if membership else None
        return None
    
    def get_team_name(self, obj):
        """Get team name if user is a Sales Agent or Approver with membership"""
        if hasattr(obj, 'profile') and obj.profile.position in ('Sales Agent', 'Approver'):
            membership = obj.team_memberships.first()
            return membership.team.name if membership else None
        return None
    
    def get_is_team_approver(self, obj):
        """Check if user is an approver"""
        if hasattr(obj, 'profile') and obj.profile.position == 'Approver':
            return True
        return False

    def get_approver_teams(self, obj):
        """Get list of teams this approver manages"""
        if hasattr(obj, 'profile') and obj.profile.position == 'Approver':
            return list(Team.objects.filter(approver=obj).values('id', 'name'))
        return []

    def get_archived_by_username(self, obj):
        """Get username of the user who archived this account"""
        if hasattr(obj, 'profile') and obj.profile.archived_by:
            return obj.profile.archived_by.get_username()
        return None

    def get_is_locked(self, obj):
        """Check whether this user is currently locked out due to failed login attempts"""
        return LoginAttempt.is_locked_out(obj.username)
