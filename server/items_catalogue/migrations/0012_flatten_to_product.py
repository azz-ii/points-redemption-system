# Generated manually for product-variant flattening migration
from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


def migrate_variants_to_products(apps, schema_editor):
    """
    Migrate data from CatalogueItem + Variant to the new Product model.
    """
    from decimal import Decimal, InvalidOperation
    
    # Get historical models
    CatalogueItem = apps.get_model('items_catalogue', 'CatalogueItem')
    Variant = apps.get_model('items_catalogue', 'Variant')
    Product = apps.get_model('items_catalogue', 'Product')
    
    def clean_decimal(value):
        """Convert string values to Decimal, handling commas and other formats"""
        if value is None or value == '':
            return Decimal('0')
        
        # Convert to string if not already
        str_value = str(value)
        
        # Remove common currency symbols and commas
        str_value = str_value.replace(',', '').replace('₱', '').replace('P', '').strip()
        
        # Try to extract just the numeric part
        # Handle formats like "25/sq ft" or "0.50/inv amt"
        if '/' in str_value:
            # Extract just the number before the slash
            str_value = str_value.split('/')[0].strip()
        
        try:
            return Decimal(str_value)
        except (InvalidOperation, ValueError):
            # If still can't parse, return 0
            return Decimal('0')
    
    # Migrate each variant to a product
    for variant in Variant.objects.select_related('catalogue_item').all():
        catalogue_item = variant.catalogue_item
        
        # Create product combining data from both models
        Product.objects.create(
            item_code=variant.item_code,
            item_name=catalogue_item.item_name,
            description=catalogue_item.description or '',
            purpose=catalogue_item.purpose or '',
            specifications=catalogue_item.specifications or '',
            legend=catalogue_item.legend or 'GIVEAWAY',
            category=getattr(variant, 'option_description', '') or '',
            points=clean_decimal(variant.points),
            price=clean_decimal(variant.price),
            pricing_type=getattr(variant, 'pricing_type', 'FIXED') or 'FIXED',
            stock=getattr(variant, 'stock', 0) or 0,
            committed_stock=getattr(variant, 'committed_stock', 0) or 0,
            approval_type=getattr(catalogue_item, 'approval_type', 'SALES') or 'SALES',
            requires_target=getattr(variant, 'requires_target', False) or False,
            is_archived=catalogue_item.is_archived or False,
            date_added=catalogue_item.date_added,
            added_by_id=catalogue_item.added_by_id,
            date_archived=catalogue_item.date_archived,
            archived_by_id=catalogue_item.archived_by_id,
        )


def reverse_migrate(apps, schema_editor):
    """
    Reverse migration - recreate CatalogueItem and Variant from Product.
    Note: This may lose some data as the original groupings are lost.
    """
    CatalogueItem = apps.get_model('items_catalogue', 'CatalogueItem')
    Variant = apps.get_model('items_catalogue', 'Variant')
    Product = apps.get_model('items_catalogue', 'Product')
    
    for product in Product.objects.all():
        # Create CatalogueItem
        catalogue_item = CatalogueItem.objects.create(
            item_name=product.item_name,
            description=product.description,
            purpose=product.purpose,
            specifications=product.specifications,
            legend=product.legend,
            approval_type=product.approval_type,
            is_archived=product.is_archived,
            date_added=product.date_added,
            added_by_id=product.added_by_id,
            date_archived=product.date_archived,
            archived_by_id=product.archived_by_id,
        )
        
        # Create Variant
        Variant.objects.create(
            catalogue_item=catalogue_item,
            item_code=product.item_code,
            option_description=product.category,
            points=product.points,
            price=product.price,
            pricing_type=product.pricing_type,
            stock=product.stock,
            committed_stock=product.committed_stock,
            requires_target=product.requires_target,
        )


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('items_catalogue', '0011_add_committed_stock'),
    ]

    operations = [
        # Step 1: Create the new Product model
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_code', models.CharField(max_length=50, unique=True)),
                ('item_name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, default='')),
                ('purpose', models.TextField(blank=True, default='')),
                ('specifications', models.TextField(blank=True, default='')),
                ('legend', models.CharField(choices=[('GIVEAWAY', 'Giveaway'), ('MERCH', 'Merch'), ('PROMO', 'Promo'), ('AD_MATERIALS', 'Ad Materials'), ('POINT_OF_SALE', 'Point of Sale'), ('OTHERS', 'Others')], default='GIVEAWAY', max_length=20)),
                ('category', models.CharField(blank=True, default='', max_length=100)),
                ('points', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('price', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('pricing_type', models.CharField(choices=[('FIXED', 'Fixed'), ('PER_SQFT', 'Per Sq Ft'), ('PER_INVOICE', 'Per Invoice'), ('PER_DAY', 'Per Day'), ('PER_EU_SRP', 'Per EU SRP')], default='FIXED', max_length=20)),
                ('stock', models.PositiveIntegerField(default=0)),
                ('committed_stock', models.PositiveIntegerField(default=0)),
                ('approval_type', models.CharField(choices=[('SALES', 'Sales'), ('MARKETING', 'Marketing'), ('BOTH', 'Both')], default='SALES', max_length=20)),
                ('requires_target', models.BooleanField(default=False)),
                ('is_archived', models.BooleanField(default=False)),
                ('date_added', models.DateTimeField(auto_now_add=True)),
                ('date_archived', models.DateTimeField(blank=True, null=True)),
                ('added_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products_added', to=settings.AUTH_USER_MODEL)),
                ('archived_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products_archived', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['item_name'],
            },
        ),
        
        # Step 2: Run data migration from Variant to Product
        migrations.RunPython(migrate_variants_to_products, reverse_migrate),
        
        # Step 3: Old models will be deleted in a later migration after requests app updates its FKs
        # (See items_catalogue 0014_delete_old_models)
    ]
