from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CurrentUserView, UserExportView, BulkUpdatePointsView, BatchUpdatePointsView, UnarchiveUserView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('api/users/me/', CurrentUserView.as_view(), name='current_user'),
    path('api/users/export/', UserExportView.as_view(), name='user-export'),
    path('api/users/bulk_update_points/', BulkUpdatePointsView.as_view(), name='user-bulk-update-points'),
    path('api/users/batch_update_points/', BatchUpdatePointsView.as_view(), name='user-batch-update-points'),
    path('api/users/<int:pk>/unarchive/', UnarchiveUserView.as_view(), name='user-unarchive'),
    path('api/', include(router.urls)),
]
