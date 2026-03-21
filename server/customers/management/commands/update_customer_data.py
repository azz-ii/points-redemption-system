from django.core.management.base import BaseCommand
import pandas as pd
from customers.models import Customer
import math
import difflib

class Command(BaseCommand):
    help = 'Updates existing customers with Brand and Sales Channel data from an Excel file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            required=True,
            help='Path to the source Excel file (e.g., UC004.xls)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Perform a dry run without saving changes to the database'
        )
        parser.add_argument(
            '--export-fuzzy',
            type=str,
            help='Export fuzzy matching results to the specified Excel file'
        )

    def handle(self, *args, **options):
        file_path = options['file']
        is_dry_run = options.get('dry_run', False)
        export_fuzzy_path = options.get('export_fuzzy')

        if is_dry_run:
            self.stdout.write(self.style.WARNING("=== DRY RUN MODE: No database changes will be made ==="))

        self.stdout.write(self.style.NOTICE(f"Loading data from {file_path}..."))

        try:
            # Can read .xls or .xlsx based on engine (xlrd for .xls, openpyxl for .xlsx)
            if file_path.endswith('.xls'):
                df = pd.read_excel(file_path, engine='xlrd', header=1)
            else:
                df = pd.read_excel(file_path, header=1) # defaults to openpyxl for .xlsx
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error reading file: {e}"))
            return

        # Expecting columns 'CUSTOMER', 'BRAND', 'SALES CHANNEL'
        # If headers differ in actual file, adjust these keys
        name_col = 'CUSTOMER'
        brand_col = 'BRAND'
        channel_col = 'SALES CHANNEL'

        if not all(col in df.columns for col in [name_col, brand_col, channel_col]):
            self.stdout.write(
                self.style.ERROR(
                    f"File must contain columns: '{name_col}', '{brand_col}', '{channel_col}'. "
                    f"Found columns: {list(df.columns)}"
                )
            )
            return

        # Clean up file duplicates immediately
        initial_count = len(df)
        df = df.drop_duplicates(subset=[name_col, brand_col, channel_col], keep='last')
        self.stdout.write(self.style.NOTICE(f"Removed {initial_count - len(df)} duplicate rows. {len(df)} distinct rows remain for processing."))

        updated_count = 0
        skipped_count = 0
        not_found_count = 0

        # Calculate difference metrics
        all_db_names = {name.strip().lower(): name for name in Customer.objects.values_list('name', flat=True) if name}
        all_db_customers_count = len(all_db_names)
        
        file_valid_names = set()
        for idx, row in df.iterrows():
            name = row[name_col]
            if pd.notna(name):
                 file_valid_names.add(str(name).strip().lower())
        
        matched_names = set(all_db_names.keys()).intersection(file_valid_names)
        in_db_not_file_keys = set(all_db_names.keys()) - file_valid_names
        in_file_not_db_keys = file_valid_names - set(all_db_names.keys())

        in_db_not_file_names = [all_db_names[k] for k in in_db_not_file_keys]
        # To get original casing for file_not_db, we can't reliably just do a dict unless we track it
        file_original_names = {str(n).strip().lower(): str(n).strip() for n in df[name_col] if pd.notna(n)}
        in_file_not_db_names = [file_original_names[k] for k in in_file_not_db_keys]

        # Instead of querying per row, let's load what we need to a dict for instant lookup
        all_customers = Customer.objects.all()
        db_customer_map = {c.name.strip().lower(): c for c in all_customers if c.name}

        updates_made_results = []

        for index, row in df.iterrows():
            customer_name = row[name_col]
            brand = row[brand_col]
            sales_channel = row[channel_col]

            # Handle nan values cleanly
            if pd.isna(customer_name):
                skipped_count += 1
                continue

            customer_name_str = str(customer_name).strip()
            brand_str = str(brand).strip() if pd.notna(brand) else ''
            channel_str = str(sales_channel).strip() if pd.notna(sales_channel) else ''
            
            customer_key = customer_name_str.lower()
            customer = db_customer_map.get(customer_key)

            if customer:
                # Update logic
                has_changes = False
                
                if customer.brand != brand_str:
                    customer.brand = brand_str
                    has_changes = True
                    
                if customer.sales_channel != channel_str:
                    customer.sales_channel = channel_str
                    has_changes = True

                if has_changes:
                    if not is_dry_run:
                        customer.save()
                    updated_count += 1
                    status = "[DRY-RUN] Would update:" if is_dry_run else "Updated:"
                    self.stdout.write(self.style.SUCCESS(f"{status} {customer_name_str} (Brand: {brand_str}, Channel: {channel_str})"))
                    
                    updates_made_results.append({
                        'Customer Name': customer.name,
                        'Sales Channel': customer.sales_channel,
                        'Brand': customer.brand
                    })
                else:
                    skipped_count += 1
                    self.stdout.write(f"No changes needed: {customer_name_str}")

            else:
                not_found_count += 1
                self.stdout.write(self.style.WARNING(f"Not found in DB: {customer_name_str}"))

        self.stdout.write(self.style.SUCCESS(
            f"\n--- Summary ---\n"
            f"Total Processed from file: {len(df)}\n"
            f"Total Existing in DB: {all_db_customers_count}\n"
            f"Potential Matches: {len(matched_names)}\n"
            f"{'Would Update' if is_dry_run else 'Updated'}: {updated_count}\n"
            f"Skipped (No changes / NaN): {skipped_count}\n"
            f"Not found in DB: {not_found_count}\n"
            f"=== Unmatched Sets ===\n"
            f"In Database but not in file: {len(in_db_not_file_names)}\n"
            f"In File but not in Database: {len(in_file_not_db_names)}"
        ))
        
        if is_dry_run:
            self.stdout.write(self.style.WARNING("\n--- Detailed Discrepancy List ---"))
            self.stdout.write(self.style.NOTICE("Customers in DB but not in file:"))
            for n in sorted(in_db_not_file_names)[:20]:
                self.stdout.write(f" - {n}")
            if len(in_db_not_file_names) > 20:
                self.stdout.write(f" ... and {len(in_db_not_file_names) - 20} more.")

            self.stdout.write(self.style.NOTICE("\nCustomers in file but not in DB:"))
            for n in sorted(in_file_not_db_names)[:20]:
                self.stdout.write(f" - {n}")
            if len(in_file_not_db_names) > 20:
                self.stdout.write(f" ... and {len(in_file_not_db_names) - 20} more.")

        if export_fuzzy_path:
            self.stdout.write(self.style.NOTICE(f"\nGenerating extensive multiple-sheet report to {export_fuzzy_path}... (Fuzzy matching might take a moment)"))
            
            # --- 1. Fuzzy Matches Sheet ---
            fuzzy_results = []
            if in_file_not_db_names:
                for file_name in in_file_not_db_names:
                    matches = difflib.get_close_matches(file_name, in_db_not_file_names, n=1, cutoff=0.3)
                    best_match = matches[0] if matches else None
                    score = difflib.SequenceMatcher(None, file_name.lower(), best_match.lower()).ratio() if best_match else 0.0
                    fuzzy_results.append({
                        'File Customer Name': file_name,
                        'Closest DB Match': best_match if best_match else 'No logical match',
                        'Similarity %': round(score * 100, 2)
                    })
            if fuzzy_results:
                fuzzy_df = pd.DataFrame(fuzzy_results).sort_values('Similarity %', ascending=False)
            else:
                fuzzy_df = pd.DataFrame(columns=['File Customer Name', 'Closest DB Match', 'Similarity %'])

            # --- 2. Exact Matches Sheet ---
            exact_matches_results = [{'Matched File Name': f_name, 'Matched DB Name': all_db_names[f_name.lower()]} for f_name in matched_names if f_name.lower() in all_db_names]
            exact_df = pd.DataFrame(exact_matches_results)
            
            # --- 3. Missing from File (DB Only) ---
            db_only_df = pd.DataFrame({'Customer in DB (Not in File)': in_db_not_file_names})
            
            # --- 4. Missing from DB (File Only) ---
            file_only_df = pd.DataFrame({'Customer in File (Not in DB)': in_file_not_db_names})
            
            # --- 5. Applied Updates ---
            applied_updates_df = pd.DataFrame(updates_made_results)
            
            try:
                # Need openpyxl logic here
                with pd.ExcelWriter(export_fuzzy_path, engine='openpyxl') as writer:
                    exact_df.to_excel(writer, index=False, sheet_name='Exact Matches Map')
                    fuzzy_df.to_excel(writer, index=False, sheet_name='Fuzzy Need Review')
                    db_only_df.to_excel(writer, index=False, sheet_name='Only In DB')
                    file_only_df.to_excel(writer, index=False, sheet_name='Only In File')
                    applied_updates_df.to_excel(writer, index=False, sheet_name='Applied Updates')
                self.stdout.write(self.style.SUCCESS(f"\n[+] Full multisheet report successfully exported to {export_fuzzy_path}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"\nFailed to export report: {e}"))
