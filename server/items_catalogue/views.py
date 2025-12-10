from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CatalogueItem
from .serializers import CatalogueItemSerializer


@method_decorator(csrf_exempt, name='dispatch')
class CatalogueItemListCreateView(APIView):
    """List all catalogue items or create a new item"""
    
    def get(self, request):
        """Get list of all catalogue items"""
        items = CatalogueItem.objects.all()
        serializer = CatalogueItemSerializer(items, many=True)
        return Response({"items": serializer.data}, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new catalogue item"""
        serializer = CatalogueItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Catalogue item created successfully",
                "item": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "error": "Failed to create catalogue item",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class CatalogueItemDetailView(APIView):
    """Retrieve, update or delete a catalogue item"""
    
    def get(self, request, item_id):
        """Get a specific catalogue item's details"""
        try:
            item = CatalogueItem.objects.get(id=item_id)
            serializer = CatalogueItemSerializer(item)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CatalogueItem.DoesNotExist:
            return Response({
                "error": "Catalogue item not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, item_id):
        """Update a catalogue item's details"""
        try:
            item = CatalogueItem.objects.get(id=item_id)
            serializer = CatalogueItemSerializer(item, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Catalogue item updated successfully",
                    "item": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "error": "Failed to update catalogue item",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except CatalogueItem.DoesNotExist:
            return Response({
                "error": "Catalogue item not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, item_id):
        """Delete a catalogue item"""
        try:
            item = CatalogueItem.objects.get(id=item_id)
            item.delete()
            return Response({
                "message": "Catalogue item deleted successfully"
            }, status=status.HTTP_200_OK)
        except CatalogueItem.DoesNotExist:
            return Response({
                "error": "Catalogue item not found"
            }, status=status.HTTP_404_NOT_FOUND)
