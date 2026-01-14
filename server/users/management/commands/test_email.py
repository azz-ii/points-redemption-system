"""
Django management command to test email configuration and sending functionality.

Usage:
    python manage.py test_email recipient@example.com
    python manage.py test_email recipient@example.com --template test
"""

import logging
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from utils.email_service import send_email_notification, send_html_email

logger = logging.getLogger('email')


class Command(BaseCommand):
    help = 'Test email configuration by sending a test email'

    def add_arguments(self, parser):
        parser.add_argument(
            'recipient',
            type=str,
            help='Email address to send test email to'
        )
        parser.add_argument(
            '--template',
            type=str,
            default='test',
            help='Email template to use (test, request_approved, request_rejected)'
        )
        parser.add_argument(
            '--plain',
            action='store_true',
            help='Send plain text email instead of HTML'
        )

    def handle(self, *args, **options):
        recipient = options['recipient']
        template = options['template']
        use_plain = options['plain']

        self.stdout.write(self.style.NOTICE('=' * 60))
        self.stdout.write(self.style.NOTICE('Email Configuration Test'))
        self.stdout.write(self.style.NOTICE('=' * 60))
        
        # Display current configuration
        self.stdout.write('\nCurrent Email Settings:')
        self.stdout.write(f'  EMAIL_BACKEND: {settings.EMAIL_BACKEND}')
        self.stdout.write(f'  EMAIL_HOST: {settings.EMAIL_HOST}')
        self.stdout.write(f'  EMAIL_PORT: {settings.EMAIL_PORT}')
        self.stdout.write(f'  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}')
        self.stdout.write(f'  EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}')
        self.stdout.write(f'  EMAIL_HOST_PASSWORD: {"*" * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else "NOT SET"}')
        self.stdout.write(f'  DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}')
        
        # Check for missing configuration
        if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            self.stdout.write(self.style.ERROR('\n✗ EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not configured!'))
            self.stdout.write(self.style.WARNING('Please set these values in your .env file.'))
            raise CommandError('Email configuration incomplete')
        
        self.stdout.write(self.style.NOTICE(f'\nRecipient: {recipient}'))
        self.stdout.write(self.style.NOTICE(f'Template: {template}'))
        self.stdout.write(self.style.NOTICE('-' * 60))
        
        try:
            if use_plain:
                # Send plain text email
                self.stdout.write('\nSending plain text email...')
                success = send_email_notification(
                    subject='Goodluck boi!',
                    message='This is a plain text test email from the Points Redemption System.\n\n'
                           'If you receive this email, the email configuration is working correctly!\n\n'
                           f'Sender: {settings.DEFAULT_FROM_EMAIL}\n'
                           f'SMTP Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}\n\n'
                           'Best regards,\nPoints Redemption System',
                    recipient_list=[recipient],
                )
            else:
                # Send HTML email using template
                self.stdout.write(f'\nSending HTML email using template: {template}...')
                
                # Create context based on template type
                if template == 'test':
                    context = {}
                    template_path = 'emails/test.html'
                    subject = 'Goodluck boi!'
                    
                elif template == 'request_approved':
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
                    template_path = 'emails/request_approved.html'
                    subject = 'Test Email. Please Reply if Working'
                    
                elif template == 'request_rejected':
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
                        'rejected_by': 'admin',
                        'requested_by': 'test_user',
                    }
                    template_path = 'emails/request_rejected.html'
                    subject = 'Test Email. Please Reply if Working'
                else:
                    raise CommandError(f'Unknown template: {template}')
                
                success = send_html_email(
                    subject=subject,
                    template_name=template_path,
                    context=context,
                    recipient_list=[recipient]
                )
            
            self.stdout.write(self.style.NOTICE('-' * 60))
            
            if success:
                self.stdout.write(self.style.SUCCESS('\n✓ Email sent successfully!'))
                self.stdout.write(self.style.SUCCESS(f'  Check {recipient} inbox'))
                self.stdout.write(self.style.WARNING('\nNote: Email may take a few seconds to arrive.'))
                self.stdout.write(self.style.WARNING('Check spam/junk folder if not in inbox.'))
            else:
                self.stdout.write(self.style.ERROR('\n✗ Failed to send email'))
                self.stdout.write(self.style.WARNING('Check the logs above for error details'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n✗ Error: {str(e)}'))
            logger.exception('Test email command failed:')
            raise CommandError(f'Failed to send test email: {str(e)}')
        
        self.stdout.write(self.style.NOTICE('=' * 60))
