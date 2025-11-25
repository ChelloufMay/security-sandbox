# backend/accounts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("verify-email/", views.VerifyEmailView.as_view(), name="verify-email"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("inbox/", views.InboxListView.as_view(), name="inbox"),
    path("sms/send/", views.SendSMSView.as_view(), name="send-sms"),
    path("sms/verify/", views.VerifySMSView.as_view(), name="verify-sms"),
    path("totp/setup/", views.TOTPSetupView.as_view(), name="totp-setup"),
    path("totp/verify/", views.TOTPVerifyView.as_view(), name="totp-verify"),
    path("password/hash-info/", views.PasswordHashInfoView.as_view(), name="password-hash-info"),
    path("role/request/", views.RoleRequestView.as_view(), name="role-request"),
    path("role/approve/", views.RoleApproveView.as_view(), name="role-approve"),
    path("logs/", views.LogsListView.as_view(), name="logs"),
]
