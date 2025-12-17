import os
import sys
import django

# Add the server directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import requests
from users.models import UserProfile

def test_otp_api_workflow():
    """Test the complete OTP API workflow"""
    
    base_url = 'http://127.0.0.1:8000'
    
    print('\n=== Testing OTP API Workflow ===\n')
    
    # Get a test user email
    profile = UserProfile.objects.first()
    test_email = profile.email
    print(f'Test email: {test_email}')
    
    # Step 1: Request OTP
    print('\n--- Step 1: Request OTP ---')
    response = requests.post(
        f'{base_url}/api/otp/request-otp/',
        json={'email': test_email}
    )
    print(f'Status: {response.status_code}')
    print(f'Response: {response.json()}')
    
    if response.status_code != 200:
        print(' Failed to request OTP')
        return
    
    print(' OTP request successful')
    
    # Get the OTP from database for testing
    from otp.models import OTP
    otp = OTP.objects.filter(email=test_email, is_valid=True).order_by('-created_at').first()
    
    if not otp:
        print(' No OTP found in database')
        return
    
    otp_code = otp.code
    print(f'OTP Code (from DB): {otp_code}')
    
    # Step 2: Verify OTP
    print('\n--- Step 2: Verify OTP ---')
    response = requests.post(
        f'{base_url}/api/otp/verify-otp/',
        json={
            'email': test_email,
            'otp_code': otp_code
        }
    )
    print(f'Status: {response.status_code}')
    print(f'Response: {response.json()}')
    
    if response.status_code != 200:
        print(' Failed to verify OTP')
        return
    
    print(' OTP verification successful')
    
    # Step 3: Reset password
    print('\n--- Step 3: Reset Password ---')
    new_password = 'NewTestPassword123'
    response = requests.post(
        f'{base_url}/api/otp/reset-password/',
        json={
            'email': test_email,
            'otp_code': otp_code,
            'new_password': new_password
        }
    )
    print(f'Status: {response.status_code}')
    print(f'Response: {response.json()}')
    
    if response.status_code != 200:
        print(' Failed to reset password')
        return
    
    print(' Password reset successful')
    
    # Step 4: Test with expired/invalid OTP
    print('\n--- Step 4: Test Invalid OTP ---')
    response = requests.post(
        f'{base_url}/api/otp/verify-otp/',
        json={
            'email': test_email,
            'otp_code': '000000'
        }
    )
    print(f'Status: {response.status_code}')
    print(f'Response: {response.json()}')
    
    if response.status_code == 400:
        print(' Invalid OTP correctly rejected')
    else:
        print(' Should have rejected invalid OTP')
    
    # Step 5: Test with used OTP
    print('\n--- Step 5: Test Used OTP ---')
    response = requests.post(
        f'{base_url}/api/otp/verify-otp/',
        json={
            'email': test_email,
            'otp_code': otp_code
        }
    )
    print(f'Status: {response.status_code}')
    print(f'Response: {response.json()}')
    
    if response.status_code == 400:
        print(' Used OTP correctly rejected')
    else:
        print(' Should have rejected used OTP')
    
    print('\n=== OTP API Workflow Test Complete ===\n')
    print('IMPORTANT: Make sure the Django development server is running on http://127.0.0.1:8000')

if __name__ == '__main__':
    test_otp_api_workflow()
