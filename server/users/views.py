from django.shortcuts import render
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session authentication without CSRF checks for API endpoints"""
    def enforce_csrf(self, request):
        return  # Skip CSRF check

from .models import UserProfile
from .serializers import UserSerializer, UserListSerializer

@method_decorator(csrf_exempt, name='dispatch')
class UserListCreateView(APIView):
    """List all users or create a new user"""
    
    def get(self, request):
        """Get list of all users with their profiles, excluding superusers"""
        users = User.objects.filter(is_superuser=False).select_related('profile')
        serializer = UserListSerializer(users, many=True)
        return Response({"accounts": serializer.data}, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new user with profile"""
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "User created successfully",
                "user": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "error": "Failed to create user",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class UserDetailView(APIView):
    """Retrieve, update or delete a user"""
    
    def get(self, request, user_id):
        """Get a specific user's details"""
        try:
            user = User.objects.select_related('profile').get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, user_id):
        """Update a user's details"""
        try:
            user = User.objects.select_related('profile').get(id=user_id)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "User updated successfully",
                    "user": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "error": "Failed to update user",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, user_id):
        """Delete a user"""
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response({
                "message": "User deleted successfully"
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class CurrentUserView(APIView):
    """Get current authenticated user's profile"""
    authentication_classes = [CsrfExemptSessionAuthentication]  # Use session auth to load user
    permission_classes = []  # No permission checks - we'll check manually
    
    def get(self, request):
        """Get current user's profile details"""
        # Manually check if user is authenticated via Django session
        if not request.user.is_authenticated:
            return Response({
                "error": "Not authenticated",
                "details": "User is not logged in. Please login first.",
                "debug": {
                    "user": str(request.user),
                    "session_key": request.session.session_key,
                    "has_sessionid_cookie": "sessionid" in request.COOKIES
                }
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user = request.user
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": "Failed to get user profile",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
