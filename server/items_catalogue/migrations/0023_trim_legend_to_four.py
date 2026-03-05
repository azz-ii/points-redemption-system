# Migrates legend field to 4 title-case values: Collateral, Giveaway, Asset, Benefit.
# Removed legends (MERCH, PROMO, AD_MATERIALS, POINT_OF_SALE, OTHERS) default to 'Asset'.

from django.db import migrations, models

# Maps every existing stored value to its new title-case equivalent.
_LEGEND_MAP = {
    'GIVEAWAY': 'Giveaway',
    'COLLATERAL': 'Collateral',
    'ASSET': 'Asset',
    'BENEFIT': 'Benefit',
    # Removed legends → Asset
    'MERCH': 'Asset',
    'PROMO': 'Asset',
    'AD_MATERIALS': 'Asset',
    'POINT_OF_SALE': 'Asset',
    'OTHERS': 'Asset',
}


def migrate_legend_values(apps, schema_editor):
    Product = apps.get_model('items_catalogue', 'Product')
    for old_value, new_value in _LEGEND_MAP.items():
        Product.objects.filter(legend=old_value).update(legend=new_value)


def reverse_legend_values(apps, schema_editor):
    """Best-effort reverse: title-case → ALL_CAPS (removed legends cannot be truly restored)."""
    Product = apps.get_model('items_catalogue', 'Product')
    reverse_map = {
        'Giveaway': 'GIVEAWAY',
        'Collateral': 'COLLATERAL',
        'Asset': 'ASSET',
        'Benefit': 'BENEFIT',
    }
    for new_value, old_value in reverse_map.items():
        Product.objects.filter(legend=new_value).update(legend=old_value)


class Migration(migrations.Migration):

    dependencies = [
        ('items_catalogue', '0022_alter_product_options_stockauditlog'),
    ]

    operations = [
        migrations.RunPython(migrate_legend_values, reverse_legend_values),
        migrations.AlterField(
            model_name='product',
            name='legend',
            field=models.CharField(
                choices=[
                    ('Collateral', 'Collateral'),
                    ('Giveaway', 'Giveaway'),
                    ('Asset', 'Asset'),
                    ('Benefit', 'Benefit'),
                ],
                default='Giveaway',
                max_length=20,
            ),
        ),
    ]
