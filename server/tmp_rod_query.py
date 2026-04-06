from django.contrib.auth import get_user_model
from requests.models import RedemptionRequest

User = get_user_model()

# Check both Rod users
rod_users = User.objects.filter(username__icontains='rod')
print("=== ROD USERS ===")
for u in rod_users:
    req_count = RedemptionRequest.objects.filter(requested_by=u).count()
    print(f'  id={u.id}  username={u.username}  requests={req_count}')

print()

# Try profile lookup with correct app
try:
    from users.models import UserProfile
    prof_matches = UserProfile.objects.filter(full_name__icontains='rod')
    print(f'Profiles (users app) with "rod" in full_name: {prof_matches.count()}')
    for p in prof_matches:
        print(f'  user_id={p.user_id}  username={p.user.username}  full_name={p.full_name}')
except Exception as e:
    print(f'users.models: {e}')

# List all installed apps that have UserProfile
import django.apps
for app in django.apps.apps.get_app_configs():
    try:
        model = app.get_model('UserProfile')
        print(f'Found UserProfile in app: {app.name}')
    except LookupError:
        pass

print()
print("=== ALL REQUESTS FOR ROD (id=62) ===")
qs = RedemptionRequest.objects.filter(requested_by_id=62).select_related(
    'requested_by', 'requested_for', 'requested_for_customer'
)
print(f'Count: {qs.count()}')
for r in qs:
    print(f'  ID={r.id}  type={r.requested_for_type}  for={r.get_requested_for_name()}  status={r.status}  points={r.total_points}  date={r.date_requested:%Y-%m-%d}')

print()
print("=== ALL REQUESTS FOR rodeliza-ruiz (id=80) ===")
qs2 = RedemptionRequest.objects.filter(requested_by_id=80).select_related(
    'requested_by', 'requested_for', 'requested_for_customer'
)
print(f'Count: {qs2.count()}')
for r in qs2:
    print(f'  ID={r.id}  type={r.requested_for_type}  for={r.get_requested_for_name()}  status={r.status}  points={r.total_points}  date={r.date_requested:%Y-%m-%d}')
