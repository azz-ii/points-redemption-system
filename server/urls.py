from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from .views import LoginView, DashboardView, HistoryView, AccountsView, ApproveRequestView, RejectRequestView, ChangePasswordView
from server.users.views import UserListCreateView, UserDetailView
from server.items_catalogue.views import CatalogueItemListCreateView, CatalogueItemDetailView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', LoginView.as_view(), name='login'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('history/', HistoryView.as_view(), name='history'),
    path('accounts/', AccountsView.as_view(), name='accounts'),
    path('requests/<str:request_id>/approve/', ApproveRequestView.as_view(), name='approve_request'),
    path('requests/<str:request_id>/reject/', RejectRequestView.as_view(), name='reject_request'),
    # User Management API
    path('api/users/', UserListCreateView.as_view(), name='user_list_create'),
    path('api/users/<int:user_id>/', UserDetailView.as_view(), name='user_detail'),
    # Catalogue Management API
    path('api/catalogue/', CatalogueItemListCreateView.as_view(), name='catalogue_list_create'),
    path('api/catalogue/<int:item_id>/', CatalogueItemDetailView.as_view(), name='catalogue_detail'),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

