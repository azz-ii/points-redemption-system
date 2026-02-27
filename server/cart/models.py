from django.db import models
from django.conf import settings


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart',
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart({self.user.username})"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(
        'items_catalogue.Product',
        on_delete=models.CASCADE,
        related_name='cart_items',
    )
    quantity = models.PositiveIntegerField(default=1)
    dynamic_quantity = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    needs_driver = models.BooleanField(default=False)

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"CartItem({self.cart.user.username} – {self.product.item_name})"
