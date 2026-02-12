import os
from django.core.management.base import BaseCommand
from django.conf import settings
from users.models import UserProfile


class Command(BaseCommand):
    help = 'Remove profile picture references for files that no longer exist'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be cleaned without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        profiles_with_pictures = UserProfile.objects.exclude(
            profile_picture=''
        ).exclude(
            profile_picture__isnull=True
        )
        
        total_checked = profiles_with_pictures.count()
        missing_count = 0
        cleaned_count = 0
        
        self.stdout.write(f'Checking {total_checked} profile(s) with pictures...')
        
        for profile in profiles_with_pictures:
            picture_path = os.path.join(settings.MEDIA_ROOT, str(profile.profile_picture))
            
            if not os.path.exists(picture_path):
                missing_count += 1
                username = profile.user.username
                picture_ref = profile.profile_picture
                
                self.stdout.write(
                    self.style.WARNING(
                        f'  ✗ Missing: {username} -> {picture_ref}'
                    )
                )
                
                if not dry_run:
                    profile.profile_picture = None
                    profile.save(update_fields=['profile_picture'])
                    cleaned_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'    → Cleared reference')
                    )
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'Scan complete:'))
        self.stdout.write(f'  Total profiles checked: {total_checked}')
        self.stdout.write(f'  Missing files found: {missing_count}')
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'  Would clean: {missing_count} (use without --dry-run to apply)')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'  References cleaned: {cleaned_count}')
            )
