import sys
from django.core.management.base import BaseCommand
from requests.models import RedemptionRequest, AcknowledgementReceiptStatus, ProcessingStatus, RequestedForType

class Command(BaseCommand):
    help = 'Migrate existing PROCESSED distributor requests that have inventoried items to require an AR.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run the migration without saving changes to the database',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        target_requests = RedemptionRequest.objects.filter(
            processing_status=ProcessingStatus.PROCESSED,
            requested_for_type=RequestedForType.DISTRIBUTOR,
            ar_status=AcknowledgementReceiptStatus.NOT_REQUIRED
        )

        count = 0
        for request in target_requests:
            has_inventoried_items = request.items.filter(product__has_stock=True).exists()
            if has_inventoried_items:
                if not dry_run:
                    request.ar_status = AcknowledgementReceiptStatus.PENDING
                    request.save(update_fields=['ar_status'])
                count += 1
                self.stdout.write(f"Request #{request.id} for {request.get_requested_for_name()} requires an AR.")

        if dry_run:
            self.stdout.write(self.style.SUCCESS(f'[DRY RUN] Would update {count} requests.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Successfully updated {count} requests.'))
