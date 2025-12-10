"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from server.views import LoginView, DashboardView, HistoryView, AccountsView, ApproveRequestView, RejectRequestView, ChangePasswordView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', LoginView.as_view(), name='login'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('history/', HistoryView.as_view(), name='history'),
    path('accounts/', AccountsView.as_view(), name='accounts'),
    path('requests/<str:request_id>/approve/', ApproveRequestView.as_view(), name='approve_request'),
    path('requests/<str:request_id>/reject/', RejectRequestView.as_view(), name='reject_request'),
]
