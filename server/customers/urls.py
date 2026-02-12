from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, CustomerExportView, CustomerBulkUpdatePointsView, CustomerBatchUpdatePointsView, UnarchiveCustomerView

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')

urlpatterns = [
    path('api/customers/export/', CustomerExportView.as_view(), name='customer-export'),
    path('api/customers/bulk_update_points/', CustomerBulkUpdatePointsView.as_view(), name='customer-bulk-update-points'),
    path('api/customers/batch_update_points/', CustomerBatchUpdatePointsView.as_view(), name='customer-batch-update-points'),
    path('api/customers/<int:pk>/unarchive/', UnarchiveCustomerView.as_view(), name='customer-unarchive'),
    path('api/', include(router.urls)),
]
