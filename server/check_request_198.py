import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from requests.models import RedemptionRequest, RedemptionRequestItem

r = RedemptionRequest.objects.get(id=198)
print(f"Request #{r.id} total_points: {r.total_points}")
print("\nItems:")
for item in r.items.all():
    print(f"  - {item.product.item_name}")
    print(f"    quantity: {item.quantity}")
    print(f"    pricing_formula: {item.pricing_formula}")
    print(f"    total_points: {item.total_points}")
    print(f"    extra_data: {item.extra_data}")
    print(f"    points_per_item: {item.points_per_item}")
    print()
