from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RedemptionRequestViewSet, 
    DashboardStatsView, 
    DashboardRedemptionRequestsView, 
    ResetAllPointsView,
    AgentDashboardStatsView,
    ApproverDashboardStatsView,
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
    AnalyticsItemRequestsView,
    AnalyticsAgentRequestsView,
    UserAnalyticsView,
    TeamAnalyticsView,
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
    path('approver/dashboard/stats/', ApproverDashboardStatsView.as_view(), name='approver-dashboard-stats'),
    # Analytics endpoints
    path('dashboard/analytics/overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
    path('dashboard/analytics/time-series/', AnalyticsTimeSeriesView.as_view(), name='analytics-time-series'),
    path('dashboard/analytics/items/', AnalyticsItemsView.as_view(), name='analytics-items'),
    path('dashboard/analytics/agents/', AnalyticsAgentsView.as_view(), name='analytics-agents'),
    path('dashboard/analytics/teams/', AnalyticsTeamsView.as_view(), name='analytics-teams'),
    path('dashboard/analytics/turnaround/', AnalyticsTurnaroundView.as_view(), name='analytics-turnaround'),
    path('dashboard/analytics/entities/', AnalyticsEntitiesView.as_view(), name='analytics-entities'),
    path('dashboard/analytics/item-requests/', AnalyticsItemRequestsView.as_view(), name='analytics-item-requests'),
    path('dashboard/analytics/agent-requests/', AnalyticsAgentRequestsView.as_view(), name='analytics-agent-requests'),
    path('dashboard/analytics/user-stats/', UserAnalyticsView.as_view(), name='analytics-user-stats'),
    path('dashboard/analytics/team-stats/', TeamAnalyticsView.as_view(), name='analytics-team-stats'),
    path('', include(router.urls)),
]
