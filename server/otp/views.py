from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
import logging
from .models import OTP
from users.models import UserProfile
from utils.email_service import send_otp_email, send_password_changed_email

logger = logging.getLogger('email')

@method_decorator(csrf_exempt, name='dispatch')
class RequestOTPView(APIView):
    """Request OTP for password reset"""
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Find user by email in UserProfile
            profile = UserProfile.objects.select_related('user').get(email=email)
            user = profile.user
            
            # Create OTP
            otp = OTP.create_otp(user, email)
            
            # Send OTP email
            logger.info(f"OTP requested for {email}, sending email...")
            email_sent = send_otp_email(
                email=email,
                full_name=profile.full_name,
                username=user.username,
                otp_code=otp.code
            )
            
            if email_sent:
                logger.info(f"✓ OTP email sent to {email}")
            else:
                logger.warning(f"⚠ Failed to send OTP email to {email}")
            
            return Response({
                'message': 'OTP sent successfully',
                'email_sent': email_sent
            }, status=status.HTTP_200_OK)
            
        except UserProfile.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({
                'message': 'If this email exists, an OTP has been sent'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error requesting OTP: {str(e)}")
            return Response({
                'error': 'Failed to process request'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class VerifyOTPView(APIView):
    """Verify OTP code"""
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        
        if not email or not otp_code:
            return Response({
                'error': 'Email and OTP code are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Find the latest valid OTP for this email
            otp = OTP.objects.filter(
                email=email,
                code=otp_code,
                is_valid=True
            ).order_by('-created_at').first()
            
            if not otp:
                return Response({
                    'error': 'Invalid OTP code'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if otp.is_expired():
                otp.is_valid = False
                otp.save()
                return Response({
                    'error': 'OTP has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # OTP is valid
            return Response({
                'message': 'OTP verified successfully',
                'username': otp.user.username
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error verifying OTP: {str(e)}")
            return Response({
                'error': 'Failed to verify OTP'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class ResetPasswordWithOTPView(APIView):
    """Reset password using verified OTP"""
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        new_password = request.data.get('new_password')
        
        if not email or not otp_code or not new_password:
            return Response({
                'error': 'Email, OTP code, and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 6:
            return Response({
                'error': 'Password must be at least 6 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Find the latest valid OTP for this email
            otp = OTP.objects.filter(
                email=email,
                code=otp_code,
                is_valid=True
            ).select_related('user').order_by('-created_at').first()
            
            if not otp:
                return Response({
                    'error': 'Invalid OTP code'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if otp.is_expired():
                otp.is_valid = False
                otp.save()
                return Response({
                    'error': 'OTP has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Change password
            user = otp.user
            user.set_password(new_password)
            user.save()
            
            # Activate account if not activated (auto-activation during password reset)
            if hasattr(user, 'profile') and not user.profile.is_activated:
                user.profile.is_activated = True
                user.profile.save()
                logger.info(f"✓ Account automatically activated for {user.username} during password reset")
            
            # Mark OTP as used
            otp.mark_as_used()
            
            # Send confirmation email
            logger.info(f"Password changed for {user.username}, sending confirmation email...")
            email_sent = send_password_changed_email(
                email=email,
                full_name=user.profile.full_name,
                username=user.username
            )
            
            if email_sent:
                logger.info(f"✓ Password changed confirmation email sent to {email}")
            else:
                logger.warning(f"⚠ Failed to send confirmation email to {email}")
            
            return Response({
                'message': 'Password changed successfully',
                'email_sent': email_sent
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error resetting password: {str(e)}")
            logger.exception("Full traceback:")
            return Response({
                'error': 'Failed to reset password'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
