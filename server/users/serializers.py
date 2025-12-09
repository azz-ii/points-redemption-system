from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    class Meta:
        model = UserProfile
        fields = ['full_name', 'email', 'position', 'is_activated', 'is_banned', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with profile"""
    profile = UserProfileSerializer(read_only=True)
    position = serializers.CharField(write_only=True, required=True)
    full_name = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=True)
    is_activated = serializers.BooleanField(write_only=True, required=False, default=True)
    is_banned = serializers.BooleanField(write_only=True, required=False, default=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'position', 'full_name', 'email', 'is_activated', 'is_banned', 'profile', 'is_active', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }
    
    def create(self, validated_data):
        """Create user with profile"""
        position = validated_data.pop('position')
        full_name = validated_data.pop('full_name')
        email = validated_data.pop('email')
        is_activated = validated_data.pop('is_activated', True)
        is_banned = validated_data.pop('is_banned', False)
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
            is_banned=is_banned
        )
        
        return user
    
    def update(self, instance, validated_data):
        """Update user and profile"""
        position = validated_data.pop('position', None)
        full_name = validated_data.pop('full_name', None)
        email = validated_data.pop('email', None)
        is_activated = validated_data.pop('is_activated', None)
        is_banned = validated_data.pop('is_banned', None)
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
            instance.profile.save()
        elif any([position, full_name, email]):
            UserProfile.objects.create(
                user=instance, 
                position=position or '',
                full_name=full_name or '',
                email=email or '',
                is_activated=is_activated if is_activated is not None else True,
                is_banned=is_banned if is_banned is not None else False
            )
        
        return instance

class UserListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing users"""
    position = serializers.CharField(source='profile.position', read_only=True)
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    email = serializers.EmailField(source='profile.email', read_only=True)
    is_activated = serializers.BooleanField(source='profile.is_activated', read_only=True)
    is_banned = serializers.BooleanField(source='profile.is_banned', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'position', 'is_activated', 'is_banned', 'is_active', 'date_joined']
