# Generated migration to split remarks field into stage-specific fields
# This migration adds three new fields and migrates existing data

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0028_add_marketing_rejection_reason'),
    ]

    operations = [
        # Add three new stage-specific remarks fields
        migrations.AddField(
            model_name='redemptionrequest',
            name='initial_remarks',
            field=models.TextField(blank=True, default='', help_text='Remarks added by sales agent when creating the request'),
        ),
        migrations.AddField(
            model_name='redemptionrequest',
            name='approver_remarks',
            field=models.TextField(blank=True, default='', help_text='Remarks added by approver during approval/rejection'),
        ),
        migrations.AddField(
            model_name='redemptionrequest',
            name='processing_remarks',
            field=models.TextField(blank=True, default='', help_text='Remarks added by handler/superadmin during processing'),
        ),
        
        # Data migration: copy existing remarks to initial_remarks
        migrations.RunPython(
            code=lambda apps, schema_editor: copy_remarks_to_initial(apps),
            reverse_code=migrations.RunPython.noop,
        ),
    ]


def copy_remarks_to_initial(apps):
    """Migrate existing remarks data to initial_remarks field"""
    RedemptionRequest = apps.get_model('requests', 'RedemptionRequest')
    
    # Copy all existing remarks to initial_remarks
    for request in RedemptionRequest.objects.filter(remarks__isnull=False).exclude(remarks=''):
        request.initial_remarks = request.remarks
        request.save(update_fields=['initial_remarks'])
