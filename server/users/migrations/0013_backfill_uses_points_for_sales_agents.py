from django.db import migrations


def backfill_uses_points(apps, schema_editor):
    """Set uses_points=True for all existing Sales Agent profiles."""
    UserProfile = apps.get_model('users', 'UserProfile')
    updated = UserProfile.objects.filter(position='Sales Agent', uses_points=False).update(uses_points=True)
    print(f"  Backfilled uses_points=True for {updated} Sales Agent profile(s).")


def reverse_backfill(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_remove_profile_picture'),
    ]

    operations = [
        migrations.RunPython(backfill_uses_points, reverse_backfill),
    ]
