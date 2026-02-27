import os
from django.db import migrations
from django.conf import settings


def delete_profile_picture_files(apps, schema_editor):
    """Delete all uploaded profile picture files from disk before removing the column."""
    UserProfile = apps.get_model('users', 'UserProfile')
    for profile in UserProfile.objects.exclude(profile_picture='').exclude(profile_picture__isnull=True):
        picture_path = os.path.join(settings.MEDIA_ROOT, str(profile.profile_picture))
        if os.path.isfile(picture_path):
            try:
                os.remove(picture_path)
            except OSError:
                pass


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_remove_ban_fields'),
    ]

    operations = [
        migrations.RunPython(delete_profile_picture_files, noop),
        migrations.RemoveField(
            model_name='userprofile',
            name='profile_picture',
        ),
    ]
