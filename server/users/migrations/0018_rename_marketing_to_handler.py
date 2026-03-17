"""
Data migration to rename 'Marketing' position to 'Handler' in UserProfile.
"""
from django.db import migrations


def rename_marketing_to_handler(apps, schema_editor):
    UserProfile = apps.get_model('users', 'UserProfile')
    updated = UserProfile.objects.filter(position='Marketing').update(position='Handler')
    if updated:
        print(f"\n  Updated {updated} UserProfile(s) from 'Marketing' to 'Handler'")


def rename_handler_to_marketing(apps, schema_editor):
    UserProfile = apps.get_model('users', 'UserProfile')
    updated = UserProfile.objects.filter(position='Handler').update(position='Marketing')
    if updated:
        print(f"\n  Reverted {updated} UserProfile(s) from 'Handler' to 'Marketing'")


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0017_backfill_uses_points_for_approvers'),
    ]

    operations = [
        migrations.RunPython(
            rename_marketing_to_handler,
            reverse_code=rename_handler_to_marketing,
        ),
    ]
