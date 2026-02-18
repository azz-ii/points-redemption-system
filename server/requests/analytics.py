"""
Analytics views for the SuperAdmin dashboard.
Provides aggregated data for reports: time-series, item popularity,
agent performance, team performance, turnaround times, and entity analytics.
"""
import logging
from datetime import timedelta
from django.utils import timezone
from django.db.models import (
    Count, Sum, Avg, F, Q, Value, CharField,
    ExpressionWrapper, DurationField, FloatField,
)
from django.db.models.functions import (
    TruncDay, TruncWeek, TruncMonth, Coalesce, Cast,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import RedemptionRequest, RedemptionRequestItem
from .views import CsrfExemptSessionAuthentication

logger = logging.getLogger('analytics')


def _check_admin(request):
    """Return True if user is Admin, else False."""
    profile = getattr(request.user, 'profile', None)
    if profile and profile.position != 'Admin':
        return False
    return True


def _parse_date_range(request):
    """
    Parse 'range' query param and return a (start_date, end_date) tuple.
    Supported values: 7, 30, 90, 365, 'all'.
    Defaults to 30 days.
    """
    range_param = request.query_params.get('range', '30')
    end_date = timezone.now()

    if range_param == 'all':
        start_date = None
    else:
        try:
            days = int(range_param)
        except (ValueError, TypeError):
            days = 30
        start_date = end_date - timedelta(days=days)

    logger.debug(f"[Analytics] Date range parsed: range={range_param}, start={start_date}, end={end_date}")
    return start_date, end_date


def _base_qs(start_date):
    """Return a base queryset filtered by start_date if provided."""
    qs = RedemptionRequest.objects.all()
    if start_date:
        qs = qs.filter(date_requested__gte=start_date)
    return qs


# ──────────────────────────────────────────────
# 1. Enhanced Overview
# ──────────────────────────────────────────────
class AnalyticsOverviewView(APIView):
    """Extended overview stats including points totals and basic KPIs."""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            start_date, _ = _parse_date_range(request)
            qs = _base_qs(start_date)

            stats = qs.aggregate(
                total_requests=Count('id'),
                pending_count=Count('id', filter=Q(status='PENDING')),
                approved_count=Count('id', filter=Q(status='APPROVED')),
                rejected_count=Count('id', filter=Q(status='REJECTED')),
                withdrawn_count=Count('id', filter=Q(status='WITHDRAWN')),
                processed_count=Count('id', filter=Q(processing_status='PROCESSED')),
                not_processed_count=Count('id', filter=Q(processing_status='NOT_PROCESSED')),
                cancelled_count=Count('id', filter=Q(processing_status='CANCELLED')),
                total_points_redeemed=Coalesce(
                    Sum('total_points', filter=Q(status='APPROVED')), 0
                ),
            )

            from distributers.models import Distributor
            from customers.models import Customer

            stats['on_board_count'] = Distributor.objects.filter(is_archived=False).count()
            stats['customers_count'] = Customer.objects.filter(is_archived=False).count()

            logger.debug(f"[Analytics] Overview stats: {stats}")
            return Response(stats)

        except Exception as e:
            logger.error(f"[Analytics] Overview error: {e}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch overview stats', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# 2. Time-Series Trends
# ──────────────────────────────────────────────
class AnalyticsTimeSeriesView(APIView):
    """Request counts and points over time, grouped by day/week/month."""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            start_date, _ = _parse_date_range(request)
            period = request.query_params.get('period', 'auto')
            qs = _base_qs(start_date)

            # Auto-select granularity
            if period == 'auto':
                range_param = request.query_params.get('range', '30')
                if range_param == 'all':
                    trunc_fn = TruncMonth
                else:
                    days = int(range_param) if range_param.isdigit() else 30
                    if days <= 30:
                        trunc_fn = TruncDay
                    elif days <= 90:
                        trunc_fn = TruncWeek
                    else:
                        trunc_fn = TruncMonth
            else:
                trunc_fn = {'daily': TruncDay, 'weekly': TruncWeek, 'monthly': TruncMonth}.get(period, TruncDay)

            data = (
                qs.annotate(period=trunc_fn('date_requested'))
                .values('period')
                .annotate(
                    request_count=Count('id'),
                    points_redeemed=Coalesce(Sum('total_points', filter=Q(status='APPROVED')), 0),
                    approved_count=Count('id', filter=Q(status='APPROVED')),
                    rejected_count=Count('id', filter=Q(status='REJECTED')),
                )
                .order_by('period')
            )

            result = [
                {
                    'date': entry['period'].isoformat() if entry['period'] else None,
                    'request_count': entry['request_count'],
                    'points_redeemed': entry['points_redeemed'],
                    'approved_count': entry['approved_count'],
                    'rejected_count': entry['rejected_count'],
                }
                for entry in data
            ]

            logger.debug(f"[Analytics] Time-series returned {len(result)} data points")
            return Response(result)

        except Exception as e:
            logger.error(f"[Analytics] Time-series error: {e}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch time-series data', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# 3. Item Popularity
# ──────────────────────────────────────────────
class AnalyticsItemsView(APIView):
    """Most redeemed items by quantity and points."""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            start_date, _ = _parse_date_range(request)
            limit = min(int(request.query_params.get('limit', 10)), 50)

            items_qs = RedemptionRequestItem.objects.filter(
                request__status='APPROVED',
            )
            if start_date:
                items_qs = items_qs.filter(request__date_requested__gte=start_date)

            data = (
                items_qs
                .values(
                    'product__id',
                    'product__item_code',
                    'product__item_name',
                    'product__legend',
                    'product__category',
                )
                .annotate(
                    total_quantity=Sum('quantity'),
                    total_points=Sum('total_points'),
                    request_count=Count('request', distinct=True),
                )
                .order_by('-total_quantity')[:limit]
            )

            result = [
                {
                    'product_id': entry['product__id'],
                    'item_code': entry['product__item_code'],
                    'item_name': entry['product__item_name'],
                    'legend': entry['product__legend'],
                    'category': entry['product__category'],
                    'total_quantity': entry['total_quantity'],
                    'total_points': entry['total_points'],
                    'request_count': entry['request_count'],
                }
                for entry in data
            ]

            logger.debug(f"[Analytics] Items popularity returned {len(result)} items")
            return Response(result)

        except Exception as e:
            logger.error(f"[Analytics] Items error: {e}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch item analytics', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# 4. Agent Performance
# ──────────────────────────────────────────────
class AnalyticsAgentsView(APIView):
    """Per-agent request counts, approval rates, and points totals."""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            start_date, _ = _parse_date_range(request)
            limit = min(int(request.query_params.get('limit', 10)), 50)
            qs = _base_qs(start_date)

            data = (
                qs.values('requested_by')
                .annotate(
                    total_requests=Count('id'),
                    approved_count=Count('id', filter=Q(status='APPROVED')),
                    rejected_count=Count('id', filter=Q(status='REJECTED')),
                    withdrawn_count=Count('id', filter=Q(status='WITHDRAWN')),
                    processed_count=Count('id', filter=Q(processing_status='PROCESSED')),
                    total_points=Coalesce(Sum('total_points', filter=Q(status='APPROVED')), 0),
                )
                .order_by('-total_requests')[:limit]
            )

            # Fetch user names
            from django.contrib.auth import get_user_model
            from users.models import UserProfile
            User = get_user_model()

            result = []
            for entry in data:
                user_id = entry['requested_by']
                try:
                    profile = UserProfile.objects.get(user_id=user_id)
                    agent_name = profile.full_name or profile.user.username
                    team_name = None
                    from teams.models import TeamMembership
                    membership = TeamMembership.objects.filter(user_id=user_id).select_related('team').first()
                    if membership:
                        team_name = membership.team.name
                except UserProfile.DoesNotExist:
                    agent_name = f'User #{user_id}'
                    team_name = None

                total = entry['total_requests']
                approved = entry['approved_count']
                approval_rate = round((approved / total) * 100, 1) if total > 0 else 0

                result.append({
                    'agent_id': user_id,
                    'agent_name': agent_name,
                    'team_name': team_name,
                    'total_requests': total,
                    'approved_count': approved,
                    'rejected_count': entry['rejected_count'],
                    'withdrawn_count': entry['withdrawn_count'],
                    'processed_count': entry['processed_count'],
                    'total_points': entry['total_points'],
                    'approval_rate': approval_rate,
                })

            logger.debug(f"[Analytics] Agent performance returned {len(result)} agents")
            return Response(result)

        except Exception as e:
            logger.error(f"[Analytics] Agent error: {e}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch agent analytics', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# 5. Team Performance
# ──────────────────────────────────────────────
class AnalyticsTeamsView(APIView):
    """Per-team aggregate statistics."""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            start_date, _ = _parse_date_range(request)
            qs = _base_qs(start_date).filter(team__isnull=False)

            data = (
                qs.values('team', 'team__name')
                .annotate(
                    total_requests=Count('id'),
                    approved_count=Count('id', filter=Q(status='APPROVED')),
                    rejected_count=Count('id', filter=Q(status='REJECTED')),
                    processed_count=Count('id', filter=Q(processing_status='PROCESSED')),
                    total_points=Coalesce(Sum('total_points', filter=Q(status='APPROVED')), 0),
                )
                .order_by('-total_requests')
            )

            result = []
            for entry in data:
                total = entry['total_requests']
                approved = entry['approved_count']
                approval_rate = round((approved / total) * 100, 1) if total > 0 else 0

                result.append({
                    'team_id': entry['team'],
                    'team_name': entry['team__name'],
                    'total_requests': total,
                    'approved_count': approved,
                    'rejected_count': entry['rejected_count'],
                    'processed_count': entry['processed_count'],
                    'total_points': entry['total_points'],
                    'approval_rate': approval_rate,
                })

            logger.debug(f"[Analytics] Team performance returned {len(result)} teams")
            return Response(result)

        except Exception as e:
            logger.error(f"[Analytics] Team error: {e}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch team analytics', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# 6. Turnaround Time
# ──────────────────────────────────────────────
class AnalyticsTurnaroundView(APIView):
    """Average processing turnaround times."""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            start_date, _ = _parse_date_range(request)

            # Overall averages — only consider requests that have progressed
            qs_reviewed = _base_qs(start_date).filter(
                date_reviewed__isnull=False,
            )
            qs_processed = _base_qs(start_date).filter(
                date_processed__isnull=False,
            )

            review_avg = qs_reviewed.annotate(
                dur=ExpressionWrapper(
                    F('date_reviewed') - F('date_requested'),
                    output_field=DurationField(),
                )
            ).aggregate(avg_review=Avg('dur'))

            process_avg = qs_processed.annotate(
                dur=ExpressionWrapper(
                    F('date_processed') - F('date_reviewed'),
                    output_field=DurationField(),
                )
            ).aggregate(avg_process=Avg('dur'))

            total_avg = qs_processed.annotate(
                dur=ExpressionWrapper(
                    F('date_processed') - F('date_requested'),
                    output_field=DurationField(),
                )
            ).aggregate(avg_total=Avg('dur'))

            def td_to_hours(td):
                if td is None:
                    return None
                return round(td.total_seconds() / 3600, 1)

            overall = {
                'avg_request_to_review_hours': td_to_hours(review_avg['avg_review']),
                'avg_review_to_process_hours': td_to_hours(process_avg['avg_process']),
                'avg_total_hours': td_to_hours(total_avg['avg_total']),
            }

            # Monthly trend
            monthly_data = (
                qs_processed
                .annotate(
                    month=TruncMonth('date_requested'),
                    total_dur=ExpressionWrapper(
                        F('date_processed') - F('date_requested'),
                        output_field=DurationField(),
                    ),
                )
                .values('month')
                .annotate(avg_total_dur=Avg('total_dur'), count=Count('id'))
                .order_by('month')
            )

            trend = [
                {
                    'month': entry['month'].isoformat() if entry['month'] else None,
                    'avg_total_hours': td_to_hours(entry['avg_total_dur']),
                    'count': entry['count'],
                }
                for entry in monthly_data
            ]

            logger.debug(f"[Analytics] Turnaround: overall={overall}, trend_points={len(trend)}")
            return Response({'overall': overall, 'trend': trend})

        except Exception as e:
            logger.error(f"[Analytics] Turnaround error: {e}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch turnaround analytics', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# 7a. Item Requests Detail (for export)
# ──────────────────────────────────────────────
class AnalyticsItemRequestsView(APIView):
    """Detailed request-level rows for a specific product (for export)."""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            product_id = request.query_params.get('product_id')
            if not product_id:
                return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            start_date, _ = _parse_date_range(request)

            items_qs = RedemptionRequestItem.objects.filter(
                product_id=product_id,
                request__status='APPROVED',
            ).select_related(
                'request', 'request__requested_by', 'product',
                'request__requested_for', 'request__requested_for_customer',
                'request__team', 'request__reviewed_by', 'request__processed_by',
            )
            if start_date:
                items_qs = items_qs.filter(request__date_requested__gte=start_date)

            items_qs = items_qs.order_by('-request__date_requested')[:500]

            from users.models import UserProfile

            def _user_name(user):
                if not user:
                    return None
                profile = getattr(user, 'profile', None)
                if profile:
                    return profile.full_name or user.username
                return user.username

            result = []
            for ri in items_qs:
                req = ri.request
                result.append({
                    'request_id': req.id,
                    'date_requested': req.date_requested.isoformat() if req.date_requested else None,
                    'agent': _user_name(req.requested_by),
                    'team': req.team.name if req.team else None,
                    'requested_for': req.get_requested_for_name(),
                    'requested_for_type': req.requested_for_type,
                    'item_name': ri.product.item_name if ri.product else None,
                    'item_code': ri.product.item_code if ri.product else None,
                    'quantity': ri.quantity,
                    'points': ri.total_points,
                    'status': req.status,
                    'processing_status': req.processing_status,
                    'reviewed_by': _user_name(req.reviewed_by),
                    'date_reviewed': req.date_reviewed.isoformat() if req.date_reviewed else None,
                    'processed_by': _user_name(req.processed_by),
                    'date_processed': req.date_processed.isoformat() if req.date_processed else None,
                    'remarks': req.remarks or '',
                })

            logger.debug(f"[Analytics] Item requests export: product_id={product_id}, rows={len(result)}")
            return Response(result)

        except Exception as e:
            logger.error(f"[Analytics] Item requests export error: {e}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch item request details', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# 7b. Agent Requests Detail (for export)
# ──────────────────────────────────────────────
class AnalyticsAgentRequestsView(APIView):
    """Detailed request-level rows for a specific agent (for export)."""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            agent_id = request.query_params.get('agent_id')
            if not agent_id:
                return Response({'error': 'agent_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            start_date, _ = _parse_date_range(request)

            qs = _base_qs(start_date).filter(
                requested_by_id=agent_id,
            ).select_related(
                'requested_by', 'requested_for', 'requested_for_customer',
                'team', 'reviewed_by', 'processed_by',
            ).prefetch_related('items', 'items__product').order_by('-date_requested')[:500]

            from users.models import UserProfile

            def _user_name(user):
                if not user:
                    return None
                profile = getattr(user, 'profile', None)
                if profile:
                    return profile.full_name or user.username
                return user.username

            result = []
            for req in qs:
                items_str = ', '.join(
                    f"{ri.product.item_name} x{ri.quantity}" if ri.product else f"Item x{ri.quantity}"
                    for ri in req.items.all()
                )
                result.append({
                    'request_id': req.id,
                    'date_requested': req.date_requested.isoformat() if req.date_requested else None,
                    'requested_for': req.get_requested_for_name(),
                    'requested_for_type': req.requested_for_type,
                    'items': items_str,
                    'total_points': req.total_points,
                    'status': req.status,
                    'processing_status': req.processing_status,
                    'reviewed_by': _user_name(req.reviewed_by),
                    'date_reviewed': req.date_reviewed.isoformat() if req.date_reviewed else None,
                    'processed_by': _user_name(req.processed_by),
                    'date_processed': req.date_processed.isoformat() if req.date_processed else None,
                    'remarks': req.remarks or '',
                    'rejection_reason': req.rejection_reason or '',
                })

            logger.debug(f"[Analytics] Agent requests export: agent_id={agent_id}, rows={len(result)}")
            return Response(result)

        except Exception as e:
            logger.error(f"[Analytics] Agent requests export error: {e}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch agent request details', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ──────────────────────────────────────────────
# 8. Distributor / Customer Analytics
# ──────────────────────────────────────────────
class AnalyticsEntitiesView(APIView):
    """Top distributors or customers by redemption volume."""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            start_date, _ = _parse_date_range(request)
            entity_type = request.query_params.get('type', 'distributor')
            limit = min(int(request.query_params.get('limit', 10)), 50)

            qs = _base_qs(start_date).filter(status='APPROVED')

            if entity_type == 'customer':
                data = (
                    qs.filter(requested_for_customer__isnull=False)
                    .values('requested_for_customer', 'requested_for_customer__name')
                    .annotate(
                        request_count=Count('id'),
                        total_points=Sum('total_points'),
                        processed_count=Count('id', filter=Q(processing_status='PROCESSED')),
                    )
                    .order_by('-total_points')[:limit]
                )
                result = [
                    {
                        'entity_id': e['requested_for_customer'],
                        'entity_name': e['requested_for_customer__name'],
                        'entity_type': 'customer',
                        'request_count': e['request_count'],
                        'total_points': e['total_points'],
                        'processed_count': e['processed_count'],
                    }
                    for e in data
                ]
            else:
                data = (
                    qs.filter(requested_for__isnull=False)
                    .values('requested_for', 'requested_for__name')
                    .annotate(
                        request_count=Count('id'),
                        total_points=Sum('total_points'),
                        processed_count=Count('id', filter=Q(processing_status='PROCESSED')),
                    )
                    .order_by('-total_points')[:limit]
                )
                result = [
                    {
                        'entity_id': e['requested_for'],
                        'entity_name': e['requested_for__name'],
                        'entity_type': 'distributor',
                        'request_count': e['request_count'],
                        'total_points': e['total_points'],
                        'processed_count': e['processed_count'],
                    }
                    for e in data
                ]

            logger.debug(f"[Analytics] Entities ({entity_type}) returned {len(result)} entries")
            return Response(result)

        except Exception as e:
            logger.error(f"[Analytics] Entities error: {e}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch entity analytics', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
