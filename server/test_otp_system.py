import os
import sys
import django

# Add the server directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import UserProfile
from otp.models import OTP
from utils.email_service import send_otp_email, send_password_changed_email
from django.contrib.auth.models import User

def test_otp_system():
    """Test the complete OTP system"""
    
    print('\n=== Testing OTP System ===\n')
    
    # Test 1: Check if we have a test user
    print('Test 1: Finding test user...')
    try:
        user = User.objects.get(username='markus_sales')
        user_profile = UserProfile.objects.get(user=user)
        print(f' Found test user: {user.username}')
        print(f'  Email: {user_profile.email}')
        print(f'  Full Name: {user_profile.full_name}')
    except User.DoesNotExist:
        print(' Test user not found. Please create a user first.')
        return
    except UserProfile.DoesNotExist:
        print(' UserProfile not found for admin user.')
        return
    
    # Test 2: Generate OTP
    print('\nTest 2: Generating OTP...')
    try:
        otp_instance = OTP.create_otp(user, user_profile.email)
        print(f' OTP generated successfully')
        print(f'  OTP Code: {otp_instance.code}')
        print(f'  Expires at: {otp_instance.expires_at}')
        print(f'  Is expired: {otp_instance.is_expired()}')
    except Exception as e:
        print(f' Failed to generate OTP: {e}')
        return
    
    # Test 3: Validate OTP code
    print('\nTest 3: Validating OTP...')
    try:
        valid_otp = OTP.objects.filter(
            user=user,
            code=otp_instance.code,
            is_valid=True
        ).first()
        if valid_otp and not valid_otp.is_expired():
            print(f' OTP is valid and not expired')
        else:
            print(f' OTP validation failed')
    except Exception as e:
        print(f' Error validating OTP: {e}')
    
    # Test 4: Send OTP email
    print('\nTest 4: Sending OTP email...')
    try:
        send_otp_email(
            email=user_profile.email,
            full_name=user_profile.full_name,
            username=user.username,
            otp_code=otp_instance.code
        )
        print(f' OTP email sent successfully to {user_profile.email}')
    except Exception as e:
        print(f' Failed to send OTP email: {e}')
    
    # Test 5: Mark OTP as used
    print('\nTest 5: Marking OTP as used...')
    try:
        otp_instance.mark_as_used()
        print(f' OTP marked as used')
        print(f'  Is valid: {otp_instance.is_valid}')
        print(f'  Used at: {otp_instance.used_at}')
    except Exception as e:
        print(f' Failed to mark OTP as used: {e}')
    
    # Test 6: Generate new OTP for password changed email test
    print('\nTest 6: Testing password changed email...')
    try:
        send_password_changed_email(
            email=user_profile.email,
            full_name=user_profile.full_name,
            username=user.username
        )
        print(f' Password changed email sent successfully to {user_profile.email}')
    except Exception as e:
        print(f' Failed to send password changed email: {e}')
    
    # Test 7: Check OTP count in database
    print('\nTest 7: Checking OTP records...')
    try:
        otp_count = OTP.objects.filter(user=user).count()
        print(f' Total OTP records for user: {otp_count}')
        
        # Show recent OTPs
        recent_otps = OTP.objects.filter(user=user).order_by('-created_at')[:3]
        for idx, otp in enumerate(recent_otps, 1):
            print(f'  {idx}. Code: {otp.code}, Valid: {otp.is_valid}, Expired: {otp.is_expired()}')
    except Exception as e:
        print(f' Error checking OTP records: {e}')
    
    print('\n=== OTP System Test Complete ===\n')

if __name__ == '__main__':
    test_otp_system()
