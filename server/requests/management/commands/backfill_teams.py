from django.core.management.base import BaseCommand
from requests.models import RedemptionRequest
from teams.models import TeamMembership


class Command(BaseCommand):
    help = 'Backfill team field for existing redemption requests'

    def handle(self, *args, **options):
        requests_without_team = RedemptionRequest.objects.filter(team__isnull=True)
        total = requests_without_team.count()
        
        self.stdout.write(f"Found {total} requests without team assignment")
        
        updated = 0
        skipped = 0
        
        for request in requests_without_team:
            membership = TeamMembership.objects.filter(user=request.requested_by).first()
            
            if membership:
                request.team = membership.team
                request.save(update_fields=['team'])
                updated += 1
                self.stdout.write(f"  ✓ Request #{request.id} assigned to team '{membership.team.name}'")
            else:
                skipped += 1
                self.stdout.write(f"  ✗ Request #{request.id} skipped (user has no team)")
        
        self.stdout.write(
            self.style.SUCCESS(
                f"\nBackfill complete: {updated} updated, {skipped} skipped"
            )
        )
