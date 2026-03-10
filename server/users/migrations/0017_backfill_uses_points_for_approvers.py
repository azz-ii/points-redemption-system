from django.db import migrations


def enable_uses_points_for_approvers(apps, schema_editor):
    UserProfile = apps.get_model('users', 'UserProfile')
    UserProfile.objects.filter(position='Approver').update(uses_points=True)


def disable_uses_points_for_approvers(apps, schema_editor):
    UserProfile = apps.get_model('users', 'UserProfile')
    UserProfile.objects.filter(position='Approver').update(uses_points=False)


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_userprofile_can_self_request'),
    ]

    operations = [
        migrations.RunPython(
            enable_uses_points_for_approvers,
            disable_uses_points_for_approvers,
        ),
    ]
