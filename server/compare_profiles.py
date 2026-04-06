import os
import django
from django.contrib.auth import get_user_model

User = get_user_model()
try:
    rod = User.objects.get(username='Rod')
    lauro = User.objects.get(username='Lauro')
    
    with open('profile_compare.txt', 'w', encoding='utf-8') as f:
        f.write(f"ROD:\n{vars(rod.profile)}\n\n")
        f.write(f"LAURO:\n{vars(lauro.profile)}\n")
    print("Saved to profile_compare.txt")
except Exception as e:
    print(f"Error: {e}")
