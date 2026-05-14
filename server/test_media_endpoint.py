#!/usr/bin/env python
"""Test script to verify media endpoint returns JSON 404s."""

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from django.conf import settings

# Allow testserver for testing
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')

# Create a test client
client = Client(serve_static_files=True)

# Login as first available user
user = User.objects.first()
if user:
    client.force_login(user)
    print(f"Logged in as: {user.username}\n")
else:
    print("No users found")
    exit(1)

# Test 1: Non-existent file
print("Test 1: Non-existent AR file")
print("-" * 50)
response = client.get('/api/media/acknowledgement_receipts/2026/05/nonexistent.pdf', follow=True)
print(f"Status Code: {response.status_code}")
print(f"Final URL: {response.request.get('PATH_INFO')}")

if response.status_code == 404:
    try:
        data = json.loads(response.content)
        print(f"Response Type: JSON ✓")
        print(f"Error Message: {data.get('error')}")
        print(f"Details: {data.get('detail')}")
    except json.JSONDecodeError:
        print(f"Response Type: Not JSON ✗")
        print(f"Content: {response.content[:200]}")
else:
    print(f"Unexpected Status: {response.status_code}")
    if response.status_code == 301:
        print(f"Redirect Location: {response.get('Location')}")

# Test 2: Existing file
print("\n\nTest 2: Existing AR file (AR-PRS-0317)")
print("-" * 50)
response = client.get('/api/media/acknowledgement_receipts/2026/05/AR-PRS-0317-test_customer.pdf', follow=True)
print(f"Status Code: {response.status_code}")
print(f"Final URL: {response.request.get('PATH_INFO')}")

if response.status_code == 200:
    print(f"Content-Type: {response.get('Content-Type')}")
    try:
        # FileResponse uses streaming_content, regular responses use content
        content_length = len(response.content) if hasattr(response, 'content') else len(list(response.streaming_content))
    except:
        content_length = "unknown"
    print(f"Content-Length: {content_length} bytes")
    print(f"File served: OK ✓")
else:
    print(f"Unexpected Status: {response.status_code}")
    if response.status_code == 301:
        print(f"Redirect Location: {response.get('Location')}")

print("\n" + "=" * 50)
print("✓ Media endpoint tests complete")
