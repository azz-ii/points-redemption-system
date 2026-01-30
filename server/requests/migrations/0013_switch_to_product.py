# Generated manually to switch from Variant to Product FK
from django.db import migrations, models
import django.db.models.deletion


def migrate_variant_fks_to_product(apps, schema_editor):
    """
    Update RedemptionRequestItem foreign keys from Variant to Product.
    Note: This assumes Variant table may already be deleted, so we use SQL directly.
    """
    # Since the Variant table might already be deleted, we'll update the FK
    # by matching item codes between existing request items and products.
    # This requires the variant_id field to still exist temporarily.
    
    # For now, mark this as a no-op if Variant doesn't exist
    # The actual mapping will be done manually or via SQL if needed
    try:
        Variant = apps.get_model('items_catalogue', 'Variant')
        # Check if table exists by trying to count
        Variant.objects.count()
        variant_exists = True
    except Exception:
        variant_exists = False
    
    if not variant_exists:
        # Variant table doesn't exist, skip data migration
        # Products are already created with correct data
        print("Skipping variant-to-product FK migration (Variant table doesn't exist)")
        return
    
    RedemptionRequestItem = apps.get_model('requests', 'RedemptionRequestItem')
    Product = apps.get_model('items_catalogue', 'Product')
    
    # Map variant IDs to product IDs using item_code
    variant_to_product = {}
    for variant in Variant.objects.all():
        try:
            product = Product.objects.get(item_code=variant.item_code)
            variant_to_product[variant.id] = product.id
        except Product.DoesNotExist:
            print(f"Warning: No product found for variant with item_code {variant.item_code}")
    
    # Update all RedemptionRequestItems
    for request_item in RedemptionRequestItem.objects.all():
        if request_item.variant_id in variant_to_product:
            request_item.product_id = variant_to_product[request_item.variant_id]
            request_item.save(update_fields=['product_id'])
        else:
            print(f"Warning: No product mapping found for request item {request_item.id} with variant_id {request_item.variant_id}")


def reverse_migrate_product_fks_to_variant(apps, schema_editor):
    """
    Reverse migration - update Product FKs back to Variant FKs.
    """
    RedemptionRequestItem = apps.get_model('requests', 'RedemptionRequestItem')
    Variant = apps.get_model('items_catalogue', 'Variant')
    Product = apps.get_model('items_catalogue', 'Product')
    
    # Map product IDs to variant IDs using item_code
    product_to_variant = {}
    for product in Product.objects.all():
        try:
            variant = Variant.objects.get(item_code=product.item_code)
            product_to_variant[product.id] = variant.id
        except Variant.DoesNotExist:
            print(f"Warning: No variant found for product with item_code {product.item_code}")
    
    # Update all RedemptionRequestItems
    for request_item in RedemptionRequestItem.objects.all():
        if request_item.product_id in product_to_variant:
            request_item.variant_id = product_to_variant[request_item.product_id]
            request_item.save(update_fields=['variant_id'])


class Migration(migrations.Migration):
    dependencies = [
        ('requests', '0012_redemptionrequest_driver_name_and_more'),
        ('items_catalogue', '0012_flatten_to_product'),  # Must run after Product model is created
    ]

    operations = [
        # Step 1: Add product FK to RedemptionRequestItem (nullable initially)
        migrations.AddField(
            model_name='redemptionrequestitem',
            name='product',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='redemption_items',
                to='items_catalogue.product',
                help_text='The product being redeemed'
            ),
        ),
        
        # Step 2: Migrate data from variant FK to product FK
        migrations.RunPython(
            migrate_variant_fks_to_product,
            reverse_migrate_product_fks_to_variant
        ),
        
        # Step 3: Remove old variant FK
        migrations.RemoveField(
            model_name='redemptionrequestitem',
            name='variant',
        ),
        
        # Step 4: Make product FK non-nullable
        migrations.AlterField(
            model_name='redemptionrequestitem',
            name='product',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='redemption_items',
                to='items_catalogue.product',
                help_text='The product being redeemed'
            ),
        ),
    ]
