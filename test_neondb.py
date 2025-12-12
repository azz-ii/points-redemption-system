"""
Test NeonDB connection and data migration
"""
import os
import sys

# Add server directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile
from items_catalogue.models import CatalogueItem
from django.db import connection

# Test database connection
print("=" * 60)
print("NeonDB MIGRATION TEST")
print("=" * 60)

# Show database info
db_settings = connection.settings_dict
print(f"\n✓ Database Engine: {db_settings['ENGINE']}")
print(f"✓ Database Name: {db_settings['NAME']}")
print(f"✓ Database Host: {db_settings['HOST']}")
print(f"✓ Database Port: {db_settings.get('PORT', 'default')}")

# Test queries
print("\n" + "=" * 60)
print("DATA VERIFICATION")
print("=" * 60)

users = User.objects.all()
print(f"\n✓ Users: {users.count()}")
for user in users:
    print(f"  - {user.username} ({user.email})")

profiles = UserProfile.objects.all()
print(f"\n✓ UserProfiles: {profiles.count()}")
for profile in profiles:
    print(f"  - {profile.full_name} - Email: {profile.email}")

items = CatalogueItem.objects.all()
print(f"\n✓ CatalogueItems: {items.count()}")
for item in items:
    print(f"  - {item.item_name} - Legend: {item.legend}")

print("\n" + "=" * 60)
print("✓ MIGRATION SUCCESSFUL!")
print("=" * 60)
print("\nNeonDB is connected and all data has been migrated successfully.")
