from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Create a test user for temporary access"

    def handle(self, *args, **options):
        username = "testuser"
        password = "testpass123"
        email = "test@example.com"

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f"User '{username}' already exists!")
            )
            self.stdout.write(f"Login with: username='{username}', password='{password}'")
            return

        # Create the user
        user = User.objects.create_user(
            username=username, email=email, password=password
        )
        self.stdout.write(
            self.style.SUCCESS(f"Successfully created test user '{username}'")
        )
        self.stdout.write(f"Email: {email}")
        self.stdout.write(f"Password: {password}")
        self.stdout.write("\nUse these credentials to login on the app:")
        self.stdout.write(f"  Username: {username}")
        self.stdout.write(f"  Password: {password}")
