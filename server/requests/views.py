from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
from .models import RedemptionRequest, RedemptionRequestItem
from .serializers import (
    RedemptionRequestSerializer, 
    CreateRedemptionRequestSerializer,
    RedemptionRequestItemSerializer
)


class RedemptionRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RedemptionRequestSerializer

    def get_queryset(self):
        """Filter requests based on user role"""
        user = self.request.user
        profile = getattr(user, 'profile', None)
        
        if profile and profile.position == 'Sales Agent':
            # Sales agents only see their own requests
            return RedemptionRequest.objects.filter(requested_by=user).prefetch_related('items', 'items__variant')
        else:
            # Approvers and admins see all requests
            return RedemptionRequest.objects.all().prefetch_related('items', 'items__variant')

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateRedemptionRequestSerializer
        return RedemptionRequestSerializer

    def create(self, request, *args, **kwargs):
        """Create a new redemption request"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the request
        redemption_request = serializer.save()
        
        # Return the created request with full details
        response_serializer = RedemptionRequestSerializer(redemption_request)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a redemption request and deduct points"""
        redemption_request = self.get_object()
        
        if redemption_request.status != 'PENDING':
            return Response(
                {'error': 'Only pending requests can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if sufficient points are available
        if redemption_request.points_deducted_from == 'SELF':
            # Check sales agent's points
            user_profile = redemption_request.requested_by.profile
            if user_profile.points < redemption_request.total_points:
                return Response(
                    {
                        'error': 'Insufficient points',
                        'detail': f'Sales agent has {user_profile.points} points but needs {redemption_request.total_points} points'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:  # DISTRIBUTOR
            # Check distributor's points
            distributor = redemption_request.requested_for
            if distributor.points < redemption_request.total_points:
                return Response(
                    {
                        'error': 'Insufficient points',
                        'detail': f'Distributor has {distributor.points} points but needs {redemption_request.total_points} points'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Use transaction to ensure atomicity
        try:
            with transaction.atomic():
                # Deduct points from the appropriate account
                if redemption_request.points_deducted_from == 'SELF':
                    user_profile = redemption_request.requested_by.profile
                    user_profile.points -= redemption_request.total_points
                    user_profile.save()
                else:  # DISTRIBUTOR
                    distributor = redemption_request.requested_for
                    distributor.points -= redemption_request.total_points
                    distributor.save()
                
                # Update request status
                redemption_request.status = 'APPROVED'
                redemption_request.reviewed_by = request.user
                redemption_request.date_reviewed = timezone.now()
                
                # Get remarks if provided
                if 'remarks' in request.data:
                    redemption_request.remarks = request.data['remarks']
                
                redemption_request.save()
        
        except Exception as e:
            return Response(
                {'error': 'Failed to process approval', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        serializer = self.get_serializer(redemption_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a redemption request"""
        redemption_request = self.get_object()
        
        if redemption_request.status != 'PENDING':
            return Response(
                {'error': 'Only pending requests can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Rejection reason is required
        rejection_reason = request.data.get('rejection_reason')
        if not rejection_reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update request status
        redemption_request.status = 'REJECTED'
        redemption_request.reviewed_by = request.user
        redemption_request.date_reviewed = timezone.now()
        redemption_request.rejection_reason = rejection_reason
        
        # Get remarks if provided
        if 'remarks' in request.data:
            redemption_request.remarks = request.data['remarks']
        
        redemption_request.save()
        
        serializer = self.get_serializer(redemption_request)
        return Response(serializer.data)
