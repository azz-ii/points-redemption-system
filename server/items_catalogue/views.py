from django.shortcuts import render
import logging
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import CatalogueItem, Variant
from .serializers import CatalogueItemSerializer, VariantSerializer

logger = logging.getLogger(__name__)


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session authentication without CSRF checks for API endpoints"""
    def enforce_csrf(self, request):
        return  # Skip CSRF check


class CatalogueItemListCreateView(APIView):
    """List all catalogue variants or create a new item with variant"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        """Get list of all catalogue variants with nested catalogue_item"""
        variants = Variant.objects.select_related('catalogue_item').all()
        serializer = VariantSerializer(variants, many=True)
        return Response({"items": serializer.data}, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new catalogue item and multiple variants"""
        # Extract catalogue_item data (all fields except variants)
        catalogue_data = {
            'reward': request.data.get('reward'),
            'item_name': request.data.get('item_name'),
            'description': request.data.get('description'),
            'purpose': request.data.get('purpose'),
            'specifications': request.data.get('specifications'),
            'legend': request.data.get('legend'),
        }
        variants_data = request.data.get('variants', [])
        
        if not variants_data:
            return Response({
                "error": "At least one variant is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create catalogue item
        catalogue_serializer = CatalogueItemSerializer(data=catalogue_data)
        if catalogue_serializer.is_valid():
            user = request.user if request.user.is_authenticated else None
            catalogue_item = catalogue_serializer.save(added_by=user)
            
            # Create variants
            created_variants = []
            for variant_data in variants_data:
                variant_data['catalogue_item_id'] = catalogue_item.id
                variant_serializer = VariantSerializer(data=variant_data)
                if variant_serializer.is_valid():
                    variant = variant_serializer.save()
                    created_variants.append(variant_serializer.data)
                else:
                    # If any variant fails, delete the catalogue_item and any created variants
                    catalogue_item.delete()
                    for v in created_variants:
                        Variant.objects.get(id=v['id']).delete()
                    return Response({
                        "error": "Failed to create variants",
                        "details": variant_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                "message": "Catalogue item and variants created successfully",
                "item": {
                    "catalogue_item": catalogue_serializer.data,
                    "variants": created_variants
                }
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "error": "Failed to create catalogue item",
                "details": catalogue_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class CatalogueItemUpdateView(APIView):
    """Update a catalogue item and its variants"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def put(self, request, catalogue_item_id):
        """Update catalogue item and all its variants"""
        try:
            catalogue_item = CatalogueItem.objects.get(id=catalogue_item_id)
        except CatalogueItem.DoesNotExist:
            return Response({
                "error": "Catalogue item not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Extract catalogue_item data
        catalogue_data = {
            'reward': request.data.get('reward'),
            'item_name': request.data.get('item_name'),
            'description': request.data.get('description'),
            'purpose': request.data.get('purpose'),
            'specifications': request.data.get('specifications'),
            'legend': request.data.get('legend'),
        }
        variants_data = request.data.get('variants', [])
        
        if not variants_data:
            return Response({
                "error": "At least one variant is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update catalogue item
        catalogue_serializer = CatalogueItemSerializer(catalogue_item, data=catalogue_data, partial=True)
        if not catalogue_serializer.is_valid():
            return Response({
                "error": "Failed to update catalogue item",
                "details": catalogue_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        catalogue_serializer.save()
        
        # Get existing variant IDs
        existing_variants = {v.id: v for v in catalogue_item.variants.all()}
        updated_variant_ids = set()
        
        # Update or create variants
        for variant_data in variants_data:
            variant_id = variant_data.get('id')
            
            if variant_id and variant_id in existing_variants:
                # Update existing variant
                variant = existing_variants[variant_id]
                variant_serializer = VariantSerializer(variant, data={
                    'catalogue_item_id': catalogue_item.id,
                    'item_code': variant_data.get('item_code'),
                    'option_description': variant_data.get('option_description'),
                    'points': variant_data.get('points'),
                    'price': variant_data.get('price'),
                    'image_url': variant_data.get('image_url'),
                }, partial=True)
                
                if variant_serializer.is_valid():
                    variant_serializer.save()
                    updated_variant_ids.add(variant_id)
                else:
                    return Response({
                        "error": "Failed to update variant",
                        "details": variant_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Create new variant
                variant_data['catalogue_item_id'] = catalogue_item.id
                variant_serializer = VariantSerializer(data=variant_data)
                
                if variant_serializer.is_valid():
                    new_variant = variant_serializer.save()
                    updated_variant_ids.add(new_variant.id)
                else:
                    return Response({
                        "error": "Failed to create new variant",
                        "details": variant_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete variants that were not included in the update
        for variant_id in existing_variants:
            if variant_id not in updated_variant_ids:
                existing_variants[variant_id].delete()
        
        return Response({
            "message": "Catalogue item and variants updated successfully",
            "catalogue_item_id": catalogue_item.id
        }, status=status.HTTP_200_OK)


class CatalogueItemDetailView(APIView):
    """Retrieve, update or delete a catalogue variant"""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request, item_id):
        """Get a specific variant's details"""
        try:
            variant = Variant.objects.select_related('catalogue_item').get(id=item_id)
            serializer = VariantSerializer(variant)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Variant.DoesNotExist:
            return Response({
                "error": "Variant not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, item_id):
        """Update a variant's details"""
        try:
            variant = Variant.objects.select_related('catalogue_item').get(id=item_id)
            catalogue_item = variant.catalogue_item
            
            # Update catalogue_item fields
            catalogue_data = {
                'reward': request.data.get('reward', catalogue_item.reward),
                'item_name': request.data.get('item_name', catalogue_item.item_name),
                'description': request.data.get('description', catalogue_item.description),
                'purpose': request.data.get('purpose', catalogue_item.purpose),
                'specifications': request.data.get('specifications', catalogue_item.specifications),
                'legend': request.data.get('legend', catalogue_item.legend),
            }
            catalogue_serializer = CatalogueItemSerializer(catalogue_item, data=catalogue_data, partial=True)
            
            # Update variant fields
            variant_data = {
                'item_code': request.data.get('item_code', variant.item_code),
                'option_description': request.data.get('option_description', variant.option_description),
                'points': request.data.get('points', variant.points),
                'price': request.data.get('price', variant.price),
                'image_url': request.data.get('image_url', variant.image_url),
            }
            variant_serializer = VariantSerializer(variant, data=variant_data, partial=True)
            
            if catalogue_serializer.is_valid() and variant_serializer.is_valid():
                catalogue_serializer.save()
                variant_serializer.save()
                return Response({
                    "message": "Variant updated successfully",
                    "item": variant_serializer.data
                }, status=status.HTTP_200_OK)
            else:
                errors = {}
                if not catalogue_serializer.is_valid():
                    errors.update(catalogue_serializer.errors)
                if not variant_serializer.is_valid():
                    errors.update(variant_serializer.errors)
                return Response({
                    "error": "Failed to update variant",
                    "details": errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Variant.DoesNotExist:
            return Response({
                "error": "Variant not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, item_id):
        """Delete a variant"""
        try:
            variant = Variant.objects.get(id=item_id)
            catalogue_item = variant.catalogue_item
            variant.delete()
            # Optionally, if no variants left, archive or delete catalogue_item
            if not catalogue_item.variants.exists():
                catalogue_item.is_archived = True
                catalogue_item.save()
            return Response({
                "message": "Variant deleted successfully"
            }, status=status.HTTP_200_OK)
        except Variant.DoesNotExist:
            return Response({
                "error": "Variant not found"
            }, status=status.HTTP_404_NOT_FOUND)
