from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, CustomerExportView, UnarchiveCustomerView

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customer')

urlpatterns = [
    path('api/customers/export/', CustomerExportView.as_view(), name='customer-export'),
    path('api/customers/<int:pk>/unarchive/', UnarchiveCustomerView.as_view(), name='customer-unarchive'),
    path('api/', include(router.urls)),
]
