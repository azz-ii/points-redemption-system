from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DistributorViewSet, 
    DistributorExportView, 
    DistributorBulkUpdatePointsView, 
    DistributorBatchUpdatePointsView,
    UnarchiveDistributorView,
    SalesVolumeTiersView,
    DistributorAllocateSalesVolumeView,
)

router = DefaultRouter()
router.register(r'distributors', DistributorViewSet, basename='distributor')

urlpatterns = [
    path('api/distributors/export/', DistributorExportView.as_view(), name='distributor-export'),
    path('api/distributors/bulk_update_points/', DistributorBulkUpdatePointsView.as_view(), name='distributor-bulk-update-points'),
    path('api/distributors/batch_update_points/', DistributorBatchUpdatePointsView.as_view(), name='distributor-batch-update-points'),
    path('api/distributors/<int:pk>/unarchive/', UnarchiveDistributorView.as_view(), name='distributor-unarchive'),
    path('api/distributors/sales-volume-tiers/', SalesVolumeTiersView.as_view(), name='distributor-sales-volume-tiers'),
    path('api/distributors/allocate-sales-volume/', DistributorAllocateSalesVolumeView.as_view(), name='distributor-allocate-sales-volume'),
    path('api/', include(router.urls)),
]