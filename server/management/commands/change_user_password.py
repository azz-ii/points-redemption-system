from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Change the password for a specific user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the account to update')
        parser.add_argument('new_password', type=str, help='New password to set')

    def handle(self, *args, **options):
        username = options['username']
        new_password = options['new_password']

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f"User '{username}' does not exist.")

        user.set_password(new_password)
        user.save()
        self.stdout.write(self.style.SUCCESS(f"Password changed successfully for user '{username}'."))
