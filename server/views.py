# server/views.py
from django.contrib.auth import authenticate, login, logout as auth_logout
from django.contrib.sessions.models import Session
from utils.validators import validate_password_strength
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.middleware.csrf import get_token
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

# Serializer defined here
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    # Allow GET requests for testing or API info
    def get(self, request):
        return Response(
            {"message": "Send POST request with 'username' and 'password' to login"},
            status=status.HTTP_200_OK
        )

    def _get_client_ip(self, request):
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            ip = x_forwarded.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        # Strip port number if present (e.g., "192.168.1.1:8080" -> "192.168.1.1")
        if ip and ':' in ip:
            # Handle IPv6 addresses (contain multiple colons)
            # For IPv4:port, split and take first part
            if ip.count(':') == 1:  # IPv4 with port
                ip = ip.split(':')[0]
        
        return ip

    def _kill_other_sessions(self, user, current_session_key=None):
        """Delete every other Django session that belongs to *user*.

        Django stores session data as a pickled dict. We decode each
        active session and check whether its ``_auth_user_id`` matches.
        ``current_session_key`` is excluded so that any in-flight requests
        still using that session are not interrupted mid-response.
        """
        from django.contrib.sessions.models import Session as SessionModel
        user_id_str = str(user.pk)
        for session in SessionModel.objects.filter(expire_date__gte=timezone.now()):
            if session.session_key == current_session_key:
                continue  # never delete the session that owns this login request
            data = session.get_decoded()
            if data.get('_auth_user_id') == user_id_str:
                session.delete()

    # Handle login POST requests
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            client_ip = self._get_client_ip(request)

            # --- rate-limit / lockout check ----------------------------------
            from users.models import LoginAttempt
            if LoginAttempt.is_locked_out(username):
                remaining = LoginAttempt.lockout_seconds_remaining(username)
                return Response({
                    "error": "Account temporarily locked",
                    "detail": f"Too many failed login attempts. Try again in {remaining // 60} min {remaining % 60} sec.",
                    "lockout": True,
                    "retry_after": remaining,
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)

            user = authenticate(username=username, password=password)

            # authenticate() returns None for inactive users; check manually for archived accounts
            if user is None:
                from django.contrib.auth.models import User as DjangoUser
                from users.models import UserProfile
                try:
                    candidate = DjangoUser.objects.get(username=username)
                    if candidate.check_password(password):
                        try:
                            profile = UserProfile.objects.get(user=candidate)
                            if profile.is_archived:
                                return Response({
                                    "error": "Account archived",
                                    "detail": "This account has been archived and cannot access the system."
                                }, status=status.HTTP_403_FORBIDDEN)
                        except UserProfile.DoesNotExist:
                            pass
                except DjangoUser.DoesNotExist:
                    pass

            if user:
                # Fetch user position from UserProfile
                try:
                    from users.models import UserProfile
                    profile = UserProfile.objects.get(user=user)
                    
                    # Check if account is archived (overrides all other statuses)
                    if profile.is_archived:
                        return Response({
                            "error": "Account archived",
                            "detail": "This account has been archived and cannot access the system."
                        }, status=status.HTTP_403_FORBIDDEN)
                    
                    # Check if account is activated
                    if not profile.is_activated:
                        return Response({
                            "needs_activation": True,
                            "username": username,
                            "message": "Please activate your account by setting a new password"
                        }, status=status.HTTP_200_OK)
                    
                    position = profile.position
                except UserProfile.DoesNotExist:
                    position = "Admin"  # Default position if profile doesn't exist
                    profile = None

                # Clear failed-login counter on success
                LoginAttempt.clear_failures(username)

                # Kill sessions that belong to this user BEFORE login() so
                # that zombie sessions (resurrected by SESSION_SAVE_EVERY_REQUEST
                # on an in-flight request) are cleaned up even if their key
                # differs from the about-to-be-cycled key.
                pre_login_key = request.session.session_key
                self._kill_other_sessions(user, pre_login_key)

                # Log the user in to create a session so `request.user` is populated.
                # login() calls cycle_key() which replaces the old session key with
                # a new one, so we run a second kill to catch any session that was
                # written between the first kill and the cycle.
                login(request, user)

                # --- single active session enforcement -----------------------
                self._kill_other_sessions(user, request.session.session_key)

                response = Response({
                    "message": "Login successful",
                    "position": position,
                    "username": username,
                    "can_self_request": profile.can_self_request if profile else False,
                }, status=status.HTTP_200_OK)
                
                # Ensure CSRF cookie is set
                get_token(request)
                
                # Manually set the session cookie in the response
                if request.session.session_key:
                    from django.conf import settings as django_settings
                    response.set_cookie(
                        key='sessionid',
                        value=request.session.session_key,
                        max_age=django_settings.SESSION_COOKIE_AGE,
                        httponly=django_settings.SESSION_COOKIE_HTTPONLY,
                        secure=django_settings.SESSION_COOKIE_SECURE,
                        samesite=django_settings.SESSION_COOKIE_SAMESITE,
                    )
                
                return response

            # --- bad credentials: record failure -----------------------------
            LoginAttempt.record_failure(username, ip_address=client_ip)
            failures = LoginAttempt.recent_failures(username)
            remaining_attempts = max(LoginAttempt.LOCKOUT_THRESHOLD - failures, 0)

            if remaining_attempts == 0:
                remaining_secs = LoginAttempt.lockout_seconds_remaining(username)
                return Response({
                    "error": "Account temporarily locked",
                    "detail": f"Too many failed login attempts. Try again in {remaining_secs // 60} min {remaining_secs % 60} sec.",
                    "lockout": True,
                    "retry_after": remaining_secs,
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)

            return Response({
                "error": "Invalid credentials",
                "remaining_attempts": remaining_attempts,
            }, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    """Server-side logout: flush session from DB and clear cookie."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        auth_logout(request)          # flush session
        response = Response({"message": "Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie('sessionid')
        return response

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
                    "position": "Handler"
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
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Change user password by username"""
        from django.contrib.auth.models import User
        
        username = request.data.get('username')
        new_password = request.data.get('new_password')
        
        if not username or not new_password:
            return Response({
                "error": "Username and new password are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        pw_error = validate_password_strength(new_password)
        if pw_error:
            return Response({
                "error": pw_error
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
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Activate account and set new password"""
        from django.contrib.auth.models import User
        from users.models import UserProfile
        
        username = request.data.get('username')
        new_password = request.data.get('new_password')
        
        if not username or not new_password:
            return Response({
                "error": "Username and new password are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        pw_error = validate_password_strength(new_password)
        if pw_error:
            return Response({
                "error": pw_error
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

