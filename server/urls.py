from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from .views import LoginView, DashboardView, HistoryView, AccountsView, ApproveRequestView, RejectRequestView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', LoginView.as_view(), name='login'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('history/', HistoryView.as_view(), name='history'),
    path('accounts/', AccountsView.as_view(), name='accounts'),
    path('requests/<str:request_id>/approve/', ApproveRequestView.as_view(), name='approve_request'),
    path('requests/<str:request_id>/reject/', RejectRequestView.as_view(), name='reject_request'),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

