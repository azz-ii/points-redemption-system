from django.urls import path
from .views import PointsAuditLogListView

urlpatterns = [
    path('', PointsAuditLogListView.as_view(), name='points_audit_list'),
]
