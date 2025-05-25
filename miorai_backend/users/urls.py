from django.urls import path
from knox import views as knox_views
from .views import (
    RegisterAPI, LoginAPI, LogoutAPI, UserAPI,
    ChangePasswordAPI, ResetPasswordEmailAPI,
    ResetPasswordConfirmAPI, VerifyEmailAPI
)

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', LogoutAPI.as_view(), name='logout'),
    path('user/', UserAPI.as_view(), name='user'),
    path('change-password/', ChangePasswordAPI.as_view(), name='change-password'),
    path('reset-password/', ResetPasswordEmailAPI.as_view(), name='reset-password'),
    path('reset-password/confirm/', ResetPasswordConfirmAPI.as_view(), name='reset-password-confirm'),
    path('verify-email/', VerifyEmailAPI.as_view(), name='verify-email'),
] 