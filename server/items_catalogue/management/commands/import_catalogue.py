import csv
import os
from decimal import Decimal, InvalidOperation
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from items_catalogue.models import Product

class Command(BaseCommand):
    help = 'Import products from CSV'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')
        parser.add_argument('--dry-run', action='store_true', help='Show what would be imported without saving')

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        dry_run = options['dry_run']

        if not os.path.exists(csv_file):
            raise CommandError(f'File {csv_file} does not exist')

        self.stdout.write(f'Importing from {csv_file}...')
        if dry_run:
            self.stdout.write('DRY RUN MODE - No changes will be made')

        imported_products = 0
        errors = []

        with open(csv_file, 'r', encoding='utf-8-sig') as f:  # utf-8-sig handles BOM
            reader = csv.DictReader(f)
            
            # Check for required columns
            required_columns = ['item_code', 'item_name']
            if reader.fieldnames:
                missing = [col for col in required_columns if col not in reader.fieldnames]
                if missing:
                    raise CommandError(f'Missing required columns: {", ".join(missing)}')
            
            # Get existing codes to check for duplicates
            existing_codes = set(Product.objects.values_list('item_code', flat=True))
            
            for row_num, row in enumerate(reader, start=2):  # Start at 2 for header
                try:
                    # Clean and parse fields
                    item_code = row.get('item_code', '').strip()
                    item_name = row.get('item_name', '').strip()
                    description = row.get('description', '').strip()
                    purpose = row.get('purpose', '').strip()
                    specifications = row.get('specifications', '').strip()
                    legend = row.get('legend', 'GIVEAWAY').strip().upper()
                    category = row.get('category', '').strip()
                    
                    # Parse numeric fields
                    points_str = row.get('points', '0').strip()
                    price_str = row.get('price', '0').strip()
                    stock_str = row.get('stock', '0').strip()
                    committed_stock_str = row.get('committed_stock', '0').strip()
                    
                    # Parse pricing_type
                    pricing_type = row.get('pricing_type', 'FIXED').strip().upper()
                    if pricing_type not in ['FIXED', 'PER_SQFT', 'PER_INVOICE', 'PER_DAY', 'PER_EU_SRP']:
                        pricing_type = 'FIXED'
                    
                    # Parse approval_type
                    approval_type = row.get('approval_type', 'SALES').strip().upper()
                    if approval_type not in ['SALES', 'MARKETING', 'BOTH']:
                        approval_type = 'SALES'
                    
                    # Parse boolean fields
                    requires_target = row.get('requires_target', 'false').strip().lower() in ['true', '1', 'yes']
                    is_archived = row.get('is_archived', 'false').strip().lower() in ['true', '1', 'yes']

                    # Validation
                    if not item_code:
                        errors.append(f'Row {row_num}: Missing item_code')
                        continue
                    if not item_name:
                        errors.append(f'Row {row_num}: Missing item_name')
                        continue
                    if legend not in ['GIVEAWAY', 'MERCH', 'PROMO', 'AD_MATERIALS', 'POINT_OF_SALE', 'OTHERS']:
                        legend = 'GIVEAWAY'
                    
                    # Parse numeric values
                    try:
                        points = Decimal(points_str) if points_str else Decimal('0')
                    except InvalidOperation:
                        errors.append(f'Row {row_num}: Invalid points value "{points_str}"')
                        continue
                    
                    try:
                        price = Decimal(price_str) if price_str else Decimal('0')
                    except InvalidOperation:
                        errors.append(f'Row {row_num}: Invalid price value "{price_str}"')
                        continue
                    
                    try:
                        stock = int(stock_str) if stock_str else 0
                    except ValueError:
                        errors.append(f'Row {row_num}: Invalid stock value "{stock_str}"')
                        continue
                    
                    try:
                        committed_stock = int(committed_stock_str) if committed_stock_str else 0
                    except ValueError:
                        errors.append(f'Row {row_num}: Invalid committed_stock value "{committed_stock_str}"')
                        continue

                    # Check for duplicate item_codes and modify if needed
                    original_code = item_code
                    suffix = ''
                    counter = 0
                    while item_code in existing_codes:
                        counter += 1
                        suffix = chr(65 + (counter - 1) % 26)  # A, B, C...
                        item_code = f"{original_code}{suffix}"
                    
                    existing_codes.add(item_code)  # Track new code

                    if not dry_run:
                        Product.objects.create(
                            item_code=item_code,
                            item_name=item_name,
                            description=description,
                            purpose=purpose,
                            specifications=specifications,
                            legend=legend,
                            category=category,
                            points=points,
                            price=price,
                            pricing_type=pricing_type,
                            stock=stock,
                            committed_stock=committed_stock,
                            approval_type=approval_type,
                            requires_target=requires_target,
                            is_archived=is_archived,
                            date_added=timezone.now()
                        )

                    imported_products += 1

                except Exception as e:
                    errors.append(f'Row {row_num}: {str(e)}')

        # Summary
        self.stdout.write(f'Imported {imported_products} products')
        if errors:
            self.stdout.write('Errors:')
            for error in errors:
                self.stdout.write(f'  {error}')
        else:
            self.stdout.write('No errors')