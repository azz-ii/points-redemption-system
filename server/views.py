# server/views.py
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

# Serializer defined here
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    # Allow GET requests for testing or API info
    def get(self, request):
        return Response(
            {"message": "Send POST request with 'username' and 'password' to login"},
            status=status.HTTP_200_OK
        )

    # Handle login POST requests
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            if user:
                # Fetch user position from UserProfile
                try:
                    from server.users.models import UserProfile
                    from datetime import datetime, timezone
                    profile = UserProfile.objects.get(user=user)
                    
                    # Check if account is activated
                    if not profile.is_activated:
                        return Response({
                            "needs_activation": True,
                            "username": username,
                            "message": "Please activate your account by setting a new password"
                        }, status=status.HTTP_200_OK)
                    
                    # Check if user is banned
                    if profile.is_banned:
                        # Check if ban has expired
                        if profile.unban_date:
                            now = datetime.now(timezone.utc)
                            if now >= profile.unban_date:
                                # Unban the user
                                profile.is_banned = False
                                profile.ban_reason = None
                                profile.ban_message = None
                                profile.ban_duration = None
                                profile.ban_date = None
                                profile.unban_date = None
                                profile.save()
                            else:
                                # Still banned
                                ban_info = {
                                    "error": "Account banned",
                                    "detail": profile.ban_message or "Your account has been banned.",
                                    "ban_reason": profile.ban_reason,
                                    "ban_date": profile.ban_date.isoformat() if profile.ban_date else None,
                                    "unban_date": profile.unban_date.isoformat() if profile.unban_date else None,
                                    "is_permanent": False
                                }
                                return Response(ban_info, status=status.HTTP_403_FORBIDDEN)
                        else:
                            # Permanent ban
                            ban_info = {
                                "error": "Account permanently banned",
                                "detail": profile.ban_message or "Your account has been permanently banned.",
                                "ban_reason": profile.ban_reason,
                                "ban_date": profile.ban_date.isoformat() if profile.ban_date else None,
                                "is_permanent": True
                            }
                            return Response(ban_info, status=status.HTTP_403_FORBIDDEN)
                    
                    position = profile.position
                except UserProfile.DoesNotExist:
                    position = "Admin"  # Default position if profile doesn't exist
                
                return Response({
                    "message": "Login successful",
                    "position": position,
                    "username": username
                }, status=status.HTTP_200_OK)
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class DashboardView(APIView):
    """Dashboard view to fetch user stats and redemption requests"""
    
    def get(self, request):
        """Get dashboard data including stats and requests"""
        return Response({
            "username": "Izza",
            "user_role": "Admin",
            "stats": {
                "pending_requests": 25,
                "total_requests": 45,
                "approved_requests": 20,
                "on_board": 20
            },
            "requests": [
                {
                    "id": "SA220011",
                    "agent": "Kim Molina",
                    "details": "Platinum Polo",
                    "quantity": 12,
                    "status": "Pending"
                },
                {
                    "id": "SA220012",
                    "agent": "Jerald Napoles",
                    "details": "Platinum Cap",
                    "quantity": 4,
                    "status": "Pending"
                }
            ]
        }, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class HistoryView(APIView):
    """History view to fetch user's redemption history"""
    
    def get(self, request):
        """Get history of past redemptions"""
        return Response({
            "username": "Izza",
            "user_role": "Admin",
            "history": [
                {
                    "id": "MC0003C",
                    "type": "T-shirt",
                    "details": "Platinum Polo",
                    "quantity": 8,
                    "status": "Pending"
                },
                {
                    "id": "MC0004C",
                    "type": "Cap",
                    "details": "Platinum Cap",
                    "quantity": 5,
                    "status": "Approved"
                },
                {
                    "id": "MC0005C",
                    "type": "Jacket",
                    "details": "Company Jacket",
                    "quantity": 3,
                    "status": "Approved"
                },
                {
                    "id": "MC0006C",
                    "type": "Bag",
                    "details": "Corporate Bag",
                    "quantity": 2,
                    "status": "Rejected"
                }
            ]
        }, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class AccountsView(APIView):
    """Accounts view to fetch user accounts"""
    
    def get(self, request):
        """Get list of user accounts"""
        return Response({
            "accounts": [
                {
                    "id": 1,
                    "username": "Raham",
                    "password": "Password",
                    "position": "Marketing"
                },
                {
                    "id": 2,
                    "username": "testuser",
                    "password": "testpass123",
                    "position": "Admin"
                }
            ]
        }, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class ApproveRequestView(APIView):
    """Approve a redemption request"""
    
    def post(self, request, request_id):
        """Approve a specific request by ID"""
        return Response({
            "message": f"Request {request_id} approved successfully"
        }, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class RejectRequestView(APIView):
    """Reject a redemption request"""
    
    def post(self, request, request_id):
        """Reject a specific request by ID"""
        return Response({
            "message": f"Request {request_id} rejected successfully"
        }, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(APIView):
    """Change password for a user"""
    
    def post(self, request):
        """Change user password by username"""
        from django.contrib.auth.models import User
        
        username = request.data.get('username')
        new_password = request.data.get('new_password')
        
        if not username or not new_password:
            return Response({
                "error": "Username and new password are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 6:
            return Response({
                "error": "Password must be at least 6 characters long"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(username=username)
            user.set_password(new_password)
            user.save()
            
            return Response({
                "message": "Password changed successfully",
                "username": username
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class ActivateAccountView(APIView):
    """Activate user account by changing password"""
    
    def post(self, request):
        """Activate account and set new password"""
        from django.contrib.auth.models import User
        from server.users.models import UserProfile
        
        username = request.data.get('username')
        new_password = request.data.get('new_password')
        
        if not username or not new_password:
            return Response({
                "error": "Username and new password are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 6:
            return Response({
                "error": "Password must be at least 6 characters long"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(username=username)
            profile = UserProfile.objects.get(user=user)
            
            # Set new password and activate account
            user.set_password(new_password)
            user.save()
            
            profile.is_activated = True
            profile.save()
            
            return Response({
                "message": "Account activated successfully",
                "username": username,
                "position": profile.position
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except UserProfile.DoesNotExist:
            return Response({
                "error": "User profile not found"
            }, status=status.HTTP_404_NOT_FOUND)

