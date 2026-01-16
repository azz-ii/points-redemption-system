from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.authentication import SessionAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from openpyxl import load_workbook
from .models import Customer
from .serializers import CustomerSerializer, BulkCustomerUploadSerializer

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session authentication without CSRF checks for API endpoints"""
    def enforce_csrf(self, request):
        return  # Skip CSRF check

class CustomerPagination(PageNumberPagination):
    """
    Pagination class for customers list.
    """
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 100

class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing customers.
    Provides CRUD operations for customer management.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]  # TEMP: Allow unauthenticated access for testing
    pagination_class = CustomerPagination
    
    def get_queryset(self):
        """
        All authenticated users can access all customers.
        Optionally filter based on query parameters.
        """
        # All users get full access to all customers
        queryset = Customer.objects.all()
        
        # Apply search filter if provided
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                contact_email__icontains=search
            ) | queryset.filter(
                location__icontains=search
            )
        
        return queryset.order_by('name')
    
    def perform_create(self, serializer):
        """
        Set the added_by field to the current user when creating.
        """
        serializer.save(added_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Custom search endpoint for customers.
        """
        return self.list(request)
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def bulk_upload(self, request):
        """
        Bulk upload customers from Excel file.
        Expects a single column "LIST OF CUSTOMERS" with customer names.
        Creates customers with placeholder values for required fields.
        """
        serializer = BulkCustomerUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid request', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        excel_file = serializer.validated_data['file']
        skip_duplicates = serializer.validated_data.get('skip_duplicates', True)
        
        # Validate file extension
        if not excel_file.name.endswith(('.xlsx', '.xls')):
            return Response(
                {'error': 'Invalid file format. Please upload an Excel file (.xlsx or .xls)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        imported_count = 0
        skipped_count = 0
        errors = []
        imported_customers = []
        
        try:
            # Load the workbook
            workbook = load_workbook(excel_file, read_only=True, data_only=True)
            sheet = workbook.active
            
            # Get existing customer names for duplicate checking
            existing_names = set(Customer.objects.values_list('name', flat=True)) if skip_duplicates else set()
            
            # Process rows
            header_found = False
            for row_num, row in enumerate(sheet.iter_rows(min_row=1, values_only=True), start=1):
                try:
                    # Skip empty rows
                    if not row or not any(row):
                        continue
                    
                    # Check for header row
                    if row_num == 1:
                        if row[0] and isinstance(row[0], str) and 'LIST OF CUSTOMERS' in row[0].upper():
                            header_found = True
                            continue
                    
                    # Get customer name from first column
                    customer_name = str(row[0]).strip() if row[0] else None
                    
                    # Validation
                    if not customer_name:
                        errors.append({'row': row_num, 'error': 'Empty customer name'})
                        continue
                    
                    if len(customer_name) > 255:
                        errors.append({
                            'row': row_num, 
                            'error': f'Customer name too long (max 255 chars): {customer_name[:50]}...'
                        })
                        continue
                    
                    # Check for duplicates
                    if skip_duplicates and customer_name in existing_names:
                        skipped_count += 1
                        continue
                    
                    # Create customer with placeholder values
                    customer = Customer.objects.create(
                        name=customer_name,
                        contact_email='pending@example.com',  # Placeholder
                        phone='000-000-0000',  # Placeholder
                        location='N/A',  # Placeholder
                        points=0,
                        is_archived=False,
                        added_by=request.user if request.user.is_authenticated else None
                    )
                    
                    existing_names.add(customer_name)
                    imported_count += 1
                    imported_customers.append({
                        'id': customer.id,
                        'name': customer.name,
                        'row': row_num
                    })
                    
                except Exception as e:
                    errors.append({'row': row_num, 'error': str(e)})
            
            workbook.close()
            
        except Exception as e:
            return Response(
                {'error': f'Error reading Excel file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Return summary
        return Response({
            'success': True,
            'message': f'Bulk upload completed',
            'summary': {
                'imported': imported_count,
                'skipped': skipped_count,
                'errors': len(errors)
            },
            'imported_customers': imported_customers,
            'errors': errors,
            'note': 'Placeholder values used for email (pending@example.com), phone (000-000-0000), and location (N/A)'
        }, status=status.HTTP_201_CREATED if imported_count > 0 else status.HTTP_200_OK)
