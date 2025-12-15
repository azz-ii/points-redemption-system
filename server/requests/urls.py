from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RedemptionRequestViewSet

router = DefaultRouter()
router.register(r'redemption-requests', RedemptionRequestViewSet, basename='redemption-request')

urlpatterns = [
    path('', include(router.urls)),
]
