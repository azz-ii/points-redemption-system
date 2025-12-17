from django.urls import path
from .views import RequestOTPView, VerifyOTPView, ResetPasswordWithOTPView

urlpatterns = [
    path('request-otp/', RequestOTPView.as_view(), name='request_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('reset-password/', ResetPasswordWithOTPView.as_view(), name='reset_password_otp'),
]
