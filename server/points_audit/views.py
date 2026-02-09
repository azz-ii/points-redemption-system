from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import PointsAuditLog
from .serializers import PointsAuditLogSerializer


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


@method_decorator(csrf_exempt, name='dispatch')
class PointsAuditLogListView(APIView):
    """List points audit logs with filtering and pagination."""
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = []

    def get(self, request):
        # Check authentication
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Build queryset with filters
        queryset = PointsAuditLog.objects.select_related('changed_by', 'changed_by__profile').all()

        # Filter by entity_type
        entity_type = request.query_params.get('entity_type')
        if entity_type:
            queryset = queryset.filter(entity_type=entity_type.upper())

        # Filter by entity_id
        entity_id = request.query_params.get('entity_id')
        if entity_id:
            queryset = queryset.filter(entity_id=int(entity_id))

        # Filter by action_type
        action_type = request.query_params.get('action_type')
        if action_type:
            queryset = queryset.filter(action_type=action_type.upper())

        # Filter by changed_by user ID
        changed_by = request.query_params.get('changed_by')
        if changed_by:
            queryset = queryset.filter(changed_by_id=int(changed_by))

        # Filter by batch_id
        batch_id = request.query_params.get('batch_id')
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)

        # Search in entity_name and reason
        search = request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(entity_name__icontains=search) | Q(reason__icontains=search)
            )

        # Date range filtering
        date_from = request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        page_size = min(page_size, 100)  # Cap at 100

        total_count = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size

        logs = queryset[start:end]
        serializer = PointsAuditLogSerializer(logs, many=True)

        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'results': serializer.data,
        }, status=status.HTTP_200_OK)
