from django.shortcuts import render
import logging
import os
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Q, Case, When, Value, CharField, F, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Product, StockAuditLog, log_stock_change, bulk_log_stock_changes, generate_stock_batch_id
from .serializers import ProductSerializer, ProductInventorySerializer, StockAuditLogSerializer

ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB

logger = logging.getLogger(__name__)


class CataloguePagination(PageNumberPagination):
    """Pagination for catalogue products"""
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 1000


class ProductListCreateView(APIView):
    """List all products or create a new product"""
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get(self, request):
        """Get paginated list of products"""
        search = request.query_params.get('search', '').strip()
        show_archived = request.query_params.get('show_archived', 'false').lower() == 'true'

        products = Product.objects.all()

        # Apply archived filter - toggle between active and archived views
        if show_archived:
            # Show ONLY archived products
            products = products.filter(is_archived=True)
            logger.info(f"Showing archived products only - Found {products.count()} archived products")
        else:
            # Show ONLY active (non-archived) products
            products = products.filter(is_archived=False)
            logger.info(f"Showing active products only - Found {products.count()} active products")

        if search:
            products = products.filter(
                Q(item_name__icontains=search) |
                Q(item_code__icontains=search) |
                Q(legend__icontains=search) |
                Q(category__icontains=search) |
                Q(description__icontains=search)
            )
            logger.info(f"Filtering products by search: '{search}' - Found {products.count()} products")

        # Annotate with request frequency (count of approved redemption request items)
        products = products.annotate(
            request_count=Count(
                'redemption_items',
                filter=Q(redemption_items__request__status='APPROVED'),
            )
        )

        ordering = request.query_params.get('ordering', '').strip()
        if ordering == 'popularity':
            products = products.order_by('-request_count', 'item_name', 'id')
        else:
            products = products.order_by('item_name', 'id')

        paginator = CataloguePagination()
        paginated_products = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(paginated_products, many=True)

        return paginator.get_paginated_response(serializer.data)
    
    def post(self, request):
        """Create a new product"""
        # Use .dict() for QueryDict (multipart) to flatten list values; fallback for JSON
        data = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)

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
            # Use .dict() for QueryDict (multipart) to flatten list values; fallback for JSON
            data = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
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
            # Use .dict() for QueryDict (multipart) to flatten list values; fallback for JSON
            data = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
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
            
            # Log validation errors for debugging
            print(f"[PATCH /catalogue/{product_id}/] Validation errors:", serializer.errors)
            
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
        """Adjust stock for a product. Accepts adjustment (delta) and reason.
        Reason is required when decreasing stock."""
        try:
            product = Product.objects.get(id=product_id)
            
            adjustment = request.data.get('adjustment')
            reason = request.data.get('reason', '').strip()
            
            if adjustment is None:
                return Response({
                    "error": "Adjustment value is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                adjustment = int(adjustment)
            except (ValueError, TypeError):
                return Response({
                    "error": "Adjustment must be a valid integer"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if adjustment == 0:
                return Response({
                    "error": "Adjustment cannot be zero"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Require reason for decreases
            if adjustment < 0 and not reason:
                return Response({
                    "error": "Reason is required when decreasing stock"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate stock won't go below committed_stock
            new_stock = product.stock + adjustment
            if new_stock < 0:
                return Response({
                    "error": "Stock cannot go below zero"
                }, status=status.HTTP_400_BAD_REQUEST)
            if new_stock < product.committed_stock:
                return Response({
                    "error": f"Stock cannot go below committed stock ({product.committed_stock})"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            previous_stock = product.stock
            product.stock = new_stock
            product.save(update_fields=['stock'])
            
            # Log the change
            adj_type = StockAuditLog.AdjustmentType.ADD if adjustment > 0 else StockAuditLog.AdjustmentType.DECREASE
            user = request.user if request.user.is_authenticated else None
            log_stock_change(
                product=product,
                previous_stock=previous_stock,
                new_stock=new_stock,
                adjustment_type=adj_type,
                changed_by=user,
                reason=reason,
            )
            
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
    """Assign mktg_admin (Marketing user) to products — item-level or bulk by legend"""
    
    def post(self, request):
        """
        Assign a Marketing user to specific products (item-level) or all products of a legend (bulk).
        
        Item-level (preferred):
        {
            "product_ids": [1, 2, 3],
            "mktg_admin_id": 5          // null to unassign
        }
        
        Bulk by legend (convenience):
        {
            "legend": "Giveaway",
            "mktg_admin_id": 5          // null to unassign
        }
        """
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        mktg_admin_id = request.data.get('mktg_admin_id')
        product_ids = request.data.get('product_ids')
        legend = request.data.get('legend')
        
        if not product_ids and not legend:
            return Response({
                "error": "Either 'product_ids' or 'legend' must be provided"
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
        
        if product_ids:
            # Item-level assignment
            if not isinstance(product_ids, list):
                return Response({
                    "error": "'product_ids' must be a list"
                }, status=status.HTTP_400_BAD_REQUEST)
            queryset = Product.objects.filter(id__in=product_ids, is_archived=False)
        else:
            # Bulk by legend (backward-compatible)
            queryset = Product.objects.filter(legend=legend, is_archived=False)
        
        updated_count = queryset.update(mktg_admin=mktg_admin)
        
        action = "assigned" if mktg_admin else "unassigned"
        return Response({
            "message": f"Successfully {action} {updated_count} product(s)",
            "updated_count": updated_count,
            "mktg_admin_id": mktg_admin_id
        }, status=status.HTTP_200_OK)
    
    def get(self, request):
        """Get per-product marketing assignments with optional legend filter."""
        legend_filter = request.query_params.get('legend', '').strip()
        
        products_qs = Product.objects.filter(is_archived=False).select_related('mktg_admin')
        if legend_filter:
            products_qs = products_qs.filter(legend=legend_filter)
        products_qs = products_qs.order_by('legend', 'item_name')
        
        products = []
        for p in products_qs:
            products.append({
                'id': p.id,
                'item_code': p.item_code,
                'item_name': p.item_name,
                'legend': p.legend,
                'category': p.category,
                'mktg_admin_id': p.mktg_admin_id,
                'mktg_admin_username': p.mktg_admin.username if p.mktg_admin else None,
            })
        
        # Summary grouped by legend + user (backward-compatible)
        summary = Product.objects.filter(is_archived=False).values(
            'legend',
            'mktg_admin__id',
            'mktg_admin__username'
        ).annotate(
            count=Count('id')
        ).order_by('legend', 'mktg_admin__username')
        
        assignments = []
        for item in summary:
            assignments.append({
                'legend': item['legend'],
                'mktg_admin_id': item['mktg_admin__id'],
                'mktg_admin_username': item['mktg_admin__username'] or 'Unassigned',
                'item_count': item['count']
            })
        
        legend_totals = Product.objects.filter(is_archived=False).values('legend').annotate(
            total=Count('id'),
            assigned=Count('mktg_admin')
        ).order_by('legend')
        
        return Response({
            "products": products,
            "assignments": assignments,
            "legend_totals": list(legend_totals)
        }, status=status.HTTP_200_OK)


class BulkUpdateStockView(APIView):
    """Bulk update stock for all inventory-tracked items with password verification"""
    
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
        reason = str(request.data.get('reason', '')).strip()
        
        if reset_to_zero:
            stock_delta = None
            operation = "reset"
            # Reason is required for resets (they decrease stock)
            if not reason:
                return Response({
                    "error": "Reason is required for stock reset"
                }, status=status.HTTP_400_BAD_REQUEST)
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
            
            # Require reason for negative deltas
            if stock_delta < 0 and not reason:
                return Response({
                    "error": "Reason is required when decreasing stock"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            operation = "update"
        
        try:
            # Get all products with inventory tracking enabled
            tracked_items = Product.objects.filter(has_stock=True)
            
            updated_count = 0
            failed_count = 0
            failed_items = []
            audit_entries = []
            batch_id = generate_stock_batch_id()
            user = request.user if request.user.is_authenticated else None
            
            # Update each item's stock
            for item in tracked_items:
                try:
                    previous_stock = item.stock
                    if reset_to_zero:
                        item.stock = 0
                        adj_type = StockAuditLog.AdjustmentType.BULK_RESET
                    else:
                        # Calculate new stock, ensure it doesn't go negative
                        new_stock = max(0, item.stock + stock_delta)
                        item.stock = new_stock
                        adj_type = StockAuditLog.AdjustmentType.BULK_ADD if stock_delta > 0 else StockAuditLog.AdjustmentType.BULK_DECREASE
                    item.save(update_fields=['stock'])
                    updated_count += 1
                    
                    audit_entries.append({
                        'product': item,
                        'product_name': item.item_name,
                        'previous_stock': previous_stock,
                        'new_stock': item.stock,
                        'adjustment_type': adj_type,
                        'changed_by': user,
                        'reason': reason,
                        'batch_id': batch_id,
                    })
                except Exception as e:
                    logger.error(f"Failed to update stock for item {item.item_code}: {str(e)}")
                    failed_count += 1
                    failed_items.append(item.item_code)
            
            # Bulk log all audit entries
            if audit_entries:
                bulk_log_stock_changes(audit_entries)
            
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
        audit_entries = []
        batch_id = generate_stock_batch_id()
        user = request.user if request.user.is_authenticated else None
        
        for update in updates:
            try:
                item_id = update.get('id')
                adjustment = update.get('adjustment')
                reason = str(update.get('reason', '')).strip()
                
                if item_id is None or adjustment is None:
                    failed.append({'id': item_id, 'error': 'Missing id or adjustment'})
                    continue
                
                adjustment = int(adjustment)
                if adjustment == 0:
                    continue  # Skip no-ops
                
                # Require reason for decreases
                if adjustment < 0 and not reason:
                    failed.append({'id': item_id, 'error': 'Reason is required when decreasing stock'})
                    continue
                
                product = Product.objects.get(id=item_id, has_stock=True)
                
                new_stock = max(0, product.stock + adjustment)
                if new_stock < product.committed_stock:
                    failed.append({'id': item_id, 'error': f'Stock cannot go below committed stock ({product.committed_stock})'})
                    continue
                
                previous_stock = product.stock
                product.stock = new_stock
                product.save(update_fields=['stock'])
                updated_ids.append(item_id)
                
                adj_type = StockAuditLog.AdjustmentType.ADD if adjustment > 0 else StockAuditLog.AdjustmentType.DECREASE
                audit_entries.append({
                    'product': product,
                    'product_name': product.item_name,
                    'previous_stock': previous_stock,
                    'new_stock': new_stock,
                    'adjustment_type': adj_type,
                    'changed_by': user,
                    'reason': reason,
                    'batch_id': batch_id,
                })
            except Product.DoesNotExist:
                failed.append({'id': item_id, 'error': 'Product not found or not inventory-tracked'})
            except (ValueError, TypeError) as e:
                failed.append({'id': item_id, 'error': f'Invalid adjustment value: {str(e)}'})
            except Exception as e:
                logger.error(f"Failed to update stock for item {item_id}: {str(e)}")
                failed.append({'id': item_id, 'error': str(e)})
        
        # Bulk log all audit entries
        if audit_entries:
            bulk_log_stock_changes(audit_entries)
        
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


@method_decorator(csrf_exempt, name='dispatch')
class StockAuditLogListView(APIView):
    """List stock audit logs for a specific product with pagination."""

    def get(self, request, product_id):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        queryset = (
            StockAuditLog.objects
            .filter(product_id=product_id)
            .select_related('changed_by')
            .order_by('-created_at')
        )

        page = int(request.query_params.get('page', 1))
        page_size = min(int(request.query_params.get('page_size', 15)), 100)

        total_count = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        logs = queryset[start:end]

        serializer = StockAuditLogSerializer(logs, many=True)
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'results': serializer.data,
        })
