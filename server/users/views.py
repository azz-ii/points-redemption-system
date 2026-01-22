from django.shortcuts import render
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
import logging
import io
from datetime import datetime
from utils.email_service import send_account_created_email

# Configure logger for user operations
logger = logging.getLogger('email')

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session authentication without CSRF checks for API endpoints"""
    def enforce_csrf(self, request):
        return  # Skip CSRF check

from .models import UserProfile
from .serializers import UserSerializer, UserListSerializer

@method_decorator(csrf_exempt, name='dispatch')
class UserListCreateView(APIView):
    """List all users or create a new user"""
    
    def get(self, request):
        """Get list of all users with their profiles, excluding superusers"""
        users = User.objects.filter(is_superuser=False).select_related('profile')
        serializer = UserListSerializer(users, many=True)
        return Response({"accounts": serializer.data}, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new user with profile"""
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            # Save the password before hashing for email
            plain_password = request.data.get('password', '')
            username = request.data.get('username', '')
            full_name = request.data.get('full_name', '')
            email = request.data.get('email', '')
            position = request.data.get('position', '')
            
            # Create the user
            user = serializer.save()
            
            # Send welcome email with credentials
            logger.info(f"New account created for {username}, sending welcome email...")
            email_sent = send_account_created_email(
                username=username,
                password=plain_password,
                full_name=full_name,
                email=email,
                position=position
            )
            
            if email_sent:
                logger.info(f"✓ Welcome email sent to {email}")
            else:
                logger.warning(f"⚠ Failed to send welcome email to {email}")
            
            return Response({
                "message": "User created successfully",
                "user": serializer.data,
                "email_sent": email_sent
            }, status=status.HTTP_201_CREATED)
        return Response({
            "error": "Failed to create user",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class UserDetailView(APIView):
    """Retrieve, update or delete a user"""
    
    def get(self, request, user_id):
        """Get a specific user's details"""
        try:
            user = User.objects.select_related('profile').get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, user_id):
        """Update a user's details"""
        try:
            user = User.objects.select_related('profile').get(id=user_id)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "User updated successfully",
                    "user": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "error": "Failed to update user",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, user_id):
        """Delete a user"""
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response({
                "message": "User deleted successfully"
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class CurrentUserView(APIView):
    """Get current authenticated user's profile"""
    authentication_classes = [CsrfExemptSessionAuthentication]  # Use session auth to load user
    permission_classes = []  # No permission checks - we'll check manually
    
    def get(self, request):
        """Get current user's profile details"""
        # Manually check if user is authenticated via Django session
        if not request.user.is_authenticated:
            return Response({
                "error": "Not authenticated",
                "details": "User is not logged in. Please login first.",
                "debug": {
                    "user": str(request.user),
                    "session_key": request.session.session_key,
                    "has_sessionid_cookie": "sessionid" in request.COOKIES
                }
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user = request.user
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": "Failed to get user profile",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class UserExportView(APIView):
    """Export users to PDF or Excel format"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = []
    
    # Available columns for export
    AVAILABLE_COLUMNS = {
        'id': 'ID',
        'username': 'Username',
        'full_name': 'Full Name',
        'email': 'Email',
        'position': 'Position',
        'points': 'Points',
        'status': 'Status',
    }
    
    def _get_account_status(self, user):
        """Get display status of an account"""
        if hasattr(user, 'profile'):
            if user.profile.is_banned:
                return 'Banned'
            if user.profile.is_activated:
                return 'Active'
        return 'Inactive'
    
    def _get_cell_value(self, user, column):
        """Get cell value for export"""
        if column == 'id':
            return user.id
        elif column == 'username':
            return user.username
        elif column == 'full_name':
            return user.profile.full_name if hasattr(user, 'profile') else ''
        elif column == 'email':
            return user.profile.email if hasattr(user, 'profile') else ''
        elif column == 'position':
            return user.profile.position if hasattr(user, 'profile') else ''
        elif column == 'points':
            return user.profile.points if hasattr(user, 'profile') else 0
        elif column == 'status':
            return self._get_account_status(user)
        return ''
    
    def _sort_users(self, users, sort_field, sort_direction):
        """Sort users by field and direction"""
        reverse = sort_direction == 'desc'
        
        if sort_field == 'status':
            return sorted(users, key=lambda u: self._get_account_status(u), reverse=reverse)
        elif sort_field in ['full_name', 'email', 'position']:
            return sorted(users, key=lambda u: getattr(u.profile, sort_field, '') if hasattr(u, 'profile') else '', reverse=reverse)
        elif sort_field == 'points':
            return sorted(users, key=lambda u: u.profile.points if hasattr(u, 'profile') else 0, reverse=reverse)
        elif sort_field == 'id':
            return sorted(users, key=lambda u: u.id, reverse=reverse)
        elif sort_field == 'username':
            return sorted(users, key=lambda u: u.username, reverse=reverse)
        return users
    
    def post(self, request):
        """Export users based on provided options"""
        # Check authentication
        if not request.user.is_authenticated:
            return Response({
                "error": "Authentication required"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Parse request data
        columns = request.data.get('columns', list(self.AVAILABLE_COLUMNS.keys()))
        sort_field = request.data.get('sort_field', 'id')
        sort_direction = request.data.get('sort_direction', 'asc')
        export_format = request.data.get('format', 'excel')
        
        # Validate columns
        valid_columns = [c for c in columns if c in self.AVAILABLE_COLUMNS]
        if not valid_columns:
            return Response({
                "error": "No valid columns specified"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get users
        users = list(User.objects.filter(is_superuser=False).select_related('profile'))
        
        # Sort users
        users = self._sort_users(users, sort_field, sort_direction)
        
        # Generate export
        if export_format == 'pdf':
            return self._generate_pdf(users, valid_columns)
        else:
            return self._generate_excel(users, valid_columns)
    
    def _generate_excel(self, users, columns):
        """Generate Excel file"""
        try:
            from openpyxl import Workbook
            from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
            
            wb = Workbook()
            ws = wb.active
            ws.title = "Accounts"
            
            # Define styles
            header_font = Font(bold=True, color="FFFFFF")
            header_fill = PatternFill(start_color="1F2937", end_color="1F2937", fill_type="solid")
            header_alignment = Alignment(horizontal="center", vertical="center")
            thin_border = Border(
                left=Side(style='thin'),
                right=Side(style='thin'),
                top=Side(style='thin'),
                bottom=Side(style='thin')
            )
            
            # Write headers
            headers = [self.AVAILABLE_COLUMNS[col] for col in columns]
            for col_idx, header in enumerate(headers, 1):
                cell = ws.cell(row=1, column=col_idx, value=header)
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = header_alignment
                cell.border = thin_border
            
            # Write data rows
            for row_idx, user in enumerate(users, 2):
                for col_idx, column in enumerate(columns, 1):
                    value = self._get_cell_value(user, column)
                    cell = ws.cell(row=row_idx, column=col_idx, value=value)
                    cell.border = thin_border
            
            # Adjust column widths
            column_widths = {
                'id': 8,
                'username': 20,
                'full_name': 25,
                'email': 30,
                'position': 20,
                'points': 10,
                'status': 12,
            }
            for col_idx, column in enumerate(columns, 1):
                ws.column_dimensions[ws.cell(row=1, column=col_idx).column_letter].width = column_widths.get(column, 15)
            
            # Create response
            output = io.BytesIO()
            wb.save(output)
            output.seek(0)
            
            timestamp = datetime.now().strftime('%Y-%m-%d')
            filename = f"accounts_export_{timestamp}.xlsx"
            
            response = HttpResponse(
                output.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except ImportError:
            return Response({
                "error": "Excel export not available. Please install openpyxl."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _generate_pdf(self, users, columns):
        """Generate PDF file"""
        try:
            from reportlab.lib import colors
            from reportlab.lib.pagesizes import letter, landscape
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            
            output = io.BytesIO()
            
            # Use landscape for many columns
            page_size = landscape(letter) if len(columns) > 5 else letter
            doc = SimpleDocTemplate(output, pagesize=page_size, topMargin=0.5*inch, bottomMargin=0.5*inch)
            
            elements = []
            styles = getSampleStyleSheet()
            
            # Title
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                alignment=1,  # Center
                spaceAfter=12
            )
            elements.append(Paragraph("Accounts Export", title_style))
            
            # Subtitle with date and count
            subtitle_style = ParagraphStyle(
                'Subtitle',
                parent=styles['Normal'],
                fontSize=10,
                alignment=1,
                textColor=colors.grey,
                spaceAfter=20
            )
            elements.append(Paragraph(
                f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')} | Total Records: {len(users)}",
                subtitle_style
            ))
            
            # Table data
            headers = [self.AVAILABLE_COLUMNS[col] for col in columns]
            table_data = [headers]
            
            for user in users:
                row = [str(self._get_cell_value(user, col)) for col in columns]
                table_data.append(row)
            
            # Create table
            table = Table(table_data, repeatRows=1)
            
            # Table style
            table_style = TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F2937')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TOPPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
                ('TOPPADDING', (0, 1), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F3F4F6')]),
            ])
            table.setStyle(table_style)
            
            elements.append(table)
            
            # Build PDF
            doc.build(elements)
            output.seek(0)
            
            timestamp = datetime.now().strftime('%Y-%m-%d')
            filename = f"accounts_export_{timestamp}.pdf"
            
            response = HttpResponse(output.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except ImportError:
            return Response({
                "error": "PDF export not available. Please install reportlab."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
