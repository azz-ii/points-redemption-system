# Generated migration to rename 'Marketing' position to 'Handler'

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0017_backfill_uses_points_for_approvers'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='position',
            field=models.CharField(choices=[('Admin', 'Admin'), ('Sales Agent', 'Sales Agent'), ('Approver', 'Approver'), ('Handler', 'Handler')], max_length=100),
        ),
        migrations.RunSQL(
            sql="UPDATE users_userprofile SET position = 'Handler' WHERE position = 'Marketing';",
            reverse_sql="UPDATE users_userprofile SET position = 'Marketing' WHERE position = 'Handler';",
        ),
    ]
