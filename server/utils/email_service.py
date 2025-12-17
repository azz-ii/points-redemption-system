"""
Email Service Utility Module

Provides email sending functionality using Django's built-in email system with Gmail SMTP.
Includes comprehensive debug logging for troubleshooting email issues.
"""

import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

# Configure logger for email operations
logger = logging.getLogger('email')


def send_email_notification(subject, message, recipient_list, html_message=None):
    """
    Send email notification using Django's built-in email system
    
    Args:
        subject (str): Email subject line
        message (str): Plain text message content
        recipient_list (list): List of recipient email addresses
        html_message (str, optional): HTML content for the email
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        logger.debug(f"=== EMAIL SEND START ===")
        logger.debug(f"From: {settings.DEFAULT_FROM_EMAIL}")
        logger.debug(f"To: {recipient_list}")
        logger.debug(f"Subject: {subject}")
        logger.debug(f"Message length: {len(message)} characters")
        logger.debug(f"HTML message: {'Yes' if html_message else 'No'}")
        logger.debug(f"SMTP Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        logger.debug(f"TLS Enabled: {settings.EMAIL_USE_TLS}")
        
        if html_message:
            # Send email with HTML content
            email = EmailMultiAlternatives(
                subject=subject,
                body=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=recipient_list,
            )
            email.attach_alternative(html_message, "text/html")
            email.send()
            logger.info(f"✓ HTML email sent successfully to {', '.join(recipient_list)}")
        else:
            # Send plain text email
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_list,
                fail_silently=False,
            )
            logger.info(f"✓ Plain text email sent successfully to {', '.join(recipient_list)}")
        
        logger.debug(f"=== EMAIL SEND SUCCESS ===")
        return True
        
    except Exception as e:
        logger.error(f"✗ Failed to send email: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"=== EMAIL SEND FAILED ===")
        logger.exception("Full traceback:")
        return False


def send_html_email(subject, template_name, context, recipient_list):
    """
    Send HTML email using Django templates
    
    Args:
        subject (str): Email subject line
        template_name (str): Path to Django template file (relative to templates directory)
        context (dict): Context data for template rendering
        recipient_list (list): List of recipient email addresses
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        logger.debug(f"=== HTML EMAIL TEMPLATE START ===")
        logger.debug(f"Template: {template_name}")
        logger.debug(f"Context keys: {list(context.keys())}")
        
        # Render HTML template
        html_message = render_to_string(template_name, context)
        logger.debug(f"Template rendered successfully ({len(html_message)} chars)")
        
        # Create plain text version by stripping HTML tags
        plain_message = strip_tags(html_message)
        logger.debug(f"Plain text version created ({len(plain_message)} chars)")
        
        # Send the email
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipient_list,
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
        
        logger.info(f"✓ Template email sent successfully to {', '.join(recipient_list)}")
        logger.debug(f"=== HTML EMAIL TEMPLATE SUCCESS ===")
        return True
        
    except Exception as e:
        logger.error(f"✗ Failed to send template email: {str(e)}")
        logger.error(f"Template: {template_name}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"=== HTML EMAIL TEMPLATE FAILED ===")
        logger.exception("Full traceback:")
        return False


def send_request_approved_email(request_obj, distributor, approved_by):
    """
    Send email notification when a redemption request is approved
    
    Args:
        request_obj: RedemptionRequest model instance
        distributor: Distributor model instance
        approved_by: User who approved the request
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        recipient_email = request_obj.requested_by.profile.email
        
        if not recipient_email:
            logger.warning(f"No email address found for user {request_obj.requested_by.username}")
            return False
        
        logger.debug(f"Preparing approval email for request #{request_obj.id}")
        
        # Calculate total items and points
        items_list = []
        total_points = 0
        
        for item in request_obj.items.all():
            items_list.append({
                'name': item.variant.item.name,
                'sku': item.variant.item_code,
                'quantity': item.quantity,
                'points_per_unit': item.points_snapshot,
                'total_points': item.quantity * item.points_snapshot
            })
            total_points += item.quantity * item.points_snapshot
        
        context = {
            'request_id': request_obj.id,
            'distributor_name': distributor.name,
            'distributor_code': distributor.code,
            'distributor_region': distributor.region,
            'items': items_list,
            'total_points': total_points,
            'approved_by': approved_by.username,
            'requested_by': request_obj.requested_by.username,
            'points_deducted_from': request_obj.points_deducted_from,
        }
        
        return send_html_email(
            subject=f"Request #{request_obj.id} Approved - {distributor.name}",
            template_name='emails/request_approved.html',
            context=context,
            recipient_list=[recipient_email]
        )
        
    except Exception as e:
        logger.error(f"Error sending approval email for request #{request_obj.id}: {str(e)}")
        logger.exception("Full traceback:")
        return False


def send_request_rejected_email(request_obj, distributor, rejected_by):
    """
    Send email notification when a redemption request is rejected
    
    Args:
        request_obj: RedemptionRequest model instance
        distributor: Distributor model instance
        rejected_by: User who rejected the request
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        recipient_email = request_obj.requested_by.profile.email
        
        if not recipient_email:
            logger.warning(f"No email address found for user {request_obj.requested_by.username}")
            return False
        
        logger.debug(f"Preparing rejection email for request #{request_obj.id}")
        
        # Calculate total items and points
        items_list = []
        total_points = 0
        
        for item in request_obj.items.all():
            items_list.append({
                'name': item.variant.item.name,
                'sku': item.variant.item_code,
                'quantity': item.quantity,
                'points_per_unit': item.points_snapshot,
                'total_points': item.quantity * item.points_snapshot
            })
            total_points += item.quantity * item.points_snapshot
        
        context = {
            'request_id': request_obj.id,
            'distributor_name': distributor.name,
            'distributor_code': distributor.code,
            'distributor_region': distributor.region,
            'items': items_list,
            'total_points': total_points,
            'rejected_by': rejected_by.username,
            'requested_by': request_obj.requested_by.username,
        }
        
        return send_html_email(
            subject=f"Request #{request_obj.id} Rejected - {distributor.name}",
            template_name='emails/request_rejected.html',
            context=context,
            recipient_list=[recipient_email]
        )
        
    except Exception as e:
        logger.error(f"Error sending rejection email for request #{request_obj.id}: {str(e)}")
        logger.exception("Full traceback:")
        return False
