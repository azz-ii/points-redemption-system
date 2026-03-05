from django.db import migrations


def migrate_customer_to_self(apps, schema_editor):
    """Migrate all existing points_deducted_from='CUSTOMER' records to 'SELF'."""
    RedemptionRequest = apps.get_model('requests', 'RedemptionRequest')
    updated = RedemptionRequest.objects.filter(
        points_deducted_from='CUSTOMER'
    ).update(points_deducted_from='SELF')
    if updated:
        print(f"\n  Migrated {updated} request(s) from CUSTOMER to SELF deduction")


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0015_change_product_fk_to_protect'),
    ]

    operations = [
        migrations.RunPython(
            migrate_customer_to_self,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
