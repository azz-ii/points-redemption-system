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
from .analytics import (
    AnalyticsOverviewView,
    AnalyticsTimeSeriesView,
    AnalyticsItemsView,
    AnalyticsAgentsView,
    AnalyticsTeamsView,
    AnalyticsTurnaroundView,
    AnalyticsEntitiesView,
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
    # Analytics endpoints
    path('dashboard/analytics/overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
    path('dashboard/analytics/time-series/', AnalyticsTimeSeriesView.as_view(), name='analytics-time-series'),
    path('dashboard/analytics/items/', AnalyticsItemsView.as_view(), name='analytics-items'),
    path('dashboard/analytics/agents/', AnalyticsAgentsView.as_view(), name='analytics-agents'),
    path('dashboard/analytics/teams/', AnalyticsTeamsView.as_view(), name='analytics-teams'),
    path('dashboard/analytics/turnaround/', AnalyticsTurnaroundView.as_view(), name='analytics-turnaround'),
    path('dashboard/analytics/entities/', AnalyticsEntitiesView.as_view(), name='analytics-entities'),
    path('', include(router.urls)),
]
