"""
Management command to test all Prospect Customer endpoints:
  - create_prospect
  - check_similar
  - promote
  - merge
  - list_all (is_prospect visibility)

Uses dynamic data discovered from the live database, following the same
pattern as test_points_deduction.py.

Usage:
    python manage.py test_prospect_customers
"""
import json
import time
from django.core.management.base import BaseCommand
from django.test import Client
from django.contrib.auth.models import User

from users.models import UserProfile
from customers.models import Customer
from teams.models import TeamMembership
from requests.models import RedemptionRequest

TEMP_PASSWORD = 'opc1985!'


class Command(BaseCommand):
    help = 'Test all prospect customer endpoints (create, check_similar, promote, merge, list_all)'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.client = Client(SERVER_NAME='localhost')
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        # Track state for cleanup
        self._original_passwords = {}   # user_id -> hashed password
        self._created_customer_ids = []  # Customer IDs to hard-delete
        self._created_request_ids = []   # RedemptionRequest IDs to hard-delete
        self._ts = str(int(time.time()))  # unique suffix for test names

    # ── Helpers ──────────────────────────────────────────────────────

    def _login(self, user):
        resp = self.client.post(
            '/api/login/',
            data=json.dumps({'username': user.username, 'password': TEMP_PASSWORD}),
            content_type='application/json',
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get('needs_activation'):
                self.stderr.write(f'  ⚠ User {user.username} needs activation')
                return False
            return True
        self.stderr.write(
            f'  ⚠ Login failed for {user.username}: {resp.status_code} '
            f'{resp.content.decode()[:200]}'
        )
        return False

    def _logout(self):
        self.client.post('/api/logout/')

    def _set_temp_password(self, user):
        if user.id not in self._original_passwords:
            self._original_passwords[user.id] = user.password
        user.set_password(TEMP_PASSWORD)
        user.save(update_fields=['password'])

    def _pass(self, msg):
        self.passed += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ PASS: {msg}'))

    def _fail(self, msg):
        self.failed += 1
        self.stdout.write(self.style.ERROR(f'  ✗ FAIL: {msg}'))

    def _skip(self, msg):
        self.skipped += 1
        self.stdout.write(self.style.WARNING(f'  ⊘ SKIP: {msg}'))

    def _post_json(self, url, payload=None):
        resp = self.client.post(
            url,
            data=json.dumps(payload or {}),
            content_type='application/json',
        )
        try:
            body = resp.json()
        except Exception:
            body = {}
        return resp, body

    def _get(self, url):
        resp = self.client.get(url)
        try:
            body = resp.json()
        except Exception:
            body = {}
        return resp, body

    # ── Data Discovery ───────────────────────────────────────────────

    def _discover_data(self):
        data = {}

        # 1. Sales Agent in a team
        membership = TeamMembership.objects.select_related(
            'user', 'user__profile', 'team',
        ).filter(
            user__profile__position='Sales Agent',
            user__profile__is_archived=False,
            user__is_active=True,
            team__is_archived=False,
        ).first()

        if not membership:
            self.stderr.write(self.style.ERROR(
                'No Sales Agent in a team found. Cannot run tests.'
            ))
            return None

        data['agent'] = membership.user
        self.stdout.write(f'  Agent:     {data["agent"].username} (id={data["agent"].id})')

        # 2. Admin user
        admin_profile = UserProfile.objects.filter(
            position='Admin', is_archived=False, user__is_active=True,
        ).select_related('user').first()
        if admin_profile:
            data['admin'] = admin_profile.user
            self.stdout.write(f'  Admin:     {data["admin"].username} (id={data["admin"].id})')
        else:
            data['admin'] = None
            self.stdout.write(self.style.WARNING('  Admin:     (none found)'))

        # 3. Non-admin user (for permission denial tests)
        non_admin_profile = UserProfile.objects.filter(
            is_archived=False, user__is_active=True,
        ).exclude(position='Admin').select_related('user').first()
        if non_admin_profile:
            data['non_admin'] = non_admin_profile.user
            self.stdout.write(
                f'  Non-admin: {data["non_admin"].username} '
                f'(id={data["non_admin"].id}, position={non_admin_profile.position})'
            )
        else:
            data['non_admin'] = None
            self.stdout.write(self.style.WARNING('  Non-admin: (none found)'))

        # 4. Existing full customer (non-prospect, non-archived)
        data['full_customer'] = Customer.objects.filter(
            is_prospect=False, is_archived=False,
        ).first()
        if data['full_customer']:
            self.stdout.write(
                f'  Customer:  {data["full_customer"].name} (id={data["full_customer"].id})'
            )
        else:
            data['full_customer'] = None
            self.stdout.write(self.style.WARNING('  Customer:  (none found)'))

        return data

    # ── Test Cases ───────────────────────────────────────────────────

    # ─── Phase C: create_prospect ────────────────────────────────────

    def _test_create_prospect_happy(self, data):
        """Test 1: Create prospect – happy path."""
        self.stdout.write('\n── Test 1: Create prospect (happy path) ──')
        agent = data['agent']
        if not self._login(agent):
            self._fail('Could not login as agent')
            return None

        name = f'_TestProspect_{self._ts}'
        resp, body = self._post_json('/api/customers/create_prospect/', {'name': name})
        self._logout()

        if resp.status_code != 201:
            self._fail(f'Expected 201, got {resp.status_code}: {json.dumps(body)[:300]}')
            return None

        cid = body.get('id')
        if cid:
            self._created_customer_ids.append(cid)

        ok = True
        if not body.get('is_prospect'):
            self._fail(f'is_prospect should be True, got {body.get("is_prospect")}')
            ok = False
        if body.get('brand') not in ('', None):
            self._fail(f'brand should be empty, got "{body.get("brand")}"')
            ok = False
        if body.get('sales_channel') not in ('', None):
            self._fail(f'sales_channel should be empty, got "{body.get("sales_channel")}"')
            ok = False
        if body.get('name') != name:
            self._fail(f'Name mismatch: expected "{name}", got "{body.get("name")}"')
            ok = False
        if ok:
            self._pass(f'Created prospect id={cid}, name="{name}", is_prospect=True')
        return cid

    def _test_create_prospect_blank_name(self, data):
        """Test 2: Create prospect with blank name."""
        self.stdout.write('\n── Test 2: Create prospect (blank name) ──')
        agent = data['agent']
        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        resp, body = self._post_json('/api/customers/create_prospect/', {'name': ''})
        self._logout()

        if resp.status_code == 400:
            self._pass(f'Correctly rejected blank name: {resp.status_code}')
        else:
            # If a customer was accidentally created, track it for cleanup
            if resp.status_code == 201 and body.get('id'):
                self._created_customer_ids.append(body['id'])
            self._fail(f'Expected 400, got {resp.status_code}: {json.dumps(body)[:300]}')

    def _test_create_prospect_unauthenticated(self, data):
        """Test 3: Create prospect while not logged in."""
        self.stdout.write('\n── Test 3: Create prospect (unauthenticated) ──')
        self._logout()  # ensure logged out

        resp, body = self._post_json(
            '/api/customers/create_prospect/',
            {'name': f'_Unauth_{self._ts}'},
        )

        if resp.status_code in (401, 403):
            self._pass(f'Correctly denied unauthenticated: {resp.status_code}')
        else:
            if resp.status_code == 201 and body.get('id'):
                self._created_customer_ids.append(body['id'])
            self._fail(f'Expected 401/403, got {resp.status_code}')

    # ─── Phase D: check_similar ──────────────────────────────────────

    def _test_check_similar_exact(self, data, prospect_id):
        """Test 4: check_similar returns exact match."""
        self.stdout.write('\n── Test 4: check_similar (exact match) ──')
        agent = data['agent']
        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        if not prospect_id:
            self._skip('No prospect was created in Test 1')
            self._logout()
            return

        name = f'_TestProspect_{self._ts}'
        resp, body = self._get(f'/api/customers/check_similar/?name={name}')
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Expected 200, got {resp.status_code}')
            return

        exact = body.get('exact_match')
        if exact and exact.get('id') == prospect_id:
            self._pass(f'Exact match found: id={exact["id"]}, name="{exact["name"]}"')
        else:
            self._fail(
                f'Expected exact_match with id={prospect_id}, '
                f'got {json.dumps(exact)[:200]}'
            )

    def _test_check_similar_fuzzy(self, data, prospect_id):
        """Test 5: check_similar returns fuzzy matches."""
        self.stdout.write('\n── Test 5: check_similar (fuzzy match) ──')
        agent = data['agent']
        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        if not prospect_id:
            self._skip('No prospect was created in Test 1')
            self._logout()
            return

        # Slight typo of the prospect name
        fuzzy_name = f'_TestPrspect_{self._ts}'
        resp, body = self._get(f'/api/customers/check_similar/?name={fuzzy_name}')
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Expected 200, got {resp.status_code}')
            return

        similar = body.get('similar', [])
        found = any(s.get('id') == prospect_id for s in similar)
        if found:
            self._pass(f'Fuzzy match found prospect id={prospect_id} in similar list ({len(similar)} results)')
        else:
            # Trigram may or may not match depending on DB — soft fail
            self._fail(
                f'Prospect id={prospect_id} not in similar list '
                f'(got {len(similar)} results: {[s.get("name") for s in similar[:3]]})'
            )

    def _test_check_similar_no_match(self, data):
        """Test 6: check_similar with totally unique name."""
        self.stdout.write('\n── Test 6: check_similar (no match) ──')
        agent = data['agent']
        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        gibberish = f'Zzxqwk_{self._ts}_NoMatch'
        resp, body = self._get(f'/api/customers/check_similar/?name={gibberish}')
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Expected 200, got {resp.status_code}')
            return

        ok = True
        if body.get('exact_match') is not None:
            self._fail(f'Expected exact_match=null, got {body["exact_match"]}')
            ok = False
        if body.get('similar') and len(body['similar']) > 0:
            self._fail(f'Expected empty similar[], got {len(body["similar"])} results')
            ok = False
        if ok:
            self._pass('No matches found for gibberish name')

    def _test_check_similar_empty(self, data):
        """Test 7: check_similar with empty name param."""
        self.stdout.write('\n── Test 7: check_similar (empty name) ──')
        agent = data['agent']
        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        resp, body = self._get('/api/customers/check_similar/')
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Expected 200, got {resp.status_code}')
            return

        if body.get('exact_match') is None and body.get('similar') == []:
            self._pass('Empty name returns null exact_match and empty similar')
        else:
            self._fail(f'Unexpected response: {json.dumps(body)[:200]}')

    # ─── Phase E: promote ────────────────────────────────────────────

    def _create_prospect_for_test(self, data, suffix=''):
        """Helper: Create a prospect via API for use in subsequent tests. Returns customer id or None."""
        agent = data['agent']
        if not self._login(agent):
            return None
        name = f'_PromoteTest_{self._ts}{suffix}'
        resp, body = self._post_json('/api/customers/create_prospect/', {'name': name})
        self._logout()
        if resp.status_code == 201 and body.get('id'):
            self._created_customer_ids.append(body['id'])
            return body['id']
        return None

    def _test_promote_happy(self, data):
        """Test 8: Promote prospect – happy path."""
        self.stdout.write('\n── Test 8: Promote prospect (happy path) ──')
        admin = data.get('admin')
        if not admin:
            self._skip('No admin user found')
            return

        prospect_id = self._create_prospect_for_test(data, '_promo')
        if not prospect_id:
            self._fail('Could not create prospect for promote test')
            return

        if not self._login(admin):
            self._fail('Could not login as admin')
            return

        resp, body = self._post_json(
            f'/api/customers/{prospect_id}/promote/',
            {'brand': 'TestBrand', 'sales_channel': 'TestChannel'},
        )
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Expected 200, got {resp.status_code}: {json.dumps(body)[:300]}')
            return

        customer = body.get('customer', {})
        ok = True
        if customer.get('is_prospect') is not False:
            self._fail(f'is_prospect should be False, got {customer.get("is_prospect")}')
            ok = False
        if customer.get('brand') != 'TestBrand':
            self._fail(f'brand mismatch: {customer.get("brand")}')
            ok = False
        if customer.get('sales_channel') != 'TestChannel':
            self._fail(f'sales_channel mismatch: {customer.get("sales_channel")}')
            ok = False
        if ok:
            self._pass(f'Promoted id={prospect_id}: is_prospect=False, brand=TestBrand, sales_channel=TestChannel')

    def _test_promote_non_prospect(self, data):
        """Test 9: Promote a non-prospect customer."""
        self.stdout.write('\n── Test 9: Promote non-prospect ──')
        admin = data.get('admin')
        full_customer = data.get('full_customer')
        if not admin:
            self._skip('No admin user found')
            return
        if not full_customer:
            self._skip('No full customer found')
            return

        if not self._login(admin):
            self._fail('Could not login as admin')
            return

        resp, body = self._post_json(
            f'/api/customers/{full_customer.id}/promote/',
            {'brand': 'X', 'sales_channel': 'Y'},
        )
        self._logout()

        if resp.status_code == 400:
            self._pass(f'Correctly rejected: "{body.get("error", "")}"')
        else:
            self._fail(f'Expected 400, got {resp.status_code}: {json.dumps(body)[:200]}')

    def _test_promote_missing_brand(self, data):
        """Test 10: Promote without brand."""
        self.stdout.write('\n── Test 10: Promote without brand ──')
        admin = data.get('admin')
        if not admin:
            self._skip('No admin user found')
            return

        prospect_id = self._create_prospect_for_test(data, '_noBrand')
        if not prospect_id:
            self._fail('Could not create prospect')
            return

        if not self._login(admin):
            self._fail('Could not login as admin')
            return

        resp, body = self._post_json(
            f'/api/customers/{prospect_id}/promote/',
            {'brand': '', 'sales_channel': 'TestChannel'},
        )
        self._logout()

        if resp.status_code == 400:
            self._pass(f'Correctly rejected missing brand: "{body.get("error", "")}"')
        else:
            self._fail(f'Expected 400, got {resp.status_code}')

    def _test_promote_missing_sales_channel(self, data):
        """Test 11: Promote without sales_channel."""
        self.stdout.write('\n── Test 11: Promote without sales_channel ──')
        admin = data.get('admin')
        if not admin:
            self._skip('No admin user found')
            return

        prospect_id = self._create_prospect_for_test(data, '_noSC')
        if not prospect_id:
            self._fail('Could not create prospect')
            return

        if not self._login(admin):
            self._fail('Could not login as admin')
            return

        resp, body = self._post_json(
            f'/api/customers/{prospect_id}/promote/',
            {'brand': 'TestBrand', 'sales_channel': ''},
        )
        self._logout()

        if resp.status_code == 400:
            self._pass(f'Correctly rejected missing sales_channel: "{body.get("error", "")}"')
        else:
            self._fail(f'Expected 400, got {resp.status_code}')

    def _test_promote_non_admin(self, data):
        """Test 12: Promote as non-admin."""
        self.stdout.write('\n── Test 12: Promote as non-admin ──')
        non_admin = data.get('non_admin')
        if not non_admin:
            self._skip('No non-admin user found')
            return

        prospect_id = self._create_prospect_for_test(data, '_permDeny')
        if not prospect_id:
            self._fail('Could not create prospect')
            return

        if not self._login(non_admin):
            self._fail('Could not login as non-admin')
            return

        resp, body = self._post_json(
            f'/api/customers/{prospect_id}/promote/',
            {'brand': 'X', 'sales_channel': 'Y'},
        )
        self._logout()

        if resp.status_code == 403:
            self._pass(f'Correctly denied non-admin: {resp.status_code}')
        else:
            self._fail(f'Expected 403, got {resp.status_code}: {json.dumps(body)[:200]}')

    # ─── Phase F: merge ──────────────────────────────────────────────

    def _test_merge_happy(self, data):
        """Test 13: Merge prospect into full customer with request reassignment."""
        self.stdout.write('\n── Test 13: Merge (happy path + request reassignment) ──')
        admin = data.get('admin')
        full_customer = data.get('full_customer')
        agent = data['agent']
        if not admin:
            self._skip('No admin user found')
            return
        if not full_customer:
            self._skip('No full customer to merge into')
            return

        # Create a prospect to be the merge source
        prospect_id = self._create_prospect_for_test(data, '_mergeSource')
        if not prospect_id:
            self._fail('Could not create prospect for merge')
            return

        prospect = Customer.objects.get(pk=prospect_id)

        # Create a RedemptionRequest via ORM pointing to that prospect
        rr = RedemptionRequest.objects.create(
            requested_by=agent,
            requested_for_customer=prospect,
            requested_for_type='CUSTOMER',
            points_deducted_from='SELF',
            status='APPROVED',
        )
        self._created_request_ids.append(rr.id)

        if not self._login(admin):
            self._fail('Could not login as admin')
            return

        resp, body = self._post_json(
            f'/api/customers/{prospect_id}/merge/',
            {'merge_into_id': full_customer.id},
        )
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Expected 200, got {resp.status_code}: {json.dumps(body)[:300]}')
            return

        ok = True
        # Check request was reassigned
        rr.refresh_from_db()
        if rr.requested_for_customer_id != full_customer.id:
            self._fail(
                f'Request not reassigned: expected customer_id={full_customer.id}, '
                f'got {rr.requested_for_customer_id}'
            )
            ok = False

        # Check source is archived
        prospect.refresh_from_db()
        if not prospect.is_archived:
            self._fail('Source prospect was not archived after merge')
            ok = False

        msg = body.get('message', '')
        if '1 request(s) reassigned' not in msg:
            self._fail(f'Unexpected message: "{msg}"')
            ok = False

        if ok:
            self._pass(
                f'Merged prospect id={prospect_id} into customer id={full_customer.id}, '
                f'1 request reassigned, source archived'
            )

    def _test_merge_missing_target(self, data):
        """Test 14: Merge without merge_into_id."""
        self.stdout.write('\n── Test 14: Merge (missing merge_into_id) ──')
        admin = data.get('admin')
        if not admin:
            self._skip('No admin user found')
            return

        prospect_id = self._create_prospect_for_test(data, '_mergeNoTarget')
        if not prospect_id:
            self._fail('Could not create prospect')
            return

        if not self._login(admin):
            self._fail('Could not login as admin')
            return

        resp, body = self._post_json(f'/api/customers/{prospect_id}/merge/', {})
        self._logout()

        if resp.status_code == 400:
            self._pass(f'Correctly rejected missing merge_into_id: "{body.get("error", "")}"')
        else:
            self._fail(f'Expected 400, got {resp.status_code}')

    def _test_merge_nonexistent_target(self, data):
        """Test 15: Merge into non-existent target."""
        self.stdout.write('\n── Test 15: Merge (non-existent target) ──')
        admin = data.get('admin')
        if not admin:
            self._skip('No admin user found')
            return

        prospect_id = self._create_prospect_for_test(data, '_mergeGhost')
        if not prospect_id:
            self._fail('Could not create prospect')
            return

        if not self._login(admin):
            self._fail('Could not login as admin')
            return

        resp, body = self._post_json(
            f'/api/customers/{prospect_id}/merge/',
            {'merge_into_id': 999999},
        )
        self._logout()

        if resp.status_code == 404:
            self._pass(f'Correctly returned 404: "{body.get("error", "")}"')
        else:
            self._fail(f'Expected 404, got {resp.status_code}')

    def _test_merge_self(self, data):
        """Test 16: Merge a customer into itself."""
        self.stdout.write('\n── Test 16: Merge (self-merge) ──')
        admin = data.get('admin')
        if not admin:
            self._skip('No admin user found')
            return

        prospect_id = self._create_prospect_for_test(data, '_mergeSelf')
        if not prospect_id:
            self._fail('Could not create prospect')
            return

        if not self._login(admin):
            self._fail('Could not login as admin')
            return

        resp, body = self._post_json(
            f'/api/customers/{prospect_id}/merge/',
            {'merge_into_id': prospect_id},
        )
        self._logout()

        if resp.status_code == 400:
            self._pass(f'Correctly rejected self-merge: "{body.get("error", "")}"')
        else:
            self._fail(f'Expected 400, got {resp.status_code}')

    def _test_merge_non_admin(self, data):
        """Test 17: Merge as non-admin."""
        self.stdout.write('\n── Test 17: Merge (non-admin) ──')
        non_admin = data.get('non_admin')
        full_customer = data.get('full_customer')
        if not non_admin:
            self._skip('No non-admin user found')
            return
        if not full_customer:
            self._skip('No full customer found')
            return

        prospect_id = self._create_prospect_for_test(data, '_mergeNonAdm')
        if not prospect_id:
            self._fail('Could not create prospect')
            return

        if not self._login(non_admin):
            self._fail('Could not login as non-admin')
            return

        resp, body = self._post_json(
            f'/api/customers/{prospect_id}/merge/',
            {'merge_into_id': full_customer.id},
        )
        self._logout()

        if resp.status_code == 403:
            self._pass(f'Correctly denied non-admin: {resp.status_code}')
        else:
            self._fail(f'Expected 403, got {resp.status_code}: {json.dumps(body)[:200]}')

    # ─── Phase G: list_all + visibility ──────────────────────────────

    def _test_list_all_has_is_prospect(self, data):
        """Test 18: list_all response includes is_prospect field."""
        self.stdout.write('\n── Test 18: list_all includes is_prospect ──')
        agent = data['agent']
        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        resp, body = self._get('/api/customers/list_all/')
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Expected 200, got {resp.status_code}')
            return

        if not isinstance(body, list) or len(body) == 0:
            self._skip('list_all returned empty list — cannot verify fields')
            return

        if 'is_prospect' in body[0]:
            self._pass(f'is_prospect field present in list_all response ({len(body)} items)')
        else:
            self._fail(f'is_prospect missing from list_all. Keys: {list(body[0].keys())}')

    def _test_list_all_prospect_visible(self, data, prospect_id):
        """Test 19: Active prospect appears in list_all."""
        self.stdout.write('\n── Test 19: Active prospect in list_all ──')
        agent = data['agent']
        if not prospect_id:
            self._skip('No prospect created to check')
            return

        # Ensure the prospect is not archived (it shouldn't be at this point)
        prospect = Customer.objects.filter(pk=prospect_id, is_archived=False).first()
        if not prospect:
            self._skip(f'Prospect id={prospect_id} is already archived or deleted')
            return

        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        resp, body = self._get('/api/customers/list_all/')
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Expected 200, got {resp.status_code}')
            return

        ids = [c['id'] for c in body]
        if prospect_id in ids:
            self._pass(f'Prospect id={prospect_id} found in list_all')
        else:
            self._fail(f'Prospect id={prospect_id} NOT found in list_all ({len(body)} items)')

    def _test_list_all_archived_excluded(self, data, merged_prospect_id):
        """Test 20: Archived prospect (from merge) not in list_all."""
        self.stdout.write('\n── Test 20: Archived prospect excluded from list_all ──')
        agent = data['agent']
        if not merged_prospect_id:
            self._skip('No merged prospect to check')
            return

        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        resp, body = self._get('/api/customers/list_all/')
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Expected 200, got {resp.status_code}')
            return

        ids = [c['id'] for c in body]
        if merged_prospect_id not in ids:
            self._pass(f'Archived prospect id={merged_prospect_id} correctly excluded from list_all')
        else:
            self._fail(f'Archived prospect id={merged_prospect_id} still appears in list_all')

    # ── Cleanup ──────────────────────────────────────────────────────

    def _cleanup(self):
        self.stdout.write('\n── Cleanup ──')

        # Delete test requests
        if self._created_request_ids:
            deleted, _ = RedemptionRequest.objects.filter(
                id__in=self._created_request_ids,
            ).delete()
            self.stdout.write(f'  Deleted {deleted} test RedemptionRequest(s)')

        # Delete test customers
        if self._created_customer_ids:
            deleted, _ = Customer.objects.filter(
                id__in=self._created_customer_ids,
            ).delete()
            self.stdout.write(f'  Deleted {deleted} test Customer(s)')

        # Restore passwords
        for user_id, pw_hash in self._original_passwords.items():
            User.objects.filter(id=user_id).update(password=pw_hash)
        if self._original_passwords:
            self.stdout.write(
                f'  Restored passwords for {len(self._original_passwords)} user(s)'
            )

    # ── Main ─────────────────────────────────────────────────────────

    def handle(self, *args, **options):
        self.stdout.write(self.style.HTTP_INFO(
            '\n═══ Prospect Customer Test Suite ═══\n'
        ))

        # Discover data
        self.stdout.write('Discovering test data...')
        data = self._discover_data()
        if not data:
            self.stdout.write(self.style.ERROR('\nAborted: missing critical test data.'))
            return

        # Set temp passwords
        users_to_prep = [data['agent']]
        if data.get('admin'):
            users_to_prep.append(data['admin'])
        if data.get('non_admin'):
            users_to_prep.append(data['non_admin'])
        for u in users_to_prep:
            self._set_temp_password(u)

        # Track prospect IDs for cross-test references
        first_prospect_id = None     # from Test 1, used in Tests 4-5, 18-19
        merge_source_id = None       # from Test 13, used in Test 20

        try:
            # Phase C — create_prospect
            first_prospect_id = self._test_create_prospect_happy(data)
            self._test_create_prospect_blank_name(data)
            self._test_create_prospect_unauthenticated(data)

            # Phase D — check_similar
            self._test_check_similar_exact(data, first_prospect_id)
            self._test_check_similar_fuzzy(data, first_prospect_id)
            self._test_check_similar_no_match(data)
            self._test_check_similar_empty(data)

            # Phase E — promote
            self._test_promote_happy(data)
            self._test_promote_non_prospect(data)
            self._test_promote_missing_brand(data)
            self._test_promote_missing_sales_channel(data)
            self._test_promote_non_admin(data)

            # Phase F — merge (capture the merged source ID for Test 20)
            # Find the prospect that _test_merge_happy will create
            merge_source_name = f'_PromoteTest_{self._ts}_mergeSource'
            self._test_merge_happy(data)
            merged = Customer.objects.filter(name=merge_source_name).first()
            merge_source_id = merged.id if merged else None

            self._test_merge_missing_target(data)
            self._test_merge_nonexistent_target(data)
            self._test_merge_self(data)
            self._test_merge_non_admin(data)

            # Phase G — list_all
            self._test_list_all_has_is_prospect(data)
            self._test_list_all_prospect_visible(data, first_prospect_id)
            self._test_list_all_archived_excluded(data, merge_source_id)

        finally:
            self._cleanup()

        # Summary
        total = self.passed + self.failed + self.skipped
        self.stdout.write(self.style.HTTP_INFO(
            f'\n═══ Results: {self.passed} passed, {self.failed} failed, '
            f'{self.skipped} skipped (of {total}) ═══\n'
        ))
        if self.failed:
            self.stdout.write(self.style.ERROR('Some tests FAILED.'))
        else:
            self.stdout.write(self.style.SUCCESS('All tests passed!'))
