from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Distributor
from .serializers import DistributorSerializer

class DistributorPagination(PageNumberPagination):
    """
    Pagination class for distributors list.
    """
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 100

class DistributorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing distributors.
    Provides CRUD operations for distributor management.
    """
    queryset = Distributor.objects.all()
    serializer_class = DistributorSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DistributorPagination
    
    def get_queryset(self):
        """
        Filter distributors based on user's team and role.
        Optionally filter based on query parameters.
        """
        from teams.models import TeamMembership, Team
        
        user = self.request.user
        profile = getattr(user, 'profile', None)
        
        # Start with base queryset
        queryset = Distributor.objects.all()
        
        # Apply team-based filtering
        if profile:
            # Admin - highest ranking employee, manages all teams
            if profile.position == 'Admin':
                queryset = Distributor.objects.all()
            
            # Sales Agent - team-scoped access
            elif profile.position == 'Sales Agent':
                # Sales agents see only their team's distributors
                membership = TeamMembership.objects.filter(user=user).first()
                if membership:
                    queryset = queryset.filter(team=membership.team)
                else:
                    # If not in a team, see no distributors
                    queryset = Distributor.objects.none()
            
            # Approver - team-scoped access
            elif profile.position == 'Approver':
                # Approvers see their managed team's distributors
                managed_teams = Team.objects.filter(approver=user)
                if managed_teams.exists():
                    queryset = queryset.filter(team__in=managed_teams)
                else:
                    # If not managing any team, see no distributors
                    queryset = Distributor.objects.none()
            
            # Administrative support positions - global access
            elif profile.position in ['Marketing', 'Reception', 'Executive Assistant']:
                queryset = Distributor.objects.all()
            
            # Unspecified positions - no access
            else:
                queryset = Distributor.objects.none()
        
        # Apply search filter if provided
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                contact_email__icontains=search
            ) | queryset.filter(
                location__icontains=search
            ) | queryset.filter(
                region__icontains=search
            )
        
        return queryset.order_by('name')
    
    def perform_create(self, serializer):
        """
        Set the added_by field to the current user when creating.
        """
        serializer.save(added_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Custom search endpoint for distributors.
        """
        return self.list(request)
