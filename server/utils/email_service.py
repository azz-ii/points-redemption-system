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


def send_html_email(subject, template_name, context, recipient_list, cc_list=None):
    """
    Send HTML email using Django templates
    
    Args:
        subject (str): Email subject line
        template_name (str): Path to Django template file (relative to templates directory)
        context (dict): Context data for template rendering
        recipient_list (list): List of recipient email addresses
        cc_list (list, optional): List of CC email addresses
    
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
            cc=cc_list or [],
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
                'name': item.variant.catalogue_item.item_name,
                'sku': item.variant.item_code,
                'quantity': item.quantity,
                'points_per_unit': item.points_per_item,
                'total_points': item.total_points
            })
            total_points += item.total_points
        
        context = {
            'request_id': request_obj.id,
            'distributor_name': distributor.name,
            'distributor_location': distributor.location,
            'items': items_list,
            'total_points': total_points,
            'approved_by': approved_by.username,
            'requested_by': request_obj.requested_by.username,
            'points_deducted_from': request_obj.points_deducted_from,
            'remarks': request_obj.remarks or '',
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
                'name': item.variant.catalogue_item.item_name,
                'sku': item.variant.item_code,
                'quantity': item.quantity,
                'points_per_unit': item.points_per_item,
                'total_points': item.total_points
            })
            total_points += item.total_points
        
        context = {
            'request_id': request_obj.id,
            'distributor_name': distributor.name,
            'distributor_location': distributor.location,
            'items': items_list,
            'total_points': total_points,
            'rejected_by': rejected_by.username,
            'requested_by': request_obj.requested_by.username,
            'rejection_reason': request_obj.rejection_reason or 'No reason provided',
            'remarks': request_obj.remarks or '',
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


def send_request_processed_email(request_obj, distributor, processed_by):
    """
    Send email notification when a redemption request is marked as processed
    
    Args:
        request_obj: RedemptionRequest model instance
        distributor: Distributor model instance
        processed_by: User who processed the request
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        recipient_email = request_obj.requested_by.profile.email
        
        if not recipient_email:
            logger.warning(f"No email address found for user {request_obj.requested_by.username}")
            return False
        
        logger.debug(f"Preparing processed email for request #{request_obj.id}")
        
        # Get approver's email for CC (field is reviewed_by in the model)
        cc_list = []
        if request_obj.reviewed_by and hasattr(request_obj.reviewed_by, 'profile'):
            approver_email = request_obj.reviewed_by.profile.email
            if approver_email and approver_email != recipient_email:
                cc_list.append(approver_email)
                logger.debug(f"CC'ing approver: {approver_email}")
        
        # Calculate total items and points
        items_list = []
        total_points = 0
        
        for item in request_obj.items.all():
            items_list.append({
                'name': item.variant.catalogue_item.item_name,
                'sku': item.variant.item_code,
                'quantity': item.quantity,
                'points_per_unit': item.points_per_item,
                'total_points': item.total_points
            })
            total_points += item.total_points
        
        # Format date_processed for display
        date_processed_str = ''
        if request_obj.date_processed:
            date_processed_str = request_obj.date_processed.strftime('%B %d, %Y at %I:%M %p')
        
        context = {
            'request_id': request_obj.id,
            'distributor_name': distributor.name,
            'distributor_location': distributor.location,
            'items': items_list,
            'total_points': total_points,
            'processed_by': processed_by.username,
            'requested_by': request_obj.requested_by.username,
            'approved_by': request_obj.reviewed_by.username if request_obj.reviewed_by else 'N/A',
            'date_processed': date_processed_str,
            'remarks': request_obj.remarks or '',
        }
        
        return send_html_email(
            subject=f"Request #{request_obj.id} Processed - {distributor.name}",
            template_name='emails/request_processed.html',
            context=context,
            recipient_list=[recipient_email],
            cc_list=cc_list
        )
        
    except Exception as e:
        logger.error(f"Error sending processed email for request #{request_obj.id}: {str(e)}")
        logger.exception("Full traceback:")
        return False


def send_account_created_email(username, password, full_name, email, position):
    """
    Send email notification when a new account is created
    
    Args:
        username (str): User's username
        password (str): User's plain text password
        full_name (str): User's full name
        email (str): User's email address
        position (str): User's position/role
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        logger.debug(f"Preparing account creation email for {username} ({email})")
        
        context = {
            'username': username,
            'password': password,
            'full_name': full_name,
            'position': position,
        }
        
        return send_html_email(
            subject=f"Welcome to Points Redemption System - Your Account Details",
            template_name='emails/account_created.html',
            context=context,
            recipient_list=[email]
        )
        
    except Exception as e:
        logger.error(f"Error sending account creation email to {email}: {str(e)}")
        logger.exception("Full traceback:")
        return False


def send_otp_email(email, full_name, username, otp_code):
    """
    Send OTP email for password reset
    
    Args:
        email (str): User's email address
        full_name (str): User's full name
        username (str): User's username
        otp_code (str): Generated OTP code
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        logger.debug(f"Preparing OTP email for {username} ({email})")
        
        context = {
            'full_name': full_name,
            'username': username,
            'otp_code': otp_code,
        }
        
        return send_html_email(
            subject=f"Password Reset OTP - Points Redemption System",
            template_name='emails/forgot_password_otp.html',
            context=context,
            recipient_list=[email]
        )
        
    except Exception as e:
        logger.error(f"Error sending OTP email to {email}: {str(e)}")
        logger.exception("Full traceback:")
        return False


def send_password_changed_email(email, full_name, username):
    """
    Send confirmation email after password change
    
    Args:
        email (str): User's email address
        full_name (str): User's full name
        username (str): User's username
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        logger.debug(f"Preparing password changed confirmation email for {username} ({email})")
        
        context = {
            'full_name': full_name,
            'username': username,
        }
        
        return send_html_email(
            subject=f"Password Changed Successfully - Points Redemption System",
            template_name='emails/password_changed.html',
            context=context,
            recipient_list=[email]
        )
        
    except Exception as e:
        logger.error(f"Error sending password changed email to {email}: {str(e)}")
        logger.exception("Full traceback:")
        return False


def send_approved_request_notification_to_admin(request_obj, distributor, approved_by):
    """
    Send email notification to all superadmins when a request is approved
    
    Args:
        request_obj: RedemptionRequest model instance
        distributor: Distributor model instance
        approved_by: User who approved the request
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Import UserProfile here to avoid circular imports
        from users.models import UserProfile
        
        # Get all superadmin (Admin) emails
        admin_profiles = UserProfile.objects.filter(position='Admin')
        admin_emails = [profile.email for profile in admin_profiles if profile.email]
        
        if not admin_emails:
            logger.warning(f"No admin emails found for request #{request_obj.id} approval notification")
            return False
        
        logger.debug(f"Preparing admin notification email for approved request #{request_obj.id}")
        logger.debug(f"Sending to {len(admin_emails)} admin(s): {', '.join(admin_emails)}")
        
        # Calculate total items and points
        items_list = []
        total_points = 0
        
        for item in request_obj.items.all():
            items_list.append({
                'name': item.variant.catalogue_item.item_name,
                'sku': item.variant.item_code,
                'quantity': item.quantity,
                'points_per_unit': item.points_per_item,
                'total_points': item.total_points
            })
            total_points += item.total_points
        
        # Format date_reviewed for display
        date_approved_str = ''
        if request_obj.date_reviewed:
            date_approved_str = request_obj.date_reviewed.strftime('%B %d, %Y at %I:%M %p')
        
        context = {
            'request_id': request_obj.id,
            'distributor_name': distributor.name,
            'distributor_location': distributor.location,
            'items': items_list,
            'total_points': total_points,
            'approved_by': approved_by.username,
            'requested_by': request_obj.requested_by.username,
            'date_approved': date_approved_str,
            'points_deducted_from': request_obj.points_deducted_from,
        }
        
        return send_html_email(
            subject=f"Request #{request_obj.id} Approved - Ready for Processing",
            template_name='emails/approved_request_for_processing.html',
            context=context,
            recipient_list=admin_emails
        )
        
    except Exception as e:
        logger.error(f"Error sending admin notification for approved request #{request_obj.id}: {str(e)}")
        logger.exception("Full traceback:")
        return False


def send_request_submitted_email(request_obj, distributor, approvers_emails):
    """
    Send email notification to approvers when a redemption request is submitted
    
    Args:
        request_obj: RedemptionRequest model instance
        distributor: Distributor model instance
        approvers_emails: List of approver email addresses
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        if not approvers_emails:
            logger.warning(f"No approver emails provided for request #{request_obj.id}")
            return False
        
        logger.debug(f"Preparing submission notification email for request #{request_obj.id}")
        logger.debug(f"Sending to {len(approvers_emails)} approvers: {', '.join(approvers_emails)}")
        
        # Get sales agent profile details
        sales_agent_profile = request_obj.requested_by.profile
        
        # Calculate total items and points
        items_list = []
        total_points = 0
        
        for item in request_obj.items.all():
            items_list.append({
                'name': item.variant.catalogue_item.item_name,
                'sku': item.variant.item_code,
                'quantity': item.quantity,
                'points_per_unit': item.points_per_item,
                'total_points': item.total_points
            })
            total_points += item.total_points
        
        # Determine deductee and their points based on points_deducted_from
        if request_obj.points_deducted_from == 'SELF':
            deductee_name = sales_agent_profile.full_name
            deductee_current_points = sales_agent_profile.points
        else:  # 'DISTRIBUTOR'
            deductee_name = distributor.name
            deductee_current_points = distributor.points
        
        # Calculate remaining balance after deduction (projected)
        deductee_remaining_points = deductee_current_points - total_points
        
        context = {
            'request_id': request_obj.id,
            'sales_agent_name': sales_agent_profile.full_name,
            'sales_agent_username': request_obj.requested_by.username,
            'date_requested': request_obj.date_requested.strftime('%B %d, %Y at %I:%M %p'),
            'distributor_name': distributor.name,
            'distributor_location': distributor.location,
            'items': items_list,
            'total_points': total_points,
            'points_deducted_from': request_obj.points_deducted_from,
            'remarks': request_obj.remarks or '',
            # Points balance information
            'deductee_name': deductee_name,
            'deductee_current_points': deductee_current_points,
            'deductee_remaining_points': deductee_remaining_points,
        }
        
        return send_html_email(
            subject=f"New Redemption Request #{request_obj.id} - {distributor.name}",
            template_name='emails/request_submitted.html',
            context=context,
            recipient_list=approvers_emails
        )
        
    except Exception as e:
        logger.error(f"Error sending submission email for request #{request_obj.id}: {str(e)}")
        logger.exception("Full traceback:")
        return False


def send_approver_assigned_to_team_email(team, approver, assigned_by):
    """
    Send email notification when an approver is assigned to a team
    
    Args:
        team: Team model instance
        approver: User who was assigned as approver
        assigned_by: User who made the assignment
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        if not hasattr(approver, 'profile') or not approver.profile.email:
            logger.warning(f"No email address found for approver {approver.username}")
            return False
        
        recipient_email = approver.profile.email
        logger.debug(f"Preparing approver assignment email for {approver.username} ({recipient_email})")
        
        # Get member count
        member_count = team.memberships.count() if hasattr(team, 'memberships') else 0
        
        # Get marketing admin name if exists
        marketing_admin_name = None
        if team.marketing_admin and hasattr(team.marketing_admin, 'profile'):
            marketing_admin_name = team.marketing_admin.profile.full_name
        
        # Get assigner name
        assigned_by_name = 'System'
        if assigned_by and hasattr(assigned_by, 'profile'):
            assigned_by_name = assigned_by.profile.full_name
        elif assigned_by:
            assigned_by_name = assigned_by.username
        
        context = {
            'team_name': team.name,
            'approver_full_name': approver.profile.full_name,
            'member_count': member_count,
            'marketing_admin_name': marketing_admin_name,
            'assigned_by': assigned_by_name,
        }
        
        return send_html_email(
            subject=f"You've been assigned as Approver for {team.name}",
            template_name='emails/added_to_a_team_approver.html',
            context=context,
            recipient_list=[recipient_email]
        )
        
    except Exception as e:
        logger.error(f"Error sending approver assignment email: {str(e)}")
        logger.exception("Full traceback:")
        return False


def send_agent_added_to_team_email(team, agent, added_by):
    """
    Send email notification when a sales agent is added to a team
    
    Args:
        team: Team model instance
        agent: User who was added to the team
        added_by: User who added the agent
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        if not hasattr(agent, 'profile') or not agent.profile.email:
            logger.warning(f"No email address found for agent {agent.username}")
            return False
        
        recipient_email = agent.profile.email
        logger.debug(f"Preparing team addition email for {agent.username} ({recipient_email})")
        
        # Get approver info
        approver_name = None
        approver_email = None
        if team.approver and hasattr(team.approver, 'profile'):
            approver_name = team.approver.profile.full_name
            approver_email = team.approver.profile.email
        
        # Get adder name
        added_by_name = 'System'
        if added_by and hasattr(added_by, 'profile'):
            added_by_name = added_by.profile.full_name
        elif added_by:
            added_by_name = added_by.username
        
        # Format current date
        from django.utils import timezone
        date_added = timezone.now().strftime('%B %d, %Y at %I:%M %p')
        
        context = {
            'team_name': team.name,
            'agent_full_name': agent.profile.full_name,
            'approver_name': approver_name,
            'approver_email': approver_email,
            'added_by': added_by_name,
            'date_added': date_added,
        }
        
        return send_html_email(
            subject=f"Welcome to {team.name} - Points Redemption System",
            template_name='emails/added_to_a_team_agent.html',
            context=context,
            recipient_list=[recipient_email]
        )
        
    except Exception as e:
        logger.error(f"Error sending agent team addition email: {str(e)}")
        logger.exception("Full traceback:")
        return False


def send_request_withdrawn_email(request_obj, distributor, withdrawn_by):
    """
    Send email notification to approver when a sales agent withdraws their request
    
    Args:
        request_obj: RedemptionRequest model instance
        distributor: Distributor model instance
        withdrawn_by: User who withdrew the request (sales agent)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Send to the team approver
        if not request_obj.team or not request_obj.team.approver:
            logger.warning(f"No team approver found for withdrawn request #{request_obj.id}")
            return False
        
        approver = request_obj.team.approver
        if not hasattr(approver, 'profile') or not approver.profile.email:
            logger.warning(f"No email address found for approver {approver.username}")
            return False
        
        recipient_email = approver.profile.email
        logger.debug(f"Preparing withdrawal email for request #{request_obj.id} to {recipient_email}")
        
        # Get sales agent profile details
        sales_agent_profile = withdrawn_by.profile
        
        # Calculate total items and points
        items_list = []
        total_points = 0
        
        for item in request_obj.items.all():
            items_list.append({
                'name': item.variant.catalogue_item.item_name,
                'sku': item.variant.item_code,
                'quantity': item.quantity,
                'points_per_unit': item.points_per_item,
                'total_points': item.total_points
            })
            total_points += item.total_points
        
        # Format date_cancelled for display
        date_withdrawn_str = ''
        if request_obj.date_cancelled:
            date_withdrawn_str = request_obj.date_cancelled.strftime('%B %d, %Y at %I:%M %p')
        
        context = {
            'request_id': request_obj.id,
            'sales_agent_name': sales_agent_profile.full_name,
            'sales_agent_username': withdrawn_by.username,
            'approver_name': approver.profile.full_name if hasattr(approver, 'profile') else approver.username,
            'distributor_name': distributor.name,
            'distributor_location': distributor.location,
            'items': items_list,
            'total_points': total_points,
            'withdrawal_reason': request_obj.withdrawal_reason or 'No reason provided',
            'date_withdrawn': date_withdrawn_str,
            'remarks': request_obj.remarks or '',
        }
        
        return send_html_email(
            subject=f"Request #{request_obj.id} Withdrawn by {sales_agent_profile.full_name}",
            template_name='emails/request_withdrawn.html',
            context=context,
            recipient_list=[recipient_email]
        )
        
    except Exception as e:
        logger.error(f"Error sending withdrawal email for request #{request_obj.id}: {str(e)}")
        logger.exception("Full traceback:")
        return False


def send_request_withdrawn_confirmation_email(request_obj, distributor, withdrawn_by):
    """
    Send confirmation email to the sales agent after they withdraw their request
    
    Args:
        request_obj: RedemptionRequest model instance
        distributor: Distributor model instance
        withdrawn_by: User who withdrew the request (sales agent)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Send to the sales agent who withdrew
        if not hasattr(withdrawn_by, 'profile') or not withdrawn_by.profile.email:
            logger.warning(f"No email address found for sales agent {withdrawn_by.username}")
            return False
        
        recipient_email = withdrawn_by.profile.email
        sales_agent_profile = withdrawn_by.profile
        
        logger.debug(f"Preparing withdrawal confirmation email for request #{request_obj.id} to {recipient_email}")
        
        # Calculate total items and points
        items_list = []
        total_points = 0
        
        for item in request_obj.items.all():
            items_list.append({
                'name': item.variant.catalogue_item.item_name,
                'sku': item.variant.item_code,
                'quantity': item.quantity,
                'points_per_unit': item.points_per_item,
                'total_points': item.total_points
            })
            total_points += item.total_points
        
        # Format date_cancelled for display
        date_withdrawn_str = ''
        if request_obj.date_cancelled:
            date_withdrawn_str = request_obj.date_cancelled.strftime('%B %d, %Y at %I:%M %p')
        
        context = {
            'request_id': request_obj.id,
            'sales_agent_name': sales_agent_profile.full_name,
            'distributor_name': distributor.name,
            'distributor_location': distributor.location,
            'items': items_list,
            'total_points': total_points,
            'withdrawal_reason': request_obj.withdrawal_reason or 'No reason provided',
            'date_withdrawn': date_withdrawn_str,
        }
        
        return send_html_email(
            subject=f"Request #{request_obj.id} Withdrawn Successfully",
            template_name='emails/request_witdrawn_success.html',
            context=context,
            recipient_list=[recipient_email]
        )
        
    except Exception as e:
        logger.error(f"Error sending withdrawal confirmation email for request #{request_obj.id}: {str(e)}")
        logger.exception("Full traceback:")
        return False
