import os
import django
from django.contrib.auth import get_user_model
from customers.models import Customer
from items_catalogue.models import Product
from requests.serializers import CreateRedemptionRequestSerializer

User = get_user_model()

rod = User.objects.get(id=62)
cust = Customer.objects.filter(name__icontains='basilio').first()
prod = Product.objects.filter(item_name__iexact='Personal Vehicle Fuel').first()

print(f"Testing as Rod (id={rod.id}, username={rod.username}). Customer: {cust.id if cust else None}. Product: {prod.id}")

data = {
    "requested_for_type": "CUSTOMER",
    "requested_for_customer": cust.id if cust else 3011,
    "points_deducted_from": "SELF",
    "remarks": "Testing Rod",
    "items": [
        {
            "product_id": prod.id,
            "quantity": 1,
            "extra_data": {}
        }
    ]
}

class DummyRequest:
    def __init__(self, user):
        self.user = user

request = DummyRequest(rod)

serializer = CreateRedemptionRequestSerializer(data=data, context={'request': request})
is_valid = serializer.is_valid(raise_exception=False)
print("IS VALID:", is_valid)

if not is_valid:
    print("ERRORS:", serializer.errors)
else:
    try:
        req = serializer.save()
        print("SUCCESS! Created Request ID:", req.id)
    except Exception as e:
        print("EXCEPTION DURING SAVE:")
        import traceback
        traceback.print_exc()
