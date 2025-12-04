from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from .views import LoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', LoginView.as_view(), name='login'),

    # Redirect root URL to login page
    path('', RedirectView.as_view(pattern_name='login', permanent=False)),

    # PWA URLs (keep if you still need them)
    path('', include('pwa.urls')),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
