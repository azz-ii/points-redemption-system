from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.authentication import SessionAuthentication
from .models import Distributor
from .serializers import DistributorSerializer

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session authentication without CSRF checks for API endpoints"""
    def enforce_csrf(self, request):
        return  # Skip CSRF check

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
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]  # TEMP: Allow unauthenticated access for testing
    pagination_class = DistributorPagination
    
    def get_queryset(self):
        """
        All authenticated users can access all distributors.
        Optionally filter based on query parameters.
        """
        # All users get full access to all distributors
        queryset = Distributor.objects.all()
        
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
