from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    class Meta:
        model = UserProfile
        fields = [
            'full_name', 'email', 'position', 'is_activated',
            'uses_points', 'points',
            'is_archived', 'date_archived', 'archived_by',
            'created_at', 'updated_at'
        ]

class SalesAgentOptionSerializer(serializers.ModelSerializer):
    """Lightweight serializer for sales agent dropdown options"""
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    email = serializers.EmailField(source='profile.email', read_only=True)
    points = serializers.IntegerField(source='profile.points', read_only=True)
    team_id = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'points', 'team_id']
    
    def get_team_id(self, obj):
        """Get team ID if user is in a team"""
        membership = obj.team_memberships.first()
        return membership.team.id if membership else None

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with profile"""
    profile = UserProfileSerializer(read_only=True)
    position = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    full_name = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    email = serializers.EmailField(write_only=True, required=False, allow_null=True)
    is_activated = serializers.BooleanField(write_only=True, required=False, default=True)
    uses_points = serializers.BooleanField(write_only=True, required=False, default=False)
    points = serializers.IntegerField(write_only=True, required=False, default=0)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'position', 'full_name', 'email',
            'is_activated', 'uses_points', 'points', 'profile', 'is_active', 'date_joined'
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
        is_activated = validated_data.pop('is_activated', True)
        uses_points = validated_data.pop('uses_points', False)
        points = validated_data.pop('points', 0)
        password = validated_data.pop('password')
        
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
            if uses_points is not None:
                instance.profile.uses_points = uses_points
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
                uses_points=uses_points if uses_points is not None else False,
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
    is_archived = serializers.BooleanField(source='profile.is_archived', read_only=True)
    date_archived = serializers.DateTimeField(source='profile.date_archived', read_only=True)
    archived_by = serializers.IntegerField(source='profile.archived_by_id', read_only=True)
    archived_by_username = serializers.SerializerMethodField()
    
    # Team information
    team_id = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()
    is_team_approver = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'position', 'is_activated',
            'uses_points', 'points',
            'is_archived', 'date_archived', 'archived_by', 'archived_by_username',
            'is_active', 'date_joined',
            'team_id', 'team_name', 'is_team_approver'
        ]
    
    def get_team_id(self, obj):
        """Get team ID if user is a Sales Agent"""
        if hasattr(obj, 'profile') and obj.profile.position == 'Sales Agent':
            membership = obj.team_memberships.first()
            return membership.team.id if membership else None
        return None
    
    def get_team_name(self, obj):
        """Get team name if user is a Sales Agent"""
        if hasattr(obj, 'profile') and obj.profile.position == 'Sales Agent':
            membership = obj.team_memberships.first()
            return membership.team.name if membership else None
        return None
    
    def get_is_team_approver(self, obj):
        """Check if user is an approver of any team"""
        if hasattr(obj, 'profile') and obj.profile.position == 'Approver':
            return obj.managed_teams.exists()
        return False
    
    def get_archived_by_username(self, obj):
        """Get username of the user who archived this account"""
        if hasattr(obj, 'profile') and obj.profile.archived_by:
            return obj.profile.archived_by.get_username()
        return None
