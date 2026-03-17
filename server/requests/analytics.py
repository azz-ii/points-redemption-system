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


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 1. Enhanced Overview
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class AnalyticsOverviewView(APIView):
    """Extended overview stats including points totals and basic KPIs."""

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


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 2. Time-Series Trends
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class AnalyticsTimeSeriesView(APIView):
    """Request counts and points over time, grouped by day/week/month."""

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


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 3. Item Popularity
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class AnalyticsItemsView(APIView):
    """Most redeemed items by quantity and points."""

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


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 4. Agent Performance
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class AnalyticsAgentsView(APIView):
    """Per-agent request counts, approval rates, and points totals."""

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


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 5. Team Performance
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class AnalyticsTeamsView(APIView):
    """Per-team aggregate statistics."""

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


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 6. Turnaround Time
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class AnalyticsTurnaroundView(APIView):
    """Average processing turnaround times."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        try:
            start_date, _ = _parse_date_range(request)

            # Overall averages â€” only consider requests that have progressed
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


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 7a. Item Requests Detail (for export)
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class AnalyticsItemRequestsView(APIView):
    """Detailed request-level rows for a specific product (for export)."""

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


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 7b. Agent Requests Detail (for export)
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class AnalyticsAgentRequestsView(APIView):
    """Detailed request-level rows for a specific agent (for export)."""

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


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 8. Distributor / Customer Analytics
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class AnalyticsEntitiesView(APIView):
    """Top distributors or customers by redemption volume."""

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


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 9. Per-User Analytics (for ViewAccountModal)
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class UserAnalyticsView(APIView):
    """Per-user analytics stats, tailored by position (Sales Agent, Approver, Marketing)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from users.models import UserProfile
            from django.contrib.auth import get_user_model
            User = get_user_model()

            try:
                target_user = User.objects.select_related('profile').get(pk=user_id)
                profile = target_user.profile
            except (User.DoesNotExist, UserProfile.DoesNotExist):
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            position = profile.position

            if position == 'Sales Agent':
                return self._sales_agent_stats(target_user)
            elif position == 'Approver':
                return self._approver_stats(target_user)
            elif position == 'Handler':
                return self._marketing_stats(target_user)
            else:
                return Response({
                    'position': position,
                    'stats': None,
                    'recent_activity': [],
                })

        except Exception as e:
            logger.error(f"[Analytics] User stats error: {e}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch user analytics', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _user_name(self, user):
        if not user:
            return None
        profile = getattr(user, 'profile', None)
        if profile:
            return profile.full_name or user.username
        return user.username

    def _sales_agent_stats(self, user):
        qs = RedemptionRequest.objects.filter(requested_by=user)
        total = qs.count()

        agg = qs.aggregate(
            pending_count=Count('id', filter=Q(status='PENDING')),
            approved_count=Count('id', filter=Q(status='APPROVED')),
            rejected_count=Count('id', filter=Q(status='REJECTED')),
            withdrawn_count=Count('id', filter=Q(status='WITHDRAWN')),
            processed_count=Count('id', filter=Q(processing_status='PROCESSED')),
            cancelled_count=Count('id', filter=Q(processing_status='CANCELLED')),
            total_points_redeemed=Coalesce(Sum('total_points', filter=Q(status='APPROVED')), 0),
        )

        approval_rate = round((agg['approved_count'] / total) * 100, 1) if total > 0 else 0

        # Average turnaround: date_requested â†’ date_reviewed for reviewed requests
        reviewed_qs = qs.filter(date_reviewed__isnull=False)
        avg_turnaround = reviewed_qs.annotate(
            dur=ExpressionWrapper(
                F('date_reviewed') - F('date_requested'),
                output_field=DurationField(),
            )
        ).aggregate(avg=Avg('dur'))
        avg_hours = None
        if avg_turnaround['avg']:
            avg_hours = round(avg_turnaround['avg'].total_seconds() / 3600, 1)

        # Recent requests (up to 50 for client-side filtering)
        recent = (
            qs.select_related('requested_for', 'requested_for_customer', 'reviewed_by')
            .prefetch_related('items', 'items__product')
            .order_by('-date_requested')[:50]
        )
        recent_activity = []
        for req in recent:
            items_str = ', '.join(
                f"{ri.product.item_name} x{ri.quantity}" if ri.product else f"Item x{ri.quantity}"
                for ri in req.items.all()
            )
            recent_activity.append({
                'request_id': req.id,
                'date_requested': req.date_requested.isoformat() if req.date_requested else None,
                'requested_for': req.get_requested_for_name(),
                'items': items_str,
                'total_points': req.total_points,
                'status': req.status,
                'processing_status': req.processing_status,
            })

        return Response({
            'position': 'Sales Agent',
            'stats': {
                'total_requests': total,
                'pending_count': agg['pending_count'],
                'approved_count': agg['approved_count'],
                'rejected_count': agg['rejected_count'],
                'withdrawn_count': agg['withdrawn_count'],
                'processed_count': agg['processed_count'],
                'cancelled_count': agg['cancelled_count'],
                'approval_rate': approval_rate,
                'total_points_redeemed': agg['total_points_redeemed'],
                'avg_turnaround_hours': avg_hours,
            },
            'recent_activity': recent_activity,
        })

    def _approver_stats(self, user):
        # Requests this approver reviewed (approved or rejected)
        qs = RedemptionRequest.objects.filter(reviewed_by=user)
        total = qs.count()

        agg = qs.aggregate(
            approved_count=Count('id', filter=Q(status='APPROVED')),
            rejected_count=Count('id', filter=Q(status='REJECTED')),
        )

        approval_rate = round((agg['approved_count'] / total) * 100, 1) if total > 0 else 0

        # Average review time: date_requested â†’ date_reviewed
        avg_review = qs.filter(date_reviewed__isnull=False).annotate(
            dur=ExpressionWrapper(
                F('date_reviewed') - F('date_requested'),
                output_field=DurationField(),
            )
        ).aggregate(avg=Avg('dur'))
        avg_hours = None
        if avg_review['avg']:
            avg_hours = round(avg_review['avg'].total_seconds() / 3600, 1)

        # Also check sales approvals
        sales_qs = RedemptionRequest.objects.filter(sales_approved_by=user)
        sales_total = sales_qs.count()
        sales_agg = sales_qs.aggregate(
            sales_approved=Count('id', filter=Q(sales_approval_status='APPROVED')),
            sales_rejected=Count('id', filter=Q(sales_approval_status='REJECTED')),
        )

        # Recent reviewed requests (up to 50 for client-side filtering)
        recent = (
            qs.select_related('requested_by', 'requested_by__profile', 'requested_for', 'requested_for_customer')
            .order_by('-date_reviewed')[:50]
        )
        recent_activity = []
        for req in recent:
            recent_activity.append({
                'request_id': req.id,
                'date_reviewed': req.date_reviewed.isoformat() if req.date_reviewed else None,
                'requested_by': self._user_name(req.requested_by),
                'requested_for': req.get_requested_for_name(),
                'total_points': req.total_points,
                'status': req.status,
            })

        return Response({
            'position': 'Approver',
            'stats': {
                'total_reviewed': total,
                'approved_count': agg['approved_count'],
                'rejected_count': agg['rejected_count'],
                'approval_rate': approval_rate,
                'avg_review_hours': avg_hours,
                'sales_approvals_total': sales_total,
                'sales_approved_count': sales_agg['sales_approved'],
                'sales_rejected_count': sales_agg['sales_rejected'],
            },
            'recent_activity': recent_activity,
        })

    def _marketing_stats(self, user):
        # Items this marketing user has processed
        items_qs = RedemptionRequestItem.objects.filter(item_processed_by=user)
        total_items = items_qs.count()

        # Distinct requests touched
        requests_touched = items_qs.values('request').distinct().count()

        # Average processing time: request.date_reviewed â†’ item.item_processed_at
        avg_proc = items_qs.filter(
            item_processed_at__isnull=False,
            request__date_reviewed__isnull=False,
        ).annotate(
            dur=ExpressionWrapper(
                F('item_processed_at') - F('request__date_reviewed'),
                output_field=DurationField(),
            )
        ).aggregate(avg=Avg('dur'))
        avg_hours = None
        if avg_proc['avg']:
            avg_hours = round(avg_proc['avg'].total_seconds() / 3600, 1)

        # Requests where this user processed items â€” check processed vs cancelled
        touched_request_ids = items_qs.values_list('request_id', flat=True).distinct()
        touched_requests = RedemptionRequest.objects.filter(id__in=touched_request_ids)
        proc_agg = touched_requests.aggregate(
            processed_count=Count('id', filter=Q(processing_status='PROCESSED')),
            cancelled_count=Count('id', filter=Q(processing_status='CANCELLED')),
        )

        # Recent processed items (up to 50 for client-side filtering)
        recent_items = (
            items_qs.select_related('product', 'request', 'request__requested_by', 'request__requested_by__profile')
            .order_by('-item_processed_at')[:50]
        )
        recent_activity = []
        for ri in recent_items:
            recent_activity.append({
                'request_id': ri.request_id,
                'item_name': ri.product.item_name if ri.product else None,
                'quantity': ri.quantity,
                'total_points': ri.total_points,
                'processed_at': ri.item_processed_at.isoformat() if ri.item_processed_at else None,
                'requested_by': self._user_name(ri.request.requested_by),
                'processing_status': ri.request.processing_status,
            })

        return Response({
            'position': 'Handler',
            'stats': {
                'total_items_processed': total_items,
                'total_requests_touched': requests_touched,
                'processed_count': proc_agg['processed_count'],
                'cancelled_count': proc_agg['cancelled_count'],
                'avg_processing_hours': avg_hours,
            },
            'recent_activity': recent_activity,
        })


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class TeamAnalyticsView(APIView):
    """Per-team analytics: aggregate stats, member breakdown, top items, recent activity."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _check_admin(request):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        team_id = request.query_params.get('team_id')
        if not team_id:
            return Response({'error': 'team_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from teams.models import Team
            try:
                team = Team.objects.prefetch_related('memberships', 'memberships__user', 'memberships__user__profile').get(pk=team_id)
            except Team.DoesNotExist:
                return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

            qs = RedemptionRequest.objects.filter(team=team)
            total = qs.count()

            # â”€â”€ Aggregate stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            agg = qs.aggregate(
                pending_count=Count('id', filter=Q(status='PENDING')),
                approved_count=Count('id', filter=Q(status='APPROVED')),
                rejected_count=Count('id', filter=Q(status='REJECTED')),
                withdrawn_count=Count('id', filter=Q(status='WITHDRAWN')),
                processed_count=Count('id', filter=Q(processing_status='PROCESSED')),
                cancelled_count=Count('id', filter=Q(processing_status='CANCELLED')),
                total_points_redeemed=Coalesce(Sum('total_points', filter=Q(status='APPROVED')), 0),
            )

            reviewed_total = agg['approved_count'] + agg['rejected_count']
            approval_rate = round((agg['approved_count'] / reviewed_total) * 100, 1) if reviewed_total > 0 else 0

            # Avg turnaround: date_requested â†’ date_reviewed
            avg_turn = qs.filter(date_reviewed__isnull=False).annotate(
                dur=ExpressionWrapper(F('date_reviewed') - F('date_requested'), output_field=DurationField())
            ).aggregate(avg=Avg('dur'))
            avg_turnaround_hours = round(avg_turn['avg'].total_seconds() / 3600, 1) if avg_turn['avg'] else None

            # Avg processing: date_reviewed â†’ date_processed
            avg_proc = qs.filter(date_processed__isnull=False, date_reviewed__isnull=False).annotate(
                dur=ExpressionWrapper(F('date_processed') - F('date_reviewed'), output_field=DurationField())
            ).aggregate(avg=Avg('dur'))
            avg_processing_hours = round(avg_proc['avg'].total_seconds() / 3600, 1) if avg_proc['avg'] else None

            member_count = team.memberships.count()

            # â”€â”€ Top 5 items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            top_items_qs = (
                RedemptionRequestItem.objects
                .filter(request__team=team)
                .values('product__item_name', 'product__category')
                .annotate(
                    total_quantity=Sum('quantity'),
                    total_points=Sum('total_points'),
                )
                .order_by('-total_quantity')[:5]
            )
            top_items = [
                {
                    'product_name': row['product__item_name'] or 'Unknown',
                    'category': row['product__category'] or '',
                    'total_quantity': row['total_quantity'],
                    'total_points': row['total_points'],
                }
                for row in top_items_qs
            ]

            # â”€â”€ Member breakdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            member_breakdown = []
            for membership in team.memberships.select_related('user', 'user__profile').all():
                u = membership.user
                m_qs = qs.filter(requested_by=u)
                m_total = m_qs.count()
                m_agg = m_qs.aggregate(
                    approved_count=Count('id', filter=Q(status='APPROVED')),
                    rejected_count=Count('id', filter=Q(status='REJECTED')),
                    pending_count=Count('id', filter=Q(status='PENDING')),
                    total_points_redeemed=Coalesce(Sum('total_points', filter=Q(status='APPROVED')), 0),
                )
                m_reviewed = m_agg['approved_count'] + m_agg['rejected_count']
                m_approval = round((m_agg['approved_count'] / m_reviewed) * 100, 1) if m_reviewed > 0 else 0

                profile = getattr(u, 'profile', None)
                member_breakdown.append({
                    'user_id': u.id,
                    'full_name': profile.full_name if profile else u.username,
                    'total_requests': m_total,
                    'approved_count': m_agg['approved_count'],
                    'rejected_count': m_agg['rejected_count'],
                    'pending_count': m_agg['pending_count'],
                    'total_points_redeemed': m_agg['total_points_redeemed'],
                    'approval_rate': m_approval,
                })

            # Sort by total_requests descending
            member_breakdown.sort(key=lambda x: x['total_requests'], reverse=True)

            # â”€â”€ Recent activity (up to 50) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            recent = (
                qs.select_related(
                    'requested_by', 'requested_by__profile',
                    'requested_for', 'requested_for_customer',
                )
                .prefetch_related('items', 'items__product')
                .order_by('-date_requested')[:50]
            )
            recent_activity = []
            for req in recent:
                items_str = ', '.join(
                    f"{ri.product.item_name} x{ri.quantity}" if ri.product else f"Item x{ri.quantity}"
                    for ri in req.items.all()
                )
                by_profile = getattr(req.requested_by, 'profile', None) if req.requested_by else None
                recent_activity.append({
                    'request_id': req.id,
                    'requested_by': by_profile.full_name if by_profile else (req.requested_by.username if req.requested_by else None),
                    'date_requested': req.date_requested.isoformat() if req.date_requested else None,
                    'requested_for': req.get_requested_for_name(),
                    'items': items_str,
                    'total_points': req.total_points,
                    'status': req.status,
                    'processing_status': req.processing_status,
                })

            return Response({
                'stats': {
                    'total_requests': total,
                    'pending_count': agg['pending_count'],
                    'approved_count': agg['approved_count'],
                    'rejected_count': agg['rejected_count'],
                    'withdrawn_count': agg['withdrawn_count'],
                    'processed_count': agg['processed_count'],
                    'cancelled_count': agg['cancelled_count'],
                    'approval_rate': approval_rate,
                    'total_points_redeemed': agg['total_points_redeemed'],
                    'avg_turnaround_hours': avg_turnaround_hours,
                    'avg_processing_hours': avg_processing_hours,
                    'member_count': member_count,
                    'top_items': top_items,
                },
                'member_breakdown': member_breakdown,
                'recent_activity': recent_activity,
            })

        except Exception as e:
            logger.error(f"[Analytics] Team stats error: {e}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch team analytics', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
