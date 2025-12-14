from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from users.models import UserProfile


class Command(BaseCommand):
    help = 'Create an employee user account with profile'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username for the new employee')
        parser.add_argument('password', type=str, help='Password for the new employee')
        parser.add_argument('--position', type=str, default='Admin', help='Position/role (e.g., Admin, Marketing, Sales Agent)')
        parser.add_argument('--full-name', type=str, default='', help='Full name of the employee')
        parser.add_argument('--email', type=str, help='Email address (required)', required=True)
        parser.add_argument('--is-staff', action='store_true', help='Grant staff privileges (can access admin panel)')
        parser.add_argument('--is-superuser', action='store_true', help='Grant superuser privileges')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        position = options['position']
        full_name = options['full_name']
        email = options['email']
        is_staff = options['is_staff']
        is_superuser = options['is_superuser']

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'User "{username}" already exists'))
            return

        # Check if email already exists
        if UserProfile.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f'Email "{email}" is already registered'))
            return

        # Create the User
        user = User.objects.create_user(
            username=username,
            password=password,
            is_staff=is_staff,
            is_superuser=is_superuser,
            is_active=True
        )

        # Create the UserProfile
        profile = UserProfile.objects.create(
            user=user,
            position=position,
            full_name=full_name or username,
            email=email,
            is_activated=True,
            is_banned=False
        )

        self.stdout.write(self.style.SUCCESS(
            f'Successfully created employee account:\n'
            f'  Username: {username}\n'
            f'  Position: {position}\n'
            f'  Full Name: {profile.full_name}\n'
            f'  Email: {email}\n'
            f'  Staff: {is_staff}\n'
            f'  Superuser: {is_superuser}'
        ))
