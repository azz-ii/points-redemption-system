from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import Cart, CartItem
from .serializers import CartItemSerializer


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


@method_decorator(csrf_exempt, name='dispatch')
class CartView(APIView):
    """
    GET  /api/cart/  — return the current user's cart items
    PUT  /api/cart/  — fully replace the cart with the submitted items list
    DELETE /api/cart/ — clear all items from the cart
    """
    authentication_classes = [CsrfExemptSessionAuthentication]

    def _require_auth(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return None

    def _get_or_create_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        err = self._require_auth(request)
        if err:
            return err

        cart = self._get_or_create_cart(request.user)
        items = cart.items.select_related('product').all()
        serializer = CartItemSerializer(items, many=True)
        return Response({"items": serializer.data})

    def put(self, request):
        err = self._require_auth(request)
        if err:
            return err

        items_data = request.data.get('items', [])
        if not isinstance(items_data, list):
            return Response(
                {"error": "'items' must be a list"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CartItemSerializer(data=items_data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cart = self._get_or_create_cart(request.user)

        with transaction.atomic():
            cart.items.all().delete()
            CartItem.objects.bulk_create([
                CartItem(
                    cart=cart,
                    product=item['product'],
                    quantity=item.get('quantity', 1),
                    dynamic_quantity=item.get('dynamic_quantity'),
                    needs_driver=item.get('needs_driver', False),
                )
                for item in serializer.validated_data
            ])
            cart.save()  # update updated_at

        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request):
        err = self._require_auth(request)
        if err:
            return err

        cart = self._get_or_create_cart(request.user)
        cart.items.all().delete()
        cart.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
