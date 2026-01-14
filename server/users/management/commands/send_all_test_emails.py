"""
Django management command to send ALL email templates with dummy data for visual testing.

Usage:
    python manage.py send_all_test_emails recipient@example.com
    python manage.py send_all_test_emails recipient@example.com --negative
"""

import time
import logging
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from utils.email_service import send_html_email

logger = logging.getLogger('email')


class Command(BaseCommand):
    help = 'Send all 6 email templates with dummy data to test visual appearance'

    def add_arguments(self, parser):
        parser.add_argument(
            'recipient',
            type=str,
            help='Email address to send all test emails to'
        )
        parser.add_argument(
            '--negative',
            action='store_true',
            help='Test negative balance scenario in request_submitted email'
        )

    def handle(self, *args, **options):
        recipient = options['recipient']
        use_negative_balance = options['negative']

        self.stdout.write(self.style.NOTICE('=' * 70))
        self.stdout.write(self.style.NOTICE('   Send All Email Templates - Visual Testing Tool'))
        self.stdout.write(self.style.NOTICE('=' * 70))
        
        self.stdout.write('\nEmail Configuration:')
        self.stdout.write(f'  SMTP Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}')
        self.stdout.write(f'  From: {settings.DEFAULT_FROM_EMAIL}')
        self.stdout.write(f'  Recipient: {recipient}')
        
        if use_negative_balance:
            self.stdout.write(self.style.WARNING('\n  [!] Negative balance mode enabled'))
        
        if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            self.stdout.write(self.style.ERROR('\n EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not configured!'))
            raise CommandError('Email configuration incomplete')
        
        self.stdout.write(self.style.NOTICE('\n' + '-' * 70))
        self.stdout.write(self.style.NOTICE('Starting email send process (2-second delay between emails)...'))
        self.stdout.write(self.style.NOTICE('-' * 70 + '\n'))
        
        email_templates = self._get_email_templates(use_negative_balance)
        
        success_count = 0
        fail_count = 0
        results = []
        
        for idx, email_config in enumerate(email_templates, 1):
            template_name = email_config['template_name']
            subject = email_config['subject']
            context = email_config['context']
            display_name = email_config['display_name']
            
            self.stdout.write(f'[{idx}/6] Sending: {display_name}')
            self.stdout.write(f'      Template: {template_name}')
            self.stdout.write(f'      Subject: {subject}')
            
            try:
                success = send_html_email(
                    subject=subject,
                    template_name=template_name,
                    context=context,
                    recipient_list=[recipient]
                )
                
                if success:
                    self.stdout.write(self.style.SUCCESS(f'       Sent successfully!\n'))
                    success_count += 1
                    results.append((display_name, 'SUCCESS'))
                else:
                    self.stdout.write(self.style.ERROR(f'       Failed to send\n'))
                    fail_count += 1
                    results.append((display_name, 'FAILED'))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'       Error: {str(e)}\n'))
                fail_count += 1
                results.append((display_name, f'ERROR: {str(e)}'))
                logger.exception(f'Failed to send {display_name}:')
            
            if idx < len(email_templates):
                self.stdout.write(self.style.WARNING('      Waiting 2 seconds before next email...'))
                time.sleep(2)
                self.stdout.write('')
        
        self.stdout.write(self.style.NOTICE('=' * 70))
        self.stdout.write(self.style.NOTICE('   SUMMARY'))
        self.stdout.write(self.style.NOTICE('=' * 70))
        
        self.stdout.write(f'\nRecipient: {recipient}')
        self.stdout.write(f'Total emails attempted: {len(email_templates)}')
        self.stdout.write(self.style.SUCCESS(f'Successful: {success_count}'))
        if fail_count > 0:
            self.stdout.write(self.style.ERROR(f'Failed: {fail_count}'))
        else:
            self.stdout.write(f'Failed: {fail_count}')
        
        self.stdout.write('\nResults by template:')
        for name, status in results:
            if status == 'SUCCESS':
                self.stdout.write(self.style.SUCCESS(f'   {name}'))
            else:
                self.stdout.write(self.style.ERROR(f'   {name} - {status}'))
        
        self.stdout.write(self.style.NOTICE('\n' + '=' * 70))
        
        if fail_count == 0:
            self.stdout.write(self.style.SUCCESS('\n All emails sent successfully!'))
            self.stdout.write(self.style.WARNING('  Check inbox (and spam folder) for all 6 emails.'))
        else:
            self.stdout.write(self.style.ERROR(f'\n {fail_count} email(s) failed to send.'))
            self.stdout.write(self.style.WARNING('  Check logs for error details.'))
        
        self.stdout.write(self.style.NOTICE('=' * 70 + '\n'))

    def _get_email_templates(self, use_negative_balance):
        items_list = [
            {'name': 'Premium Wireless Bluetooth Headphones', 'sku': 'ELEC-WBH-2024', 'quantity': 2, 'points_per_unit': 1500, 'total_points': 3000},
            {'name': 'Stainless Steel Insulated Water Bottle (750ml)', 'sku': 'HOME-SSB-750', 'quantity': 5, 'points_per_unit': 350, 'total_points': 1750},
            {'name': 'Executive Leather Portfolio Notebook', 'sku': 'OFFC-LPN-BLK', 'quantity': 3, 'points_per_unit': 800, 'total_points': 2400}
        ]
        
        total_points = sum(item['total_points'] for item in items_list)
        
        if use_negative_balance:
            deductee_current_points = 5000
            deductee_remaining_points = deductee_current_points - total_points
        else:
            deductee_current_points = 15000
            deductee_remaining_points = deductee_current_points - total_points
        
        return [
            {
                'display_name': 'Account Created',
                'template_name': 'emails/account_created.html',
                'subject': '[TEST] Welcome to Points Redemption System - Your Account Details',
                'context': {'username': 'maria.santos', 'password': 'TempPass@2024!', 'full_name': 'Maria Clara Santos', 'position': 'Senior Sales Agent'}
            },
            {
                'display_name': 'Forgot Password OTP',
                'template_name': 'emails/forgot_password_otp.html',
                'subject': '[TEST] Password Reset OTP - Points Redemption System',
                'context': {'full_name': 'Juan Carlos Reyes', 'username': 'juan.reyes', 'otp_code': '847291'}
            },
            {
                'display_name': 'Password Changed',
                'template_name': 'emails/password_changed.html',
                'subject': '[TEST] Password Changed Successfully - Points Redemption System',
                'context': {'full_name': 'Ana Patricia Cruz', 'username': 'ana.cruz'}
            },
            {
                'display_name': 'Request Submitted' + (' (NEGATIVE BALANCE)' if use_negative_balance else ''),
                'template_name': 'emails/request_submitted.html',
                'subject': '[TEST] New Redemption Request #10542 - Golden Star Trading Corp.',
                'context': {
                    'request_id': 10542, 'sales_agent_name': 'Roberto Miguel Fernandez', 'sales_agent_username': 'roberto.fernandez',
                    'date_requested': 'January 14, 2026 at 02:35 PM', 'points_deducted_from': 'DISTRIBUTOR',
                    'distributor_name': 'Golden Star Trading Corp.', 'distributor_location': '2847 Aurora Boulevard, Cubao, Quezon City',
                    'deductee_name': 'Golden Star Trading Corp.', 'deductee_current_points': deductee_current_points,
                    'deductee_remaining_points': deductee_remaining_points, 'items': items_list, 'total_points': total_points,
                    'remarks': 'Quarterly incentive items for top performing store managers. Please prioritize delivery before month end.'
                }
            },
            {
                'display_name': 'Request Approved',
                'template_name': 'emails/request_approved.html',
                'subject': '[TEST] Request #10542 Approved - Golden Star Trading Corp.',
                'context': {
                    'request_id': 10542, 'distributor_name': 'Golden Star Trading Corp.',
                    'distributor_location': '2847 Aurora Boulevard, Cubao, Quezon City', 'items': items_list,
                    'total_points': total_points, 'approved_by': 'admin.garcia', 'requested_by': 'roberto.fernandez', 'points_deducted_from': 'DISTRIBUTOR'
                }
            },
            {
                'display_name': 'Request Rejected',
                'template_name': 'emails/request_rejected.html',
                'subject': '[TEST] Request #10543 Rejected - Sunrise Distribution Inc.',
                'context': {
                    'request_id': 10543, 'distributor_name': 'Sunrise Distribution Inc.', 'distributor_location': '156 Commerce Avenue, Makati City',
                    'items': [
                        {'name': 'Smart Fitness Watch Pro', 'sku': 'ELEC-SFW-PRO', 'quantity': 10, 'points_per_unit': 2500, 'total_points': 25000},
                        {'name': 'Portable Bluetooth Speaker', 'sku': 'ELEC-PBS-001', 'quantity': 8, 'points_per_unit': 900, 'total_points': 7200}
                    ],
                    'total_points': 32200, 'rejected_by': 'admin.garcia', 'requested_by': 'elena.mendoza',
                    'rejection_reason': 'Insufficient points balance. The distributor currently has only 28,500 points available.',
                    'remarks': 'Year-end rewards for sales team.'
                }
            },
        ]
