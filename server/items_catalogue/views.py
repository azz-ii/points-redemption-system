from django.shortcuts import render
import logging
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Q, Case, When, Value, CharField, F, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.pagination import PageNumberPagination
from .models import Product
from .serializers import ProductSerializer, ProductInventorySerializer

logger = logging.getLogger(__name__)


class CataloguePagination(PageNumberPagination):
    """Pagination for catalogue products"""
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 1000


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session authentication without CSRF checks for API endpoints"""
    def enforce_csrf(self, request):
        return  # Skip CSRF check


class ProductListCreateView(APIView):
    """List all products or create a new product"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]  # TEMP: Allow unauthenticated access for testing
    
    def get(self, request):
        """Get paginated list of products"""
        search = request.query_params.get('search', '').strip()

        products = Product.objects.all()

        if search:
            products = products.filter(
                Q(item_name__icontains=search) |
                Q(item_code__icontains=search) |
                Q(legend__icontains=search) |
                Q(category__icontains=search) |
                Q(description__icontains=search)
            )

        products = products.order_by('item_name', 'id')

        paginator = CataloguePagination()
        paginated_products = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(paginated_products, many=True)

        return paginator.get_paginated_response(serializer.data)
    
    def post(self, request):
        """Create a new product"""
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user if request.user.is_authenticated else None
            product = serializer.save(added_by=user)
            return Response({
                "message": "Product created successfully",
                "product": ProductSerializer(product).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "error": "Failed to create product",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailView(APIView):
    """Retrieve, update or delete a product"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]  # TEMP: Allow unauthenticated access for testing
    
    def get(self, request, product_id):
        """Get a specific product's details"""
        try:
            product = Product.objects.get(id=product_id)
            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({
                "error": "Product not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, product_id):
        """Update a product's details"""
        try:
            product = Product.objects.get(id=product_id)
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Product updated successfully",
                    "product": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "error": "Failed to update product",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({
                "error": "Product not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request, product_id):
        """Partially update a product's details"""
        try:
            product = Product.objects.get(id=product_id)
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Product updated successfully",
                    "product": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "error": "Failed to update product",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({
                "error": "Product not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, product_id):
        """Delete a product"""
        try:
            product = Product.objects.get(id=product_id)
            product.delete()
            return Response({
                "message": "Product deleted successfully"
            }, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({
                "error": "Product not found"
            }, status=status.HTTP_404_NOT_FOUND)


class InventoryPagination(PageNumberPagination):
    """Pagination for inventory items"""
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 1000


class InventoryListView(APIView):
    """List all inventory items (products with stock info) or filter by status"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]  # TEMP: Allow unauthenticated access for testing
    
    def get(self, request):
        """Get paginated list of inventory items with stock status (only items that track stock)"""
        search = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        
        # Only show items that track inventory (has_stock=True)
        products = Product.objects.filter(has_stock=True)
        
        if search:
            products = products.filter(
                Q(item_name__icontains=search) |
                Q(item_code__icontains=search) |
                Q(legend__icontains=search)
            )
        
        # Annotate with stock status for filtering
        products = products.annotate(
            stock_status=Case(
                When(stock=0, then=Value('Out of Stock')),
                When(stock__lte=10, then=Value('Low Stock')),
                default=Value('In Stock'),
                output_field=CharField(),
            )
        )
        
        if status_filter:
            if status_filter.lower() == 'out of stock':
                products = products.filter(stock=0)
            elif status_filter.lower() == 'low stock':
                products = products.filter(stock__gt=0, stock__lte=10)
            elif status_filter.lower() == 'in stock':
                products = products.filter(stock__gt=10)
        
        products = products.order_by('item_name', 'id')
        
        paginator = InventoryPagination()
        paginated_products = paginator.paginate_queryset(products, request)
        serializer = ProductInventorySerializer(paginated_products, many=True)
        
        return paginator.get_paginated_response(serializer.data)


class InventoryDetailView(APIView):
    """Update stock for a specific product"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]  # TEMP: Allow unauthenticated access for testing
    
    def get(self, request, product_id):
        """Get a specific product's inventory details"""
        try:
            product = Product.objects.get(id=product_id)
            serializer = ProductInventorySerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({
                "error": "Product not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request, product_id):
        """Update stock and/or reorder level for a product"""
        try:
            product = Product.objects.get(id=product_id)
            
            stock = request.data.get('stock')
            
            if stock is not None:
                try:
                    product.stock = int(stock)
                except (ValueError, TypeError):
                    return Response({
                        "error": "Stock must be a valid integer"
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            product.save()
            
            serializer = ProductInventorySerializer(product)
            return Response({
                "message": "Stock updated successfully",
                "item": serializer.data
            }, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({
                "error": "Product not found"
            }, status=status.HTTP_404_NOT_FOUND)


class BulkAssignMarketingView(APIView):
    """Bulk assign mktg_admin (Marketing user) to products by legend"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]  # TEMP: Allow unauthenticated access for testing
    
    def post(self, request):
        """
        Bulk assign a Marketing user to all products with a specific legend.
        
        Request body:
        {
            "legend": "GIVEAWAY",      // Assign to all products with this legend
            "mktg_admin_id": 5         // User ID of the Marketing user (null to unassign)
        }
        """
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        mktg_admin_id = request.data.get('mktg_admin_id')
        legend = request.data.get('legend')
        
        if not legend:
            return Response({
                "error": "'legend' must be provided"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        mktg_admin = None
        if mktg_admin_id is not None:
            try:
                mktg_admin = User.objects.get(id=mktg_admin_id)
                profile = getattr(mktg_admin, 'profile', None)
                if not profile or profile.position not in ['Marketing', 'Admin']:
                    return Response({
                        "error": "The specified user is not a Marketing or Admin user"
                    }, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({
                    "error": "User not found"
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Update all products with the specified legend
        queryset = Product.objects.filter(legend=legend)
        updated_count = queryset.update(mktg_admin=mktg_admin)
        
        action = "assigned" if mktg_admin else "unassigned"
        return Response({
            "message": f"Successfully {action} {updated_count} product(s)",
            "updated_count": updated_count,
            "mktg_admin_id": mktg_admin_id
        }, status=status.HTTP_200_OK)
    
    def get(self, request):
        """Get summary of marketing assignments by legend."""
        summary = Product.objects.values(
            'legend', 
            'mktg_admin__id', 
            'mktg_admin__username'
        ).annotate(
            count=Count('id')
        ).order_by('legend', 'mktg_admin__username')
        
        formatted = []
        for item in summary:
            formatted.append({
                'legend': item['legend'],
                'mktg_admin_id': item['mktg_admin__id'],
                'mktg_admin_username': item['mktg_admin__username'] or 'Unassigned',
                'item_count': item['count']
            })
        
        legend_totals = Product.objects.values('legend').annotate(
            total=Count('id'),
            assigned=Count('mktg_admin')
        ).order_by('legend')
        
        return Response({
            "assignments": formatted,
            "legend_totals": list(legend_totals)
        }, status=status.HTTP_200_OK)


# Backward-compatible aliases for URL routing
CatalogueItemListCreateView = ProductListCreateView
CatalogueItemDetailView = ProductDetailView
CatalogueItemUpdateView = ProductDetailView  # PUT to /catalogue/<id>/ now handles updates
