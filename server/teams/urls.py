from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, TeamMembershipViewSet

router = DefaultRouter()
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'memberships', TeamMembershipViewSet, basename='teammembership')

urlpatterns = router.urls
