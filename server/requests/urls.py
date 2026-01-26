from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RedemptionRequestViewSet, 
    DashboardStatsView, 
    DashboardRedemptionRequestsView, 
    ResetAllPointsView,
    AgentDashboardStatsView,
    ProcessedRequestHistoryView,
    MarketingHistoryView
)

router = DefaultRouter()
router.register(r'redemption-requests', RedemptionRequestViewSet, basename='redemption-request')

urlpatterns = [
    path('redemption-requests/history/', ProcessedRequestHistoryView.as_view(), name='processed-request-history'),
    path('redemption-requests/marketing-history/', MarketingHistoryView.as_view(), name='marketing-history'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/redemption-requests/', DashboardRedemptionRequestsView.as_view(), name='dashboard-redemption-requests'),
    path('dashboard/reset-all-points/', ResetAllPointsView.as_view(), name='dashboard-reset-all-points'),
    path('agent/dashboard/stats/', AgentDashboardStatsView.as_view(), name='agent-dashboard-stats'),
    path('', include(router.urls)),
]
