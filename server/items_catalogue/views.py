from django.shortcuts import render
import logging
import os
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Q, Case, When, Value, CharField, F, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Product
from .serializers import ProductSerializer, ProductInventorySerializer

ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB

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
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
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
        data = request.data.copy()

        # Handle image upload
        if 'image' in request.FILES:
            image = request.FILES['image']
            if image.content_type not in ALLOWED_IMAGE_TYPES:
                return Response({
                    "error": "Invalid image type. Allowed: JPG, PNG, WebP"
                }, status=status.HTTP_400_BAD_REQUEST)
            if image.size > MAX_IMAGE_SIZE:
                return Response({
                    "error": "Image size must be less than 5MB"
                }, status=status.HTTP_400_BAD_REQUEST)
            data['image'] = image
        
        # Handle explicit image removal
        if data.get('image') == '' or data.get('image') == 'null':
            data['image'] = None

        serializer = ProductSerializer(data=data)
        if serializer.is_valid():
            user = request.user if request.user.is_authenticated else None
            product = serializer.save(added_by=user)
            return Response({
                "message": "Product created successfully",
                "product": ProductSerializer(product, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "error": "Failed to create product",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailView(APIView):
    """Retrieve, update or delete a product"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]  # TEMP: Allow unauthenticated access for testing
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
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
    
    def _handle_image(self, request, data, product=None):
        """Handle image upload/removal for product updates"""
        if 'image' in request.FILES:
            image = request.FILES['image']
            if image.content_type not in ALLOWED_IMAGE_TYPES:
                return Response({
                    "error": "Invalid image type. Allowed: JPG, PNG, WebP"
                }, status=status.HTTP_400_BAD_REQUEST)
            if image.size > MAX_IMAGE_SIZE:
                return Response({
                    "error": "Image size must be less than 5MB"
                }, status=status.HTTP_400_BAD_REQUEST)
            # Delete old image if replacing
            if product and product.image:
                old_path = product.image.path
                if os.path.isfile(old_path):
                    os.remove(old_path)
            data['image'] = image
        elif data.get('remove_image') == 'true' or data.get('image') == '':
            # Explicit removal
            if product and product.image:
                old_path = product.image.path
                if os.path.isfile(old_path):
                    os.remove(old_path)
            data['image'] = None
            data.pop('remove_image', None)
        return None  # No error

    def put(self, request, product_id):
        """Update a product's details"""
        try:
            product = Product.objects.get(id=product_id)
            data = request.data.copy()
            error_response = self._handle_image(request, data, product)
            if error_response:
                return error_response
            serializer = ProductSerializer(product, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Product updated successfully",
                    "product": ProductSerializer(product, context={'request': request}).data
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
            data = request.data.copy()
            error_response = self._handle_image(request, data, product)
            if error_response:
                return error_response
            serializer = ProductSerializer(product, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Product updated successfully",
                    "product": ProductSerializer(product, context={'request': request}).data
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


class BulkUpdateStockView(APIView):
    """Bulk update stock for all inventory-tracked items with password verification"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]  # TEMP: Will add proper auth
    
    def post(self, request):
        """Apply stock delta to all items with inventory tracking"""
        # Check authentication
        if not request.user.is_authenticated:
            return Response({
                "error": "Authentication required"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is superadmin
        if not request.user.is_superuser:
            profile = getattr(request.user, 'profile', None)
            is_admin = profile and profile.position == 'Admin'
            if not is_admin:
                return Response({
                    "error": "Only superadmins can perform bulk stock update"
                }, status=status.HTTP_403_FORBIDDEN)
        
        # Get password from request
        password = request.data.get('password', '')
        if not password:
            return Response({
                "error": "Password is required for verification"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify password
        if not request.user.check_password(password):
            return Response({
                "error": "Invalid password"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if this is a reset operation
        reset_to_zero = request.data.get('reset_to_zero', False)
        
        if reset_to_zero:
            stock_delta = None
            operation = "reset"
        else:
            # Get stock delta
            stock_delta = request.data.get('stock_delta')
            if stock_delta is None:
                return Response({
                    "error": "Stock delta is required when not resetting"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                stock_delta = int(stock_delta)
            except (ValueError, TypeError):
                return Response({
                    "error": "Stock delta must be a valid integer"
                }, status=status.HTTP_400_BAD_REQUEST)
            operation = "update"
        
        try:
            # Get all products with inventory tracking enabled
            tracked_items = Product.objects.filter(has_stock=True)
            
            updated_count = 0
            failed_count = 0
            failed_items = []
            
            # Update each item's stock
            for item in tracked_items:
                try:
                    if reset_to_zero:
                        item.stock = 0
                    else:
                        # Calculate new stock, ensure it doesn't go negative
                        new_stock = max(0, item.stock + stock_delta)
                        item.stock = new_stock
                    item.save(update_fields=['stock'])
                    updated_count += 1
                except Exception as e:
                    logger.error(f"Failed to update stock for item {item.item_code}: {str(e)}")
                    failed_count += 1
                    failed_items.append(item.item_code)
            
            if reset_to_zero:
                message = f"Successfully reset stock to 0 for {updated_count} item(s)"
                log_message = f"Bulk stock reset by {request.user.username}: Reset {updated_count} items to 0"
            else:
                message = f"Successfully updated stock for {updated_count} item(s)"
                log_message = f"Bulk stock update by {request.user.username}: {stock_delta:+d} stock to {updated_count} items"
            
            response_data = {
                "message": message,
                "updated_count": updated_count,
                "failed_count": failed_count,
                "total_affected": len(tracked_items),
                "operation": operation
            }
            
            if not reset_to_zero:
                response_data["stock_delta"] = stock_delta
            
            if failed_count > 0:
                response_data["failed_items"] = failed_items
                response_data["message"] = f"Updated {updated_count} of {len(tracked_items)} items. {failed_count} failed."
            
            logger.info(log_message)
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Bulk stock update failed: {str(e)}")
            return Response({
                "error": f"Failed to update stock: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BatchUpdateStockView(APIView):
    """Batch update stock for specific inventory items (optimized single request)"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [AllowAny]  # TEMP: Will add proper auth
    
    def post(self, request):
        """Update stock for multiple specific items in a single request"""
        # Check authentication
        if not request.user.is_authenticated:
            return Response({
                "error": "Authentication required"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        updates = request.data.get('updates', [])
        
        if not updates:
            return Response({
                "error": "No updates provided"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        updated_ids = []
        failed = []
        
        for update in updates:
            try:
                item_id = update.get('id')
                new_stock = update.get('stock')
                
                if item_id is None or new_stock is None:
                    failed.append({'id': item_id, 'error': 'Missing id or stock'})
                    continue
                
                product = Product.objects.get(id=item_id, has_stock=True)
                product.stock = max(0, int(new_stock))
                product.save(update_fields=['stock'])
                updated_ids.append(item_id)
            except Product.DoesNotExist:
                failed.append({'id': item_id, 'error': 'Product not found or not inventory-tracked'})
            except (ValueError, TypeError) as e:
                failed.append({'id': item_id, 'error': f'Invalid stock value: {str(e)}'})
            except Exception as e:
                logger.error(f"Failed to update stock for item {item_id}: {str(e)}")
                failed.append({'id': item_id, 'error': str(e)})
        
        return Response({
            "message": f"Updated {len(updated_ids)} item(s)",
            "updated_count": len(updated_ids),
            "failed_count": len(failed),
            "updated_ids": updated_ids,
            "failed": failed if failed else None
        }, status=status.HTTP_200_OK)


# Backward-compatible aliases for URL routing
CatalogueItemListCreateView = ProductListCreateView
CatalogueItemDetailView = ProductDetailView
CatalogueItemUpdateView = ProductDetailView  # PUT to /catalogue/<id>/ now handles updates
