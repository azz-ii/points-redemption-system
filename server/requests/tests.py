import json
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase, Client
from django.urls import reverse

from customers.models import Customer
from distributers.models import Distributor
from items_catalogue.models import Product
from teams.models import Team, TeamMembership
from users.models import UserProfile
from .models import (
    AcknowledgementReceiptStatus,
    ProcessingStatus,
    RedemptionRequest,
    RedemptionRequestItem,
    RequestedForType,
)


class RedemptionRequestEditTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.agent = self._create_user('agent', 'Sales Agent', points=100)
        self.approver = self._create_user('approver', 'Approver', points=100, can_self_request=True)
        self.admin = self._create_user('admin', 'Admin', points=100)
        self.distributor = Distributor.objects.create(
            name='Distributor A',
            brand='Brand A',
            sales_channel='Retail',
            points=200,
        )
        self.team = Team.objects.create(name='Team A', approver=self.approver)
        TeamMembership.objects.create(team=self.team, user=self.agent)
        self.list_url = reverse('redemption-request-list')

    def _create_user(self, username, position, points=100, can_self_request=False):
        user = User.objects.create_user(username=username, password='password123')
        UserProfile.objects.create(
            user=user,
            position=position,
            email=f'{username}@example.com',
            full_name=username.title(),
            points=points,
            can_self_request=can_self_request,
        )
        return user

    def _create_product(self, code, name, points, requires_sales_approval=True):
        return Product.objects.create(
            item_code=code,
            item_name=name,
            legend='Giveaway',
            category='General',
            points=points,
            price=points,
            pricing_formula='NONE',
            has_stock=True,
            stock=20,
            committed_stock=0,
            requires_sales_approval=requires_sales_approval,
        )

    def _create_request(self, payload):
        self.client.force_login(self.agent)
        with patch('requests.views.send_request_submitted_email', return_value=True), \
                patch('requests.views.publish_sse_event'):
            response = self.client.post(
                self.list_url,
                data=json.dumps(payload),
                content_type='application/json',
            )
        self.assertEqual(response.status_code, 201, response.content.decode())
        return response.json()

    def _detail_url(self, request_id):
        return reverse('redemption-request-detail', args=[request_id])

    @patch('requests.views.publish_sse_event')
    def test_pending_request_can_add_remove_and_change_items(self, mock_publish):
        product_a = self._create_product('P-A', 'Product A', 10, requires_sales_approval=True)
        product_b = self._create_product('P-B', 'Product B', 20, requires_sales_approval=True)
        product_c = self._create_product('P-C', 'Product C', 30, requires_sales_approval=True)

        created = self._create_request({
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': self.distributor.id,
            'points_deducted_from': 'SELF',
            'remarks': 'initial',
            'items': [
                {'product_id': product_a.id, 'quantity': 1, 'extra_data': {}},
                {'product_id': product_b.id, 'quantity': 1, 'extra_data': {}},
            ],
        })

        request_obj = RedemptionRequest.objects.get(id=created['id'])
        item_a = RedemptionRequestItem.objects.get(request=request_obj, product=product_a)
        item_b = RedemptionRequestItem.objects.get(request=request_obj, product=product_b)

        self.assertEqual(request_obj.status, 'PENDING')
        self.assertTrue(request_obj.can_be_edited())

        self.client.force_login(self.agent)
        response = self.client.patch(
            self._detail_url(request_obj.id),
            data=json.dumps({
                'remarks': 'updated remark',
                'items': [
                    {
                        'item_id': item_a.id,
                        'product_id': product_a.id,
                        'quantity': 2,
                        'extra_data': {},
                    },
                    {
                        'product_id': product_c.id,
                        'quantity': 1,
                        'extra_data': {},
                    },
                ],
            }),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200, response.content.decode())
        request_obj.refresh_from_db()
        product_a.refresh_from_db()
        product_b.refresh_from_db()
        product_c.refresh_from_db()

        self.assertEqual(request_obj.status, 'PENDING')
        self.assertEqual(request_obj.total_points, 50)
        self.assertEqual(request_obj.initial_remarks, 'updated remark')
        self.assertEqual(request_obj.items.count(), 2)
        self.assertEqual(RedemptionRequestItem.objects.get(request=request_obj, product=product_a).quantity, 2)
        self.assertFalse(RedemptionRequestItem.objects.filter(id=item_b.id).exists())
        self.assertEqual(product_a.committed_stock, 2)
        self.assertEqual(product_b.committed_stock, 0)
        self.assertEqual(product_c.committed_stock, 1)
        mock_publish.assert_called()

    @patch('requests.views.publish_sse_event')
    def test_auto_approved_unprocessed_request_can_change_deduction_source(self, mock_publish):
        product = self._create_product('P-D', 'Product D', 15, requires_sales_approval=False)

        created = self._create_request({
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': self.distributor.id,
            'points_deducted_from': 'SELF',
            'remarks': 'auto approved',
            'items': [
                {'product_id': product.id, 'quantity': 2, 'extra_data': {}},
            ],
        })

        request_obj = RedemptionRequest.objects.get(id=created['id'])
        self.assertEqual(request_obj.status, 'APPROVED')
        self.assertEqual(request_obj.processing_status, 'NOT_PROCESSED')

        agent_profile = UserProfile.objects.get(user=self.agent)
        distributor = Distributor.objects.get(id=self.distributor.id)
        self.assertEqual(agent_profile.points, 70)
        self.assertEqual(distributor.points, 200)

        self.client.force_login(self.agent)
        response = self.client.patch(
            self._detail_url(request_obj.id),
            data=json.dumps({
                'points_deducted_from': 'DISTRIBUTOR',
            }),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200, response.content.decode())
        request_obj.refresh_from_db()
        agent_profile.refresh_from_db()
        distributor.refresh_from_db()

        self.assertEqual(request_obj.status, 'APPROVED')
        self.assertEqual(request_obj.processing_status, 'NOT_PROCESSED')
        self.assertEqual(request_obj.points_deducted_from, 'DISTRIBUTOR')
        self.assertEqual(agent_profile.points, 100)
        self.assertEqual(distributor.points, 170)
        mock_publish.assert_called()

    def test_processed_request_rejects_edits(self):
        product = self._create_product('P-E', 'Product E', 12, requires_sales_approval=False)

        created = self._create_request({
            'requested_for_type': 'DISTRIBUTOR',
            'requested_for': self.distributor.id,
            'points_deducted_from': 'SELF',
            'remarks': 'processed request',
            'items': [
                {'product_id': product.id, 'quantity': 1, 'extra_data': {}},
            ],
        })

        request_obj = RedemptionRequest.objects.get(id=created['id'])
        request_obj.processing_status = 'PROCESSED'
        request_obj.save(update_fields=['processing_status'])

        self.client.force_login(self.agent)
        response = self.client.patch(
            self._detail_url(request_obj.id),
            data=json.dumps({'remarks': 'should fail'}),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('detail', response.json())
        request_obj.refresh_from_db()
        self.assertEqual(request_obj.processing_status, 'PROCESSED')


class RedemptionRequestArNumberTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.agent = self._create_user('agent', 'Sales Agent', points=100)
        self.customer = Customer.objects.create(
            name='Customer A',
            brand='Brand A',
            sales_channel='Retail',
        )

    def _create_user(self, username, position, points=100, can_self_request=False):
        user = User.objects.create_user(username=username, password='password123')
        UserProfile.objects.create(
            user=user,
            position=position,
            email=f'{username}@example.com',
            full_name=username.title(),
            points=points,
            can_self_request=can_self_request,
        )
        return user

    def _create_product(self, code, name, points):
        return Product.objects.create(
            item_code=code,
            item_name=name,
            legend='Giveaway',
            category='General',
            points=points,
            price=points,
            pricing_formula='NONE',
            has_stock=True,
            stock=20,
            committed_stock=0,
            requires_sales_approval=False,
        )

    def _create_processed_customer_request(self):
        product = self._create_product('AR-1', 'AR Product', 10)
        redemption_request = RedemptionRequest.objects.create(
            requested_by=self.agent,
            requested_for_type=RequestedForType.CUSTOMER,
            requested_for_customer=self.customer,
            points_deducted_from='SELF',
            total_points=10,
            status='APPROVED',
            processing_status=ProcessingStatus.PROCESSED,
            ar_status=AcknowledgementReceiptStatus.PENDING,
            requires_sales_approval=False,
            sales_approval_status='NOT_REQUIRED',
        )
        RedemptionRequestItem.objects.create(
            request=redemption_request,
            product=product,
            quantity=1,
            points_per_item=10,
            total_points=10,
        )
        return redemption_request

    def test_sales_agent_can_reserve_ar_number_once(self):
        request_obj = self._create_processed_customer_request()
        self.client.force_login(self.agent)

        response = self.client.post(
            f'/api/redemption-requests/{request_obj.id}/reserve_ar_number/',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200, response.content.decode())
        expected_ar_number = f'PRS-{request_obj.id:04d}'
        self.assertEqual(response.json()['ar_number'], expected_ar_number)

        request_obj.refresh_from_db()
        self.assertEqual(request_obj.ar_number, expected_ar_number)

        repeat_response = self.client.post(
            f'/api/redemption-requests/{request_obj.id}/reserve_ar_number/',
            content_type='application/json',
        )

        self.assertEqual(repeat_response.status_code, 200, repeat_response.content.decode())
        self.assertEqual(repeat_response.json()['ar_number'], expected_ar_number)

    def test_reserve_ar_number_rejects_unprocessed_request(self):
        request_obj = self._create_processed_customer_request()
        request_obj.processing_status = ProcessingStatus.NOT_PROCESSED
        request_obj.save(update_fields=['processing_status'])

        self.client.force_login(self.agent)
        response = self.client.post(
            f'/api/redemption-requests/{request_obj.id}/reserve_ar_number/',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400, response.content.decode())
        self.assertIn('error', response.json())
