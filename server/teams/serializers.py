from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Team, TeamMembership
from users.models import UserProfile


class ApproverSerializer(serializers.ModelSerializer):
    """Serializer for approver user details"""
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    email = serializers.EmailField(source='profile.email', read_only=True)
    position = serializers.CharField(source='profile.position', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'position']


class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializer for team member user details"""
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    email = serializers.EmailField(source='profile.email', read_only=True)
    position = serializers.CharField(source='profile.position', read_only=True)
    points = serializers.IntegerField(source='profile.points', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'position', 'points']


class TeamMembershipSerializer(serializers.ModelSerializer):
    """Serializer for team membership"""
    user_details = TeamMemberSerializer(source='user', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    
    class Meta:
        model = TeamMembership
        fields = ['id', 'team', 'team_name', 'user', 'user_details', 'joined_at']
        read_only_fields = ['joined_at']
    
    def validate(self, data):
        """Validate team membership"""
        user = data.get('user')
        team = data.get('team')
        
        # Check if user is a Sales Agent
        if user and hasattr(user, 'profile'):
            if user.profile.position != 'Sales Agent':
                raise serializers.ValidationError({
                    'user': 'Only Sales Agents can be added to teams.'
                })
        
        # Check if user is already in another team (for create operations)
        if user and not self.instance:
            existing_membership = TeamMembership.objects.filter(user=user).first()
            if existing_membership:
                raise serializers.ValidationError({
                    'user': f'This user is already a member of {existing_membership.team.name}. Remove them from that team first.'
                })
        
        return data


class TeamSerializer(serializers.ModelSerializer):
    """Basic serializer for Team model"""
    approver_details = ApproverSerializer(source='approver', read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'approver', 'approver_details', 'region', 'member_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_member_count(self, obj):
        """Get the count of team members"""
        return obj.member_count  # Uses the property from the model
    
    def validate_approver(self, value):
        """Validate that approver has Approver position"""
        if value and hasattr(value, 'profile'):
            if value.profile.position != 'Approver':
                raise serializers.ValidationError('Selected user must have Approver position.')
        return value


class TeamDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Team with members list"""
    approver_details = ApproverSerializer(source='approver', read_only=True)
    members = serializers.SerializerMethodField()
    member_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'approver', 'approver_details', 'region',
            'members', 'member_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_members(self, obj):
        """Get all team members with details"""
        memberships = obj.memberships.all()
        return TeamMembershipSerializer(memberships, many=True).data


class AssignMemberSerializer(serializers.Serializer):
    """Serializer for assigning a user to a team"""
    user_id = serializers.IntegerField()
    
    def validate_user_id(self, value):
        """Validate user exists and is a Sales Agent"""
        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('User not found.')
        
        if not hasattr(user, 'profile'):
            raise serializers.ValidationError('User does not have a profile.')
        
        if user.profile.position != 'Sales Agent':
            raise serializers.ValidationError('Only Sales Agents can be added to teams.')
        
        # Check if user is already in a team
        existing_membership = TeamMembership.objects.filter(user=user).first()
        if existing_membership:
            raise serializers.ValidationError(
                f'User is already a member of {existing_membership.team.name}. '
                'Remove them from that team first.'
            )
        
        return value


class RemoveMemberSerializer(serializers.Serializer):
    """Serializer for removing a user from a team"""
    user_id = serializers.IntegerField()
    
    def validate_user_id(self, value):
        """Validate user exists"""
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('User not found.')
        return value
