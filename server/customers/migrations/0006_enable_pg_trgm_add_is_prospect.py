from django.db import migrations, models
from django.contrib.postgres.operations import TrigramExtension


class Migration(migrations.Migration):

    dependencies = [
        ('customers', '0005_remove_customer_points'),
    ]

    operations = [
        TrigramExtension(),
        migrations.AddField(
            model_name='customer',
            name='is_prospect',
            field=models.BooleanField(default=False, help_text='Whether this customer is a prospect (created by agent, pending admin review)'),
        ),
    ]
