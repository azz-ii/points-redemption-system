import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from items_catalogue.models import Product
from items_catalogue.formulas import FORMULA_REGISTRY
from requests.models import RedemptionRequest, RedemptionRequestItem
from decimal import Decimal

print("=" * 70)
print("STEP 1: FIX PRODUCTS WITH NULL MULTIPLIERS")
print("=" * 70)

# Fix SERVICE VEHICLE USE - 1 DAY
service_vehicle_day = Product.objects.get(item_code="SERVICE")
print(f"\n{service_vehicle_day.item_name}")
print(f"  Before: points_multiplier = {service_vehicle_day.points_multiplier}")
service_vehicle_day.points_multiplier = Decimal("250")
service_vehicle_day.save()
print(f"  After:  points_multiplier = {service_vehicle_day.points_multiplier}")

# Fix PLATINUM CUSTOM TARP
tarp = Product.objects.filter(item_name__icontains="TARP").first()
if tarp and tarp.points_multiplier is None:
    print(f"\n{tarp.item_name}")
    print(f"  Before: points_multiplier = {tarp.points_multiplier}")
    tarp.points_multiplier = Decimal("25")
    tarp.save()
    print(f"  After:  points_multiplier = {tarp.points_multiplier}")

print("\n" + "=" * 70)
print("STEP 2: RECALCULATE ITEM TOTALS USING FORMULAS")
print("=" * 70)

# Find all items with formula-based pricing
items_updated = 0
requests_affected = set()

for item in RedemptionRequestItem.objects.exclude(pricing_formula__in=['NONE', '']):
    formula_func = FORMULA_REGISTRY.get(item.pricing_formula)
    if formula_func:
        old_total = item.total_points
        base_points = int(float(item.points_per_item or 0))
        extra_data = item.extra_data or {}
        
        # Recalculate using formula
        new_total = formula_func(Decimal(str(base_points)), extra_data, item.product)
        
        if old_total != new_total:
            print(f"\nItem #{item.id} ({item.product.item_name}):")
            print(f"  Formula: {item.pricing_formula}")
            print(f"  Extra data: {extra_data}")
            print(f"  Old total_points: {old_total}")
            print(f"  New total_points: {new_total}")
            item.total_points = new_total
            item.save()
            items_updated += 1
            requests_affected.add(item.request_id)

print(f"\n✓ Updated {items_updated} items")

print("\n" + "=" * 70)
print("STEP 3: RECALCULATE REQUEST TOTALS")
print("=" * 70)

requests_updated = 0
for request_id in sorted(requests_affected):
    request = RedemptionRequest.objects.get(id=request_id)
    old_total = request.total_points
    
    # Sum item totals
    new_total = sum(item.total_points for item in request.items.all())
    
    print(f"\nRequest #{request_id}:")
    print(f"  Old total_points: {old_total}")
    print(f"  New total_points: {new_total}")
    request.total_points = new_total
    request.save()
    requests_updated += 1

print(f"\n✓ Updated {requests_updated} requests")

print("\n" + "=" * 70)
print("VERIFICATION: REQUEST #198")
print("=" * 70)

r = RedemptionRequest.objects.get(id=198)
print(f"\nRequest #{r.id}")
print(f"Total points: {r.total_points}")
print(f"\nItems:")
for item in r.items.all():
    print(f"  - {item.product.item_name}")
    print(f"    Qty: {item.quantity}, Formula: {item.pricing_formula}")
    print(f"    Extra data: {item.extra_data}")
    print(f"    Points: {item.total_points}")

expected = 2 * 250  # 2 days × 250 points/day
print(f"\nExpected total: {expected} pts (2 days × 250 pts/day)")
print(f"Actual total:   {r.total_points} pts")

if r.total_points == expected:
    print("✅ FIXED!")
else:
    print(f"⚠ Issue persists - Difference: {r.total_points - expected}")
