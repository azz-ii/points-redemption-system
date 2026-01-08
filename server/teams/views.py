from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Count, Q

from .models import Team, TeamMembership
from .serializers import (
    TeamSerializer,
    TeamDetailSerializer,
    TeamMembershipSerializer,
    AssignMemberSerializer,
    RemoveMemberSerializer
)


class TeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Team CRUD operations and team management.
    
    Permissions:
    - Sales Agents: Read-only access to their own team
    - Approvers: Full access to teams they manage
    - Super Admin / Others: Full access to all teams
    """
    queryset = Team.objects.all()
    permission_classes = []  # Override with custom permission logic
    
    def get_serializer_class(self):
        """Return detailed serializer for retrieve action"""
        if self.action == 'retrieve':
            return TeamDetailSerializer
        return TeamSerializer
    
    def get_queryset(self):
        """Filter teams based on user position"""
        user = self.request.user
        
        # print(f"DEBUG Teams ViewSet - User: {user}, Authenticated: {user.is_authenticated}")
        
        # Temporarily allow unauthenticated access for development (like Users endpoint)
        if not user.is_authenticated:
            # print("DEBUG: User not authenticated, but returning all teams (like Users endpoint)")
            return Team.objects.all()
        
        if not hasattr(user, 'profile'):
            # Super admin or user without profile sees all
            # print("DEBUG: User has no profile (superadmin), returning all teams")
            return Team.objects.all()
        
        position = user.profile.position
        # print(f"DEBUG: User position: {position}")
        
        # Admin - highest ranking employee, manages all teams
        if position == 'Admin':
            teams = Team.objects.all()
            # print(f"DEBUG: Admin - returning {teams.count()} teams")
            return teams
        
        # Sales Agent - can only see their own team
        elif position == 'Sales Agent':
            membership = TeamMembership.objects.filter(user=user).first()
            if membership:
                return Team.objects.filter(id=membership.team.id)
            return Team.objects.none()
        
        # Approver - can see teams they manage
        elif position == 'Approver':
            return Team.objects.filter(approver=user)
        
        # Administrative support positions - global access
        elif position in ['Marketing', 'Reception', 'Executive Assistant']:
            return Team.objects.all()
        
        # Unspecified positions - no access
        else:
            return Team.objects.none()
    
    def perform_create(self, serializer):
        """Create a new team"""
        serializer.save()
    
    def perform_update(self, serializer):
        """Update team details"""
        serializer.save()
    
    def destroy(self, request, *args, **kwargs):
        """Delete a team - prevent if it has members"""
        team = self.get_object()
        
        if team.memberships.exists():
            return Response({
                'error': 'Cannot delete team with members',
                'detail': f'This team has {team.memberships.count()} member(s). Remove all members before deleting.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        team.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def assign_member(self, request, pk=None):
        """
        Assign a Sales Agent to this team.
        POST /api/teams/{id}/assign_member/
        Body: {"user_id": 123}
        """
        team = self.get_object()
        serializer = AssignMemberSerializer(data=request.data)
        
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            user = get_object_or_404(User, id=user_id)
            
            # Create team membership
            membership = TeamMembership.objects.create(team=team, user=user)
            
            return Response({
                'message': f'User {user.profile.full_name} successfully added to {team.name}',
                'membership': TeamMembershipSerializer(membership).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """
        Remove a Sales Agent from this team.
        POST /api/teams/{id}/remove_member/
        Body: {"user_id": 123}
        """
        team = self.get_object()
        serializer = RemoveMemberSerializer(data=request.data)
        
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            user = get_object_or_404(User, id=user_id)
            
            # Find and delete membership
            try:
                membership = TeamMembership.objects.get(team=team, user=user)
                user_name = user.profile.full_name if hasattr(user, 'profile') else user.username
                membership.delete()
                
                return Response({
                    'message': f'User {user_name} successfully removed from {team.name}'
                }, status=status.HTTP_200_OK)
            except TeamMembership.DoesNotExist:
                return Response({
                    'error': 'User is not a member of this team'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all members of this team."""
        team = self.get_object()
        memberships = team.memberships.all()
        serializer = TeamMembershipSerializer(memberships, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def requests(self, request, pk=None):
        """
        Get all redemption requests for this team.
        GET /api/teams/{id}/requests/
        """
        team = self.get_object()
        
        # Import here to avoid circular import
        from requests.models import RedemptionRequest
        from requests.serializers import RedemptionRequestSerializer
        
        # Get requests from team members only (not distributor-based)
        team_requests = RedemptionRequest.objects.filter(
            requested_by__team_memberships__team=team
        ).distinct()
        
        serializer = RedemptionRequestSerializer(team_requests, many=True)
        return Response(serializer.data)


class TeamMembershipViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing team memberships directly.
    """
    queryset = TeamMembership.objects.all()
    serializer_class = TeamMembershipSerializer
    permission_classes = []
    
    def get_queryset(self):
        """Filter memberships based on user position"""
        user = self.request.user
        
        if not user.is_authenticated:
            return TeamMembership.objects.none()
        
        if not hasattr(user, 'profile'):
            # Super admin sees all
            return TeamMembership.objects.all()
        
        position = user.profile.position
        
        # Admin - highest ranking employee, manages all teams
        if position == 'Admin':
            return TeamMembership.objects.all()
        
        # Sales Agent - can only see their own membership
        elif position == 'Sales Agent':
            return TeamMembership.objects.filter(user=user)
        
        # Approver - can see memberships of teams they manage
        elif position == 'Approver':
            managed_teams = Team.objects.filter(approver=user)
            return TeamMembership.objects.filter(team__in=managed_teams)
        
        # Administrative support positions - global access
        elif position in ['Marketing', 'Reception', 'Executive Assistant']:
            return TeamMembership.objects.all()
        
        # Unspecified positions - no access
        else:
            return TeamMembership.objects.none()
