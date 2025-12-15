from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    class Meta:
        model = UserProfile
        fields = [
            'full_name', 'email', 'position', 'is_activated', 'is_banned',
            'ban_reason', 'ban_message', 'ban_duration', 'ban_date', 'unban_date',
            'uses_points', 'points', 'created_at', 'updated_at'
        ]

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with profile"""
    profile = UserProfileSerializer(read_only=True)
    position = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    full_name = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    email = serializers.EmailField(write_only=True, required=False, allow_null=True)
    is_activated = serializers.BooleanField(write_only=True, required=False, default=True)
    is_banned = serializers.BooleanField(write_only=True, required=False, default=False)
    ban_reason = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    ban_message = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    ban_duration = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    ban_date = serializers.DateTimeField(write_only=True, required=False, allow_null=True)
    unban_date = serializers.DateTimeField(write_only=True, required=False, allow_null=True)
    uses_points = serializers.BooleanField(write_only=True, required=False, default=False)
    points = serializers.IntegerField(write_only=True, required=False, default=0)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'position', 'full_name', 'email',
            'is_activated', 'is_banned', 'ban_reason', 'ban_message', 'ban_duration', 'ban_date', 'unban_date',
            'uses_points', 'points', 'profile', 'is_active', 'date_joined'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }
    
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
        is_banned = validated_data.pop('is_banned', False)
        ban_reason = validated_data.pop('ban_reason', None)
        ban_message = validated_data.pop('ban_message', None)
        ban_duration = validated_data.pop('ban_duration', None)
        ban_date = validated_data.pop('ban_date', None)
        unban_date = validated_data.pop('unban_date', None)
        uses_points = validated_data.pop('uses_points', False)
        points = validated_data.pop('points', 0)
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create(**validated_data)
        user.set_password(password)  # Hash the password
        user.save()
        
        # Create profile
        UserProfile.objects.create(
            user=user, 
            position=position,
            full_name=full_name,
            email=email,
            is_activated=is_activated,
            is_banned=is_banned,
            ban_reason=ban_reason,
            ban_message=ban_message,
            ban_duration=ban_duration,
            ban_date=ban_date,
            unban_date=unban_date,
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
        is_banned = validated_data.pop('is_banned', None)
        ban_reason = validated_data.pop('ban_reason', None)
        ban_message = validated_data.pop('ban_message', None)
        ban_duration = validated_data.pop('ban_duration', None)
        ban_date = validated_data.pop('ban_date', None)
        unban_date = validated_data.pop('unban_date', None)
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
            if is_banned is not None:
                instance.profile.is_banned = is_banned
            if ban_reason is not None:
                instance.profile.ban_reason = ban_reason
            if ban_message is not None:
                instance.profile.ban_message = ban_message
            if ban_duration is not None:
                instance.profile.ban_duration = ban_duration
            if ban_date is not None:
                instance.profile.ban_date = ban_date
            if unban_date is not None:
                instance.profile.unban_date = unban_date
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
                    is_banned=is_banned if is_banned is not None else False,
                    ban_reason=ban_reason,
                    ban_message=ban_message,
                    ban_duration=ban_duration,
                    ban_date=ban_date,
                    unban_date=unban_date,
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
    is_banned = serializers.BooleanField(source='profile.is_banned', read_only=True)
    ban_reason = serializers.CharField(source='profile.ban_reason', read_only=True)
    ban_message = serializers.CharField(source='profile.ban_message', read_only=True)
    ban_duration = serializers.IntegerField(source='profile.ban_duration', read_only=True)
    ban_date = serializers.DateTimeField(source='profile.ban_date', read_only=True)
    unban_date = serializers.DateTimeField(source='profile.unban_date', read_only=True)
    uses_points = serializers.BooleanField(source='profile.uses_points', read_only=True)
    points = serializers.IntegerField(source='profile.points', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'position', 'is_activated', 'is_banned',
            'ban_reason', 'ban_message', 'ban_duration', 'ban_date', 'unban_date',
            'uses_points', 'points', 'is_active', 'date_joined'
        ]
