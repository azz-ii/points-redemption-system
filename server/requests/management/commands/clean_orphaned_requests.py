from django.core.management.base import BaseCommand
from requests.models import RedemptionRequest


class Command(BaseCommand):
    help = 'Delete redemption requests made by users who no longer exist'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Find requests where requested_by user is null or doesn't exist
        orphaned = RedemptionRequest.objects.filter(requested_by__isnull=True)
        count = orphaned.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No orphaned requests found'))
            return
        
        self.stdout.write(f'Found {count} orphaned request(s)')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - would delete:'))
            for req in orphaned[:10]:  # Show first 10
                self.stdout.write(f'  - Request #{req.id} (requested_by=NULL)')
            if count > 10:
                self.stdout.write(f'  ... and {count - 10} more')
        else:
            deleted_count, _ = orphaned.delete()
            self.stdout.write(self.style.SUCCESS(
                f'Successfully deleted {deleted_count} orphaned request(s)'
            ))
