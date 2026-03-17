"""
Management command to test points deduction across both deduction paths
(SELF, DISTRIBUTOR), both auto-approve and manual-approve flows,
cancellation refunds (admin + handler), and insufficient-points rejection.

Usage:
    python manage.py test_points_deduction
"""
import json
from django.core.management.base import BaseCommand
from django.test import Client
from django.contrib.auth.models import User

from users.models import UserProfile
from distributers.models import Distributor
from items_catalogue.models import Product
from teams.models import Team, TeamMembership
from requests.models import RedemptionRequest
from points_audit.models import PointsAuditLog

TEMP_PASSWORD = 'opc1985!'


class Command(BaseCommand):
    help = 'Test points deduction across all deduction paths and approval flows'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.client = Client(SERVER_NAME='localhost')
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        # Track original state for cleanup
        self._original_passwords = {}  # user_id -> old password hash
        self._original_points = {}     # (type, id) -> old points
        self._created_request_ids = []
        self._toggled_product_id = None  # product whose requires_sales_approval was flipped

    # ── Helpers ──────────────────────────────────────────────────────

    def _login(self, user):
        """Login a user via the API and return True on success."""
        resp = self.client.post(
            '/api/login/',
            data=json.dumps({'username': user.username, 'password': TEMP_PASSWORD}),
            content_type='application/json',
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get('needs_activation'):
                self.stderr.write(f'  ⚠ User {user.username} needs activation, cannot login')
                return False
            return True
        self.stderr.write(f'  ⚠ Login failed for {user.username}: {resp.status_code} {resp.content.decode()[:200]}')
        return False

    def _logout(self):
        self.client.post('/api/logout/')

    def _set_temp_password(self, user):
        """Set a temporary known password, saving original hash for restore."""
        if user.id not in self._original_passwords:
            self._original_passwords[user.id] = user.password  # hashed
        user.set_password(TEMP_PASSWORD)
        user.save(update_fields=['password'])

    def _save_points(self, entity_type, entity_id, current_points):
        key = (entity_type, entity_id)
        if key not in self._original_points:
            self._original_points[key] = current_points

    def _get_agent_points(self, user):
        """Get fresh agent points from DB."""
        return UserProfile.objects.get(user=user).points

    def _get_distributor_points(self, dist):
        return Distributor.objects.get(id=dist.id).points

    def _create_request(self, payload):
        """POST to create a redemption request. Returns (response, data)."""
        resp = self.client.post(
            '/api/redemption-requests/',
            data=json.dumps(payload),
            content_type='application/json',
        )
        data = resp.json() if resp.status_code in (200, 201, 400) else {}
        if resp.status_code == 201 and data.get('id'):
            self._created_request_ids.append(data['id'])
        return resp, data

    def _approve_request(self, request_id):
        """Approve via the legacy approve endpoint."""
        resp = self.client.post(
            f'/api/redemption-requests/{request_id}/approve/',
            data=json.dumps({}),
            content_type='application/json',
        )
        return resp, resp.json() if resp.status_code in (200, 400, 403) else {}

    def _cancel_request(self, request_id, reason='Test cancellation'):
        resp = self.client.post(
            f'/api/redemption-requests/{request_id}/cancel_request/',
            data=json.dumps({'cancellation_reason': reason}),
            content_type='application/json',
        )
        return resp, resp.json() if resp.status_code in (200, 400, 403) else {}

    def _check_audit_log(self, entity_type, entity_id, action_type, after_id=0):
        """Check if audit log entry exists after a given id."""
        return PointsAuditLog.objects.filter(
            entity_type=entity_type,
            entity_id=entity_id,
            action_type=action_type,
            id__gt=after_id,
        ).exists()

    def _last_audit_id(self):
        last = PointsAuditLog.objects.order_by('-id').first()
        return last.id if last else 0

    def _pass(self, msg):
        self.passed += 1
        self.stdout.write(self.style.SUCCESS(f'  ✓ PASS: {msg}'))

    def _fail(self, msg):
        self.failed += 1
        self.stdout.write(self.style.ERROR(f'  ✗ FAIL: {msg}'))

    def _skip(self, msg):
        self.skipped += 1
        self.stdout.write(self.style.WARNING(f'  ⊘ SKIP: {msg}'))

    # ── Data Discovery ───────────────────────────────────────────────

    def _discover_data(self):
        """Find suitable test entities from the database. Returns dict or None on critical failure."""
        data = {}

        # 1. Find a Sales Agent who is in a team
        membership = TeamMembership.objects.select_related(
            'user', 'user__profile', 'team', 'team__approver'
        ).filter(
            user__profile__position='Sales Agent',
            user__profile__is_archived=False,
            user__is_active=True,
            team__is_archived=False,
        ).first()

        if not membership:
            self.stderr.write(self.style.ERROR('No Sales Agent in a team found. Cannot run tests.'))
            return None

        data['agent'] = membership.user
        data['team'] = membership.team
        self.stdout.write(f'  Agent:    {data["agent"].username} (id={data["agent"].id}, '
                          f'points={self._get_agent_points(data["agent"])})')

        # 2. Approver for that team
        if not membership.team.approver:
            self.stderr.write(self.style.ERROR(f'Team "{membership.team.name}" has no approver. Cannot run approval tests.'))
            data['approver'] = None
        else:
            data['approver'] = membership.team.approver
            self.stdout.write(f'  Approver: {data["approver"].username} (id={data["approver"].id})')

        # 3. Admin user
        admin_profile = UserProfile.objects.filter(
            position='Admin', is_archived=False, user__is_active=True
        ).select_related('user').first()
        if admin_profile:
            data['admin'] = admin_profile.user
            self.stdout.write(f'  Admin:    {data["admin"].username} (id={data["admin"].id})')
        else:
            data['admin'] = None
            self.stdout.write(self.style.WARNING('  Admin:    (none found, cancel test will be skipped)'))

        # 4. Marketing user
        marketing_profile = UserProfile.objects.filter(
            position='Handler', is_archived=False, user__is_active=True
        ).select_related('user').first()
        if marketing_profile:
            data['marketing'] = marketing_profile.user
            self.stdout.write(f'  Handler: {data["marketing"].username} (id={data["marketing"].id})')
        else:
            data['marketing'] = None
            self.stdout.write(self.style.WARNING('  Handler: (none found, handler cancel test will be skipped)'))

        # 5. Distributor with points
        data['distributor'] = Distributor.objects.filter(is_archived=False).order_by('-points').first()
        if data['distributor']:
            self.stdout.write(f'  Distrib:  {data["distributor"].name} (id={data["distributor"].id}, '
                              f'points={data["distributor"].points})')
        else:
            self.stdout.write(self.style.WARNING('  Distrib:  (none found, distributor tests will be skipped)'))

        # 6. Auto-approve product (requires_sales_approval=False, FIXED pricing)
        data['auto_product'] = Product.objects.filter(
            is_archived=False,
            requires_sales_approval=False,
            pricing_type='FIXED',
        ).exclude(points=0).first()
        if not data['auto_product']:
            # Temporarily toggle a manual-approve product for auto-approve tests
            candidate = Product.objects.filter(
                is_archived=False, pricing_type='FIXED',
            ).exclude(points=0).first()
            if candidate:
                self._toggled_product_id = candidate.id
                candidate.requires_sales_approval = False
                candidate.save(update_fields=['requires_sales_approval'])
                data['auto_product'] = candidate
                self.stdout.write(self.style.WARNING(
                    f'  Auto-approve product: (toggled) {candidate.item_code} "{candidate.item_name}" '
                    f'(points={candidate.points}, stock={candidate.stock}, has_stock={candidate.has_stock})'))
            else:
                self.stdout.write(self.style.WARNING('  Auto-approve product: (none found)'))
        else:
            p = data['auto_product']
            self.stdout.write(f'  Auto-approve product: {p.item_code} "{p.item_name}" '
                              f'(points={p.points}, stock={p.stock}, has_stock={p.has_stock})')

        # 8. Manual-approve product (requires_sales_approval=True, FIXED pricing)
        #    Must be different from the toggled auto-approve product
        manual_qs = Product.objects.filter(
            is_archived=False,
            requires_sales_approval=True,
            pricing_type='FIXED',
        ).exclude(points=0)
        if self._toggled_product_id:
            manual_qs = manual_qs.exclude(id=self._toggled_product_id)
        data['manual_product'] = manual_qs.first()
        if data['manual_product']:
            p = data['manual_product']
            self.stdout.write(f'  Manual-approve product: {p.item_code} "{p.item_name}" '
                              f'(points={p.points}, stock={p.stock}, has_stock={p.has_stock})')
        else:
            self.stdout.write(self.style.WARNING('  Manual-approve product: (none found)'))

        return data

    def _ensure_sufficient_points(self, entity_type, entity, needed):
        """Ensure entity has enough points for the test, topping up if needed."""
        if entity_type == 'agent':
            profile = UserProfile.objects.get(user=entity)
            self._save_points('USER', entity.id, profile.points)
            if profile.points < needed:
                profile.points = needed + 500
                profile.save(update_fields=['points'])
                self.stdout.write(f'    (topped up agent points to {profile.points})')
        elif entity_type == 'distributor':
            self._save_points('DISTRIBUTOR', entity.id, entity.points)
            if entity.points < needed:
                entity.points = needed + 500
                entity.save(update_fields=['points'])
                entity.refresh_from_db()
                self.stdout.write(f'    (topped up distributor points to {entity.points})')

    def _ensure_stock(self, product):
        """Ensure product has stock available for test."""
        if product.has_stock and product.available_stock < 5:
            product.stock = max(product.stock, 50)
            product.save(update_fields=['stock'])
            self.stdout.write(f'    (topped up stock for {product.item_code} to {product.stock})')

    # ── Test Cases ───────────────────────────────────────────────────

    def _test_self_deduction_auto_approve(self, data):
        """Test 1: SELF deduction with auto-approve product."""
        self.stdout.write('\n── Test 1: SELF deduction (auto-approve) ──')
        product = data.get('auto_product')
        agent = data['agent']
        dist = data.get('distributor')

        if not product:
            self._skip('No auto-approve product found')
            return
        if not dist:
            self._skip('No distributor found (needed as requested_for)')
            return

        points_cost = int(float(product.points)) * 1  # qty=1
        self._ensure_sufficient_points('agent', agent, points_cost)
        self._ensure_stock(product)

        before = self._get_agent_points(agent)
        audit_marker = self._last_audit_id()
        self.stdout.write(f'    Agent points before: {before}')
        self.stdout.write(f'    Expected cost: {points_cost} pts (qty=1 × {product.points})')

        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        resp, body = self._create_request({
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': dist.id,
            'points_deducted_from': 'SELF',
            'items': [{'product_id': product.id, 'quantity': 1}],
        })

        self._logout()

        if resp.status_code != 201:
            self._fail(f'Request creation failed: {resp.status_code} — {json.dumps(body)[:300]}')
            return

        after = self._get_agent_points(agent)
        self.stdout.write(f'    Agent points after:  {after}')
        req_status = body.get('status', body.get('status_display', ''))

        # Assertions
        ok = True
        if after != before - points_cost:
            self._fail(f'Points mismatch: expected {before - points_cost}, got {after}')
            ok = False
        if req_status not in ('APPROVED', 'Approved'):
            self._fail(f'Expected status APPROVED, got {req_status}')
            ok = False
        if not self._check_audit_log('USER', agent.id, 'REDEMPTION_DEDUCT', audit_marker):
            self._fail('No REDEMPTION_DEDUCT audit log entry found')
            ok = False
        if ok:
            self._pass(f'Agent points {before} → {after} (−{points_cost}), status={req_status}, audit logged')

    def _test_self_deduction_manual_approve(self, data):
        """Test 2: SELF deduction with manual-approve product (points deducted only after approval)."""
        self.stdout.write('\n── Test 2: SELF deduction (manual-approve) ──')
        product = data.get('manual_product')
        agent = data['agent']
        approver = data.get('approver')
        dist = data.get('distributor')

        if not product:
            self._skip('No manual-approve product found')
            return
        if not approver:
            self._skip('No approver found for the team')
            return
        if not dist:
            self._skip('No distributor found')
            return

        points_cost = int(float(product.points)) * 1
        self._ensure_sufficient_points('agent', agent, points_cost)
        self._ensure_stock(product)

        before = self._get_agent_points(agent)
        audit_marker = self._last_audit_id()
        self.stdout.write(f'    Agent points before: {before}')

        # Step 1: Create request as agent (should be PENDING, no deduction)
        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        resp, body = self._create_request({
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': dist.id,
            'points_deducted_from': 'SELF',
            'items': [{'product_id': product.id, 'quantity': 1}],
        })
        self._logout()

        if resp.status_code != 201:
            self._fail(f'Request creation failed: {resp.status_code} — {json.dumps(body)[:300]}')
            return

        request_id = body['id']
        after_create = self._get_agent_points(agent)
        self.stdout.write(f'    Agent points after create: {after_create} (should be unchanged)')

        if after_create != before:
            self._fail(f'Points changed at creation: {before} → {after_create} (expected no change)')
            return

        # Step 2: Approve as approver
        self._set_temp_password(approver)
        if not self._login(approver):
            self._fail('Could not login as approver')
            return

        resp, body = self._approve_request(request_id)
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Approve failed: {resp.status_code} — {json.dumps(body)[:300]}')
            return

        after_approve = self._get_agent_points(agent)
        self.stdout.write(f'    Agent points after approve: {after_approve}')

        ok = True
        if after_approve != before - points_cost:
            self._fail(f'Points mismatch after approval: expected {before - points_cost}, got {after_approve}')
            ok = False
        if not self._check_audit_log('USER', agent.id, 'REDEMPTION_DEDUCT', audit_marker):
            self._fail('No REDEMPTION_DEDUCT audit log entry found')
            ok = False
        if ok:
            self._pass(f'Points unchanged at creation, deducted on approval: {before} → {after_approve} (−{points_cost})')

    def _test_distributor_deduction(self, data):
        """Test 3: DISTRIBUTOR deduction with auto-approve product."""
        self.stdout.write('\n── Test 3: DISTRIBUTOR deduction (auto-approve) ──')
        product = data.get('auto_product')
        agent = data['agent']
        dist = data.get('distributor')

        if not product:
            self._skip('No auto-approve product found')
            return
        if not dist:
            self._skip('No distributor found')
            return

        points_cost = int(float(product.points)) * 1
        self._ensure_sufficient_points('distributor', dist, points_cost)
        self._ensure_stock(product)

        agent_before = self._get_agent_points(agent)
        dist_before = self._get_distributor_points(dist)
        audit_marker = self._last_audit_id()
        self.stdout.write(f'    Distributor points before: {dist_before}')
        self.stdout.write(f'    Agent points before: {agent_before}')

        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        resp, body = self._create_request({
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': dist.id,
            'points_deducted_from': 'DISTRIBUTOR',
            'items': [{'product_id': product.id, 'quantity': 1}],
        })
        self._logout()

        if resp.status_code != 201:
            self._fail(f'Request creation failed: {resp.status_code} — {json.dumps(body)[:300]}')
            return

        dist_after = self._get_distributor_points(dist)
        agent_after = self._get_agent_points(agent)
        self.stdout.write(f'    Distributor points after: {dist_after}')
        self.stdout.write(f'    Agent points after: {agent_after}')

        ok = True
        if dist_after != dist_before - points_cost:
            self._fail(f'Distributor points mismatch: expected {dist_before - points_cost}, got {dist_after}')
            ok = False
        if agent_after != agent_before:
            self._fail(f'Agent points should be unchanged: was {agent_before}, now {agent_after}')
            ok = False
        if not self._check_audit_log('DISTRIBUTOR', dist.id, 'REDEMPTION_DEDUCT', audit_marker):
            self._fail('No REDEMPTION_DEDUCT audit log entry for distributor')
            ok = False
        if ok:
            self._pass(f'Distributor {dist_before} → {dist_after} (−{points_cost}), agent unchanged')

    def _test_cancellation_refund(self, data):
        """Test 4: Cancel an approved request and verify points are refunded (Admin)."""
        self.stdout.write('\n── Test 4: Cancellation refund (Admin) ──')
        product = data.get('auto_product')
        agent = data['agent']
        admin = data.get('admin')
        dist = data.get('distributor')

        if not product:
            self._skip('No auto-approve product found')
            return
        if not admin:
            self._skip('No admin user found')
            return
        if not dist:
            self._skip('No distributor found')
            return

        points_cost = int(float(product.points)) * 1
        self._ensure_sufficient_points('agent', agent, points_cost)
        self._ensure_stock(product)

        before = self._get_agent_points(agent)
        self.stdout.write(f'    Agent points before: {before}')

        # Create auto-approved request (SELF deduction)
        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        resp, body = self._create_request({
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': dist.id,
            'points_deducted_from': 'SELF',
            'items': [{'product_id': product.id, 'quantity': 1}],
        })
        self._logout()

        if resp.status_code != 201:
            self._fail(f'Request creation failed: {resp.status_code} — {json.dumps(body)[:300]}')
            return

        request_id = body['id']
        after_deduct = self._get_agent_points(agent)
        self.stdout.write(f'    Agent points after deduction: {after_deduct}')

        # Cancel as admin
        audit_marker = self._last_audit_id()
        self._set_temp_password(admin)
        if not self._login(admin):
            self._fail('Could not login as admin')
            return

        resp, body = self._cancel_request(request_id, 'Testing cancellation refund')
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Cancel failed: {resp.status_code} — {json.dumps(body)[:300]}')
            return

        after_refund = self._get_agent_points(agent)
        self.stdout.write(f'    Agent points after refund: {after_refund}')

        ok = True
        if after_refund != before:
            self._fail(f'Points not fully refunded: expected {before}, got {after_refund}')
            ok = False
        if not self._check_audit_log('USER', agent.id, 'REDEMPTION_REFUND', audit_marker):
            self._fail('No REDEMPTION_REFUND audit log entry found')
            ok = False
        if ok:
            self._pass(f'Points fully refunded: {after_deduct} → {after_refund} (+{points_cost}), audit logged')

    def _test_marketing_cancel(self, data):
        """Test 5: Handler user cancels an approved request and verifies refund."""
        self.stdout.write('\n── Test 5: Cancellation refund (Handler) ──')
        product = data.get('auto_product')
        agent = data['agent']
        marketing = data.get('marketing')
        dist = data.get('distributor')

        if not product:
            self._skip('No auto-approve product found')
            return
        if not marketing:
            self._skip('No handler user found')
            return
        if not dist:
            self._skip('No distributor found')
            return

        points_cost = int(float(product.points)) * 1
        self._ensure_sufficient_points('agent', agent, points_cost)
        self._ensure_stock(product)

        before = self._get_agent_points(agent)
        self.stdout.write(f'    Agent points before: {before}')

        # Create auto-approved request (SELF deduction)
        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        resp, body = self._create_request({
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': dist.id,
            'points_deducted_from': 'SELF',
            'items': [{'product_id': product.id, 'quantity': 1}],
        })
        self._logout()

        if resp.status_code != 201:
            self._fail(f'Request creation failed: {resp.status_code} — {json.dumps(body)[:300]}')
            return

        request_id = body['id']
        after_deduct = self._get_agent_points(agent)
        self.stdout.write(f'    Agent points after deduction: {after_deduct}')

        # Cancel as handler user
        audit_marker = self._last_audit_id()
        self._set_temp_password(marketing)
        if not self._login(marketing):
            self._fail('Could not login as handler')
            return

        resp, body = self._cancel_request(request_id, 'Handler cancellation test')
        self._logout()

        if resp.status_code != 200:
            self._fail(f'Handler cancel failed: {resp.status_code} — {json.dumps(body)[:300]}')
            return

        after_refund = self._get_agent_points(agent)
        self.stdout.write(f'    Agent points after refund: {after_refund}')

        req = RedemptionRequest.objects.get(id=request_id)

        ok = True
        if after_refund != before:
            self._fail(f'Points not fully refunded: expected {before}, got {after_refund}')
            ok = False
        if not self._check_audit_log('USER', agent.id, 'REDEMPTION_REFUND', audit_marker):
            self._fail('No REDEMPTION_REFUND audit log entry found')
            ok = False
        if req.processing_status != 'CANCELLED':
            self._fail(f'Request processing_status should be CANCELLED, got {req.processing_status}')
            ok = False
        if req.cancelled_by_id != marketing.id:
            self._fail(f'cancelled_by should be handler user ({marketing.id}), got {req.cancelled_by_id}')
            ok = False
        if ok:
            self._pass(f'Handler cancel succeeded: {after_deduct} → {after_refund} (+{points_cost}), audit logged, cancelled_by=handler')

    def _test_insufficient_points(self, data):
        """Test 6: Request should fail when entity has insufficient points."""
        self.stdout.write('\n── Test 6: Insufficient points rejection ──')
        product = data.get('auto_product')
        agent = data['agent']
        dist = data.get('distributor')

        if not product:
            self._skip('No auto-approve product found')
            return
        if not dist:
            self._skip('No distributor found')
            return

        points_cost = int(float(product.points)) * 1
        if points_cost == 0:
            self._skip('Product costs 0 points, cannot test insufficient points')
            return

        # Set agent points to less than cost
        profile = UserProfile.objects.get(user=agent)
        self._save_points('USER', agent.id, profile.points)
        profile.points = max(0, points_cost - 1)
        profile.save(update_fields=['points'])
        before = profile.points
        self.stdout.write(f'    Agent points set to: {before} (cost={points_cost})')

        if not self._login(agent):
            self._fail('Could not login as agent')
            return

        resp, body = self._create_request({
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': dist.id,
            'points_deducted_from': 'SELF',
            'items': [{'product_id': product.id, 'quantity': 1}],
        })
        self._logout()

        after = self._get_agent_points(agent)
        self.stdout.write(f'    Response status: {resp.status_code}')
        self.stdout.write(f'    Agent points after: {after}')

        ok = True
        if resp.status_code == 201:
            self._fail(f'Request should have been rejected but was created (status 201)')
            ok = False
        if after != before:
            self._fail(f'Points changed despite failure: {before} → {after}')
            ok = False
        if ok:
            self._pass(f'Request rejected (HTTP {resp.status_code}), points unchanged at {after}')

    # ── Cleanup ──────────────────────────────────────────────────────

    def _cleanup(self):
        """Restore original passwords and points."""
        self.stdout.write('\n── Cleanup ──')

        # Restore toggled product
        if self._toggled_product_id:
            Product.objects.filter(id=self._toggled_product_id).update(requires_sales_approval=True)
            self.stdout.write(f'  Restored requires_sales_approval=True on product {self._toggled_product_id}')

        # Restore passwords
        for user_id, pw_hash in self._original_passwords.items():
            User.objects.filter(id=user_id).update(password=pw_hash)
        if self._original_passwords:
            self.stdout.write(f'  Restored passwords for {len(self._original_passwords)} user(s)')

        # Restore points
        for (etype, eid), pts in self._original_points.items():
            if etype == 'USER':
                UserProfile.objects.filter(user_id=eid).update(points=pts)
            elif etype == 'DISTRIBUTOR':
                Distributor.objects.filter(id=eid).update(points=pts)
        if self._original_points:
            self.stdout.write(f'  Restored points for {len(self._original_points)} entit(ies)')

    # ── Main ─────────────────────────────────────────────────────────

    def handle(self, *args, **options):
        self.stdout.write(self.style.HTTP_INFO('\n═══ Points Deduction Test Suite ═══\n'))

        # Discover test data
        self.stdout.write('Discovering test data...')
        data = self._discover_data()
        if not data:
            self.stdout.write(self.style.ERROR('\nAborted: missing critical test data.'))
            return

        # Set temp password for the agent (used in all tests)
        self._set_temp_password(data['agent'])

        try:
            self._test_self_deduction_auto_approve(data)
            self._test_self_deduction_manual_approve(data)
            self._test_distributor_deduction(data)
            self._test_cancellation_refund(data)
            self._test_insufficient_points(data)
            self._test_marketing_cancel(data)
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
