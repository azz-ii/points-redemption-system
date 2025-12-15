import csv
import os
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from items_catalogue.models import CatalogueItem, Variant

class Command(BaseCommand):
    help = 'Import catalogue items and variants from CSV'

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

        imported_items = 0
        imported_variants = 0
        errors = []

        with open(csv_file, 'r', encoding='utf-8-sig') as f:  # utf-8-sig handles BOM
            reader = csv.DictReader(f)
            for row_num, row in enumerate(reader, start=2):  # Start at 2 for header
                try:
                    # Clean and parse fields
                    item_name = row.get('Item', '').strip()
                    codes = [c.strip() for c in row.get('Code', '').split(',') if c.strip()]
                    description = row.get('Description', '').strip()
                    purpose = row.get('Purpose', '').strip()
                    specifications = row.get('Specifications', '').strip()
                    options = [o.strip() for o in row.get('Options', '').split(',') if o.strip()]
                    points = row.get('Points', '').strip()
                    price = row.get('Price', '').strip()

                    # Validation
                    if not item_name:
                        errors.append(f'Row {row_num}: Missing item_name')
                        continue
                    if not codes:
                        errors.append(f'Row {row_num}: No item_codes')
                        continue

                    # Handle variants
                    if len(codes) == 1:
                        # Single variant
                        option_desc = ', '.join(options) if options else None
                        if option_desc and len(option_desc) > 100:
                            option_desc = option_desc[:97] + '...'
                        variant_data = [(codes[0], option_desc)]
                    elif len(codes) > 1:
                        if len(options) == len(codes):
                            variant_data = [(code, opt[:100] if opt and len(opt) > 100 else opt) for code, opt in zip(codes, options)]
                        else:
                            # Use the single option for all, or None if no options
                            option_desc = options[0] if options else None
                            if option_desc and len(option_desc) > 100:
                                option_desc = option_desc[:97] + '...'
                            variant_data = [(code, option_desc) for code in codes]
                    else:
                        errors.append(f'Row {row_num}: No codes')
                        continue

                    # Check for duplicate item_codes and modify
                    existing_codes = set(Variant.objects.values_list('item_code', flat=True))
                    modified_codes = []
                    for code, desc in variant_data:
                        original_code = code
                        suffix = ''
                        counter = 0
                        while f"{original_code}{suffix}" in existing_codes or f"{original_code}{suffix}" in modified_codes:
                            counter += 1
                            suffix = chr(65 + (counter - 1) % 26)  # A, B, C...
                        new_code = f"{original_code}{suffix}"
                        modified_codes.append(new_code)
                        existing_codes.add(new_code)  # To avoid conflicts within this import

                    variant_data = list(zip(modified_codes, [desc for _, desc in variant_data]))

                    if not dry_run:
                        # Create CatalogueItem
                        catalogue_item = CatalogueItem.objects.create(
                            item_name=item_name,
                            description=description,
                            purpose=purpose,
                            specifications=specifications,
                            legend='GIVEAWAY',  # Default
                            date_added=timezone.now(),
                            is_archived=False
                        )

                        # Create Variants
                        for code, option_desc in variant_data:
                            Variant.objects.create(
                                catalogue_item=catalogue_item,
                                item_code=code,
                                option_description=option_desc,
                                points=points,
                                price=price
                            )
                            imported_variants += 1

                        imported_items += 1
                    else:
                        # Dry run: just count
                        imported_items += 1
                        imported_variants += len(variant_data)

                except Exception as e:
                    errors.append(f'Row {row_num}: {str(e)}')

        # Summary
        self.stdout.write(f'Imported {imported_items} items and {imported_variants} variants')
        if errors:
            self.stdout.write('Errors:')
            for error in errors:
                self.stdout.write(f'  {error}')
        else:
            self.stdout.write('No errors')