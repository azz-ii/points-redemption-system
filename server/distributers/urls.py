from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DistributorViewSet, 
    DistributorExportView, 
    DistributorBulkUpdatePointsView, 
    DistributorBatchUpdatePointsView,
    UnarchiveDistributorView
)

router = DefaultRouter()
router.register(r'distributors', DistributorViewSet, basename='distributor')

urlpatterns = [
    path('api/distributors/export/', DistributorExportView.as_view(), name='distributor-export'),
    path('api/distributors/bulk_update_points/', DistributorBulkUpdatePointsView.as_view(), name='distributor-bulk-update-points'),
    path('api/distributors/batch_update_points/', DistributorBatchUpdatePointsView.as_view(), name='distributor-batch-update-points'),
    path('api/distributors/<int:pk>/unarchive/', UnarchiveDistributorView.as_view(), name='distributor-unarchive'),
    path('api/', include(router.urls)),
]