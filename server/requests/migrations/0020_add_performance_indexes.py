from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0019_partial_fulfillment'),
    ]

    operations = [
        # Index for the default ORDER BY -date_requested on every list query
        migrations.AddIndex(
            model_name='redemptionrequest',
            index=models.Index(fields=['date_requested'], name='req_date_requested_idx'),
        ),
        # Index for status filters used in every role branch
        migrations.AddIndex(
            model_name='redemptionrequest',
            index=models.Index(fields=['status'], name='req_status_idx'),
        ),
        # Index for processing_status filters used by Admin / Marketing views
        migrations.AddIndex(
            model_name='redemptionrequest',
            index=models.Index(fields=['processing_status'], name='req_processing_status_idx'),
        ),
        # Composite index for the Approver path: filter(team=X) + status filters
        migrations.AddIndex(
            model_name='redemptionrequest',
            index=models.Index(fields=['team', 'status'], name='req_team_status_idx'),
        ),
    ]
