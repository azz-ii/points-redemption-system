"""
Script to test email functionality directly
Run with: python test_email_script.py
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from utils.email_service import send_email_notification, send_html_email

def test_plain_email():
    """Test sending a plain text email"""
    print("\n" + "=" * 60)
    print("Testing Plain Text Email")
    print("=" * 60)
    
    success = send_email_notification(
        subject='Test Email - Points Redemption System',
        message='This is a plain text test email from the Points Redemption System.\n\n'
               'If you receive this email, the email configuration is working correctly!\n\n'
               f'Sender: {settings.DEFAULT_FROM_EMAIL}\n'
               f'SMTP Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}\n\n'
               'Best regards,\nPoints Redemption System',
        recipient_list=['jemaicamorente@gmail.com'],
    )
    
    if success:
        print("\n✓ Plain text email sent successfully!")
    else:
        print("\n✗ Failed to send plain text email")
    
    return success

def test_html_email():
    """Test sending HTML email using template"""
    print("\n" + "=" * 60)
    print("Testing HTML Template Email")
    print("=" * 60)
    
    success = send_html_email(
        subject='Test Email - Points Redemption System',
        template_name='emails/test.html',
        context={},
        recipient_list=['jemaicamorente@gmail.com']
    )
    
    if success:
        print("\n✓ HTML template email sent successfully!")
    else:
        print("\n✗ Failed to send HTML template email")
    
    return success

def test_approval_email():
    """Test approval email template"""
    print("\n" + "=" * 60)
    print("Testing Approval Email Template")
    print("=" * 60)
    
    context = {
        'request_id': 12345,
        'distributor_name': 'Test Distributor Inc.',
        'distributor_code': 'TEST001',
        'distributor_region': 'Metro Manila',
        'items': [
            {
                'name': 'Sample Product A',
                'sku': 'SKU-001',
                'quantity': 5,
                'points_per_unit': 100,
                'total_points': 500
            },
            {
                'name': 'Sample Product B',
                'sku': 'SKU-002',
                'quantity': 3,
                'points_per_unit': 200,
                'total_points': 600
            }
        ],
        'total_points': 1100,
        'approved_by': 'admin',
        'requested_by': 'test_user',
        'points_deducted_from': 'DISTRIBUTOR',
    }
    
    success = send_html_email(
        subject='Test Email. Please Reply if Working',
        template_name='emails/request_approved.html',
        context=context,
        recipient_list=['jemaicamorente@gmail.com']
    )
    
    if success:
        print("\n✓ Approval email sent successfully!")
    else:
        print("\n✗ Failed to send approval email")
    
    return success

def test_rejection_email():
    """Test rejection email template"""
    print("\n" + "=" * 60)
    print("Testing Rejection Email Template")
    print("=" * 60)
    
    context = {
        'request_id': 12345,
        'distributor_name': 'Test Distributor Inc.',
        'distributor_code': 'TEST001',
        'distributor_region': 'Metro Manila',
        'items': [
            {
                'name': 'Sample Product A',
                'sku': 'SKU-001',
                'quantity': 5,
                'points_per_unit': 100,
                'total_points': 500
            }
        ],
        'total_points': 500,
        'rejected_by': 'admin',
        'requested_by': 'test_user',
    }
    
    success = send_html_email(
        subject='Test Email. Please Reply if Working',
        template_name='emails/request_rejected.html',
        context=context,
        recipient_list=['jemaicamorente@gmail.com']
    )
    
    if success:
        print("\n✓ Rejection email sent successfully!")
    else:
        print("\n✗ Failed to send rejection email")
    
    return success

def test_account_created_email():
    """Test account creation email template"""
    print("\n" + "=" * 60)
    print("Testing Account Creation Email Template")
    print("=" * 60)
    
    context = {
        'username': 'testuser123',
        'password': 'SecurePass123!',
        'full_name': 'Test User',
        'position': 'Sales Agent',
    }
    
    success = send_html_email(
        subject='Welcome to Points Redemption System - Your Account Details',
        template_name='emails/account_created.html',
        context=context,
        recipient_list=['oracle.points@gmail.com']
    )
    
    if success:
        print("\n✓ Account creation email sent successfully!")
    else:
        print("\n✗ Failed to send account creation email")
    
    return success

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("Email Configuration Test Script")
    print("=" * 60)
    print(f"\nSMTP Configuration:")
    print(f"  Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
    print(f"  From: {settings.DEFAULT_FROM_EMAIL}")
    print(f"  TLS: {settings.EMAIL_USE_TLS}")
    print(f"  User: {settings.EMAIL_HOST_USER}")
    print(f"  Password: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
    
    # Run all tests
    results = []
    
    try:
        results.append(('Plain Text Email', test_plain_email()))
        results.append(('HTML Template Email', test_html_email()))
        results.append(('Approval Email', test_approval_email()))
        results.append(('Rejection Email', test_rejection_email()))
        results.append(('Account Created Email', test_account_created_email()))
    except Exception as e:
        print(f"\n✗ Error during tests: {e}")
        import traceback
        traceback.print_exc()
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    for test_name, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{status} - {test_name}")
    
    total = len(results)
    passed = sum(1 for _, success in results if success)
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Email system is working correctly.")
    else:
        print(f"\n⚠ {total - passed} test(s) failed. Check logs for details.")
    
    print("=" * 60)
