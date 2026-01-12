from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RedemptionRequestViewSet, DashboardStatsView, DashboardRedemptionRequestsView, ResetAllPointsView

router = DefaultRouter()
router.register(r'redemption-requests', RedemptionRequestViewSet, basename='redemption-request')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/redemption-requests/', DashboardRedemptionRequestsView.as_view(), name='dashboard-redemption-requests'),
    path('dashboard/reset-all-points/', ResetAllPointsView.as_view(), name='dashboard-reset-all-points'),
]
