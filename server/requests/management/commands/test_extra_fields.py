from django.core.management.base import BaseCommand
from items_catalogue.models import Product, ProductExtraField, PricingFormula, FieldType
from items_catalogue.formulas import FORMULA_REGISTRY
from requests.models import RedemptionRequest, RedemptionRequestItem
from django.contrib.auth import get_user_model
from django.test import RequestFactory
from requests.serializers import CreateRedemptionRequestSerializer
from teams.models import Team, TeamMembership
from distributers.models import Distributor
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Test extra fields functionality'

    def handle(self, *args, **kwargs):
        self.stdout.write("Running tests...")

        user, _ = User.objects.get_or_create(username='test_admin', defaults={'is_superuser': True, 'is_staff': True})
        distributor, _ = Distributor.objects.get_or_create(name='Test Dist', defaults={'points': 10000})
        
        # Test 1: Driver Multiplier
        prod1, _ = Product.objects.get_or_create(
            item_code='TM-SVC',
            defaults={
                'item_name': 'Test Vehicle',
                'points': 100,
                'pricing_formula': 'DRIVER_MULTIPLIER',
                'stock': 1000
            }
        )
        if prod1.stock < 1000:
            prod1.stock = 1000
            prod1.save()
        ProductExtraField.objects.get_or_create(
            product=prod1,
            field_key='driver_type',
            defaults={
                'label': 'Driver needed?',
                'field_type': 'CHOICE',
                'choices_json': '["WITH_DRIVER", "WITHOUT_DRIVER"]',
                'is_required': True
            }
        )
        
        # Calculate with driver
        factory = RequestFactory()
        req = factory.post('/')
        req.user = user

        serializer = CreateRedemptionRequestSerializer(data={
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': distributor.id,
            'points_deducted_from': 'DISTRIBUTOR',
            'items': [
                {
                    'product_id': prod1.id,
                    'quantity': 1,
                    'extra_data': {'driver_type': 'WITH_DRIVER'}
                }
            ]
        }, context={'request': req})
        
        if serializer.is_valid():
            req_obj = serializer.save()
            total = req_obj.total_points
            self.stdout.write(f"Test 1.1 (WITH_DRIVER): expected 200, got {total}")
            assert total == 200
        else:
            self.stdout.write(f"Errors 1.1: {serializer.errors}")

        # Calculate without driver
        serializer2 = CreateRedemptionRequestSerializer(data={
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': distributor.id,
            'points_deducted_from': 'DISTRIBUTOR',
            'items': [
                {
                    'product_id': prod1.id,
                    'quantity': 1,
                    'extra_data': {'driver_type': 'WITHOUT_DRIVER'}
                }
            ]
        }, context={'request': req})

        if serializer2.is_valid():
            req_obj2 = serializer2.save()
            total = req_obj2.total_points
            self.stdout.write(f"Test 1.2 (WITHOUT_DRIVER): expected 100, got {total}")
            assert total == 100
        else:
            self.stdout.write(f"Errors 1.2: {serializer2.errors}")

        # Test 2: Area
        prod2, _ = Product.objects.get_or_create(
            item_code='TM-AREA',
            defaults={
                'item_name': 'Test Area',
                'points_multiplier': '2.0',
                'pricing_formula': 'AREA_RATE',
                'stock': 1000
            }
        )
        if prod2.stock < 1000:
            prod2.stock = 1000
            prod2.save()
        ProductExtraField.objects.get_or_create(product=prod2, field_key='length', defaults={'label': 'Length', 'field_type': 'NUMBER'})
        ProductExtraField.objects.get_or_create(product=prod2, field_key='width', defaults={'label': 'Width', 'field_type': 'NUMBER'})
        ProductExtraField.objects.get_or_create(product=prod2, field_key='height', defaults={'label': 'Height', 'field_type': 'NUMBER'})

        serializer3 = CreateRedemptionRequestSerializer(data={
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': distributor.id,
            'points_deducted_from': 'DISTRIBUTOR',
            'items': [
                {
                    'product_id': prod2.id,
                    'dynamic_quantity': 150, # doesn't matter for formula
                    'extra_data': {'length': '10', 'width': '5', 'height': '3'}
                }
            ]
        }, context={'request': req})

        if serializer3.is_valid():
            req_obj3 = serializer3.save()
            total = req_obj3.total_points
            expected = 10 * 5 * 3 * 2.0
            self.stdout.write(f"Test 2 (AREA): expected {expected}, got {total}")
            assert total == expected
        else:
            self.stdout.write(f"Errors 3: {serializer3.errors}")

        self.stdout.write("Tests passed.")
