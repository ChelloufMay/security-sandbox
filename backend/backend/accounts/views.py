# backend/accounts/views.py
import secrets
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import authenticate, login as django_login, logout as django_logout, get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404

from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

import pyotp
from argon2 import PasswordHasher

from .models import VerificationToken, InboxMessage, Profile, RoleRequest, LogEvent
from .serializers import RegisterSerializer, LoginSerializer, InboxSerializer, RoleRequestSerializer, LogEventSerializer

User = get_user_model()
PH = PasswordHasher()

def log_event(user, event_type, payload=None):
    LogEvent.objects.create(user=user if user and getattr(user, 'is_authenticated', False) else None,
                            event_type=event_type,
                            payload=payload or {})

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        email = s.validated_data['email']
        username = s.validated_data['username']
        password = s.validated_data['password']
        if User.objects.filter(username=username).exists():
            return Response({"error":"username_taken"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, email=email, password=password, is_active=True)
        # ensure profile exists
        Profile.objects.get_or_create(user=user)

        # create verification token (6-digit)
        token = f"{secrets.randbelow(10**6):06d}"
        token_hash = VerificationToken.hash_token(token)
        expires = timezone.now() + timedelta(minutes=20)
        vt = VerificationToken.objects.create(user=user, token_hash=token_hash, type='email', expires_at=expires)

        # send mail via Django (MailHog will capture it)
        subject = "Security Sandbox - Verify your email"
        body = f"Hello {username},\n\nYour verification code is: {token}\nIt expires at {expires} (UTC).\n\nThis app is local/demo only."
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False)

        # also store message in simulated inbox (so frontend can show)
        InboxMessage.objects.create(to=email, type='email', subject=subject, body=body)

        log_event(user, "register", {"username": username})

        return Response({"detail": "verification_sent"}, status=status.HTTP_201_CREATED)

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        username = request.data.get('username')
        token = request.data.get('token')
        if not username or not token:
            return Response({"error":"username_and_token_required"}, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(User, username=username)
        # ensure profile exists (create if not)
        Profile.objects.get_or_create(user=user)
        # find last token for user
        try:
            vt = VerificationToken.objects.filter(user=user, type='email').latest('created_at')
        except VerificationToken.DoesNotExist:
            return Response({"error":"no_token"}, status=status.HTTP_404_NOT_FOUND)
        if vt.expires_at < timezone.now():
            return Response({"error":"token_expired"}, status=status.HTTP_400_BAD_REQUEST)
        if not vt.verify(token):
            log_event(user, "verify_email_failed", {"token_prefix": token[:2]})
            return Response({"error":"invalid_token"}, status=status.HTTP_400_BAD_REQUEST)
        log_event(user, "verify_email_success", {})
        return Response({"detail":"verified"})

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        s = LoginSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        username = s.validated_data['username']
        password = s.validated_data['password']
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"error":"invalid_credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        django_login(request, user)  # creates session
        log_event(user, "login", {})
        return Response({"detail":"logged_in"})

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        log_event(request.user, "logout", {})
        django_logout(request)
        return Response({"detail":"logged_out"})

class InboxListView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        # optional query param type=email|sms
        t = request.query_params.get('type')
        qs = InboxMessage.objects.all().order_by('-created_at')
        if t in ('email','sms'):
            qs = qs.filter(type=t)
        ser = InboxSerializer(qs, many=True)
        return Response(ser.data)

class SendSMSView(APIView):
    """
    Simulate sending SMS by creating an InboxMessage of type 'sms' and creating a verification token.
    """
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        phone = request.data.get('phone')
        if not phone:
            return Response({"error":"phone_required"}, status=status.HTTP_400_BAD_REQUEST)
        token = f"{secrets.randbelow(10**6):06d}"
        token_hash = VerificationToken.hash_token(token)
        expires = timezone.now() + timedelta(minutes=10)
        vt = VerificationToken.objects.create(user=request.user, token_hash=token_hash, type='sms', expires_at=expires)
        body = f"Your verification code: {token}"
        InboxMessage.objects.create(to=phone, type='sms', subject='', body=body)
        log_event(request.user, "sms_sent", {"to": phone, "token_id": str(vt.id)})
        # return token_id so frontend can correlate (token raw is not returned by design)
        return Response({"detail":"sms_sent", "token_id": str(vt.id)})

class VerifySMSView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error":"token_required"}, status=status.HTTP_400_BAD_REQUEST)
        # find latest sms token for this user
        try:
            vt = VerificationToken.objects.filter(user=request.user, type='sms').latest('created_at')
        except VerificationToken.DoesNotExist:
            return Response({"error":"no_token"}, status=status.HTTP_404_NOT_FOUND)
        if vt.expires_at < timezone.now():
            return Response({"error":"token_expired"}, status=status.HTTP_400_BAD_REQUEST)
        if not vt.verify(token):
            log_event(request.user, "verify_sms_failed", {})
            return Response({"error":"invalid_token"}, status=status.HTTP_400_BAD_REQUEST)
        log_event(request.user, "verify_sms_success", {})
        return Response({"detail":"sms_verified"})

class TOTPSetupView(APIView):
    """
    Create a TOTP secret and return a provisioning URI (so frontend can render QR code).
    """
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        user = request.user
        Profile.objects.get_or_create(user=user)
        secret = pyotp.random_base32()
        user.profile.totp_secret = secret
        user.profile.save()
        issuer = "SecuritySandbox"
        uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.username, issuer_name=issuer)
        log_event(user, "totp_setup", {})
        return Response({"secret": secret, "uri": uri})

class TOTPVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"error":"code_required"}, status=status.HTTP_400_BAD_REQUEST)
        secret = getattr(request.user.profile, 'totp_secret', None)
        if not secret:
            return Response({"error":"no_totp_secret"}, status=status.HTTP_400_BAD_REQUEST)
        totp = pyotp.TOTP(secret)
        ok = totp.verify(code, valid_window=1)
        log_event(request.user, "totp_verify", {"ok": ok})
        if ok:
            return Response({"detail":"totp_ok"})
        return Response({"error":"invalid_code"}, status=status.HTTP_400_BAD_REQUEST)

class PasswordHashInfoView(APIView):
    """
    For visualization: compute an argon2 hash for given password and return hash + time (measured).
    """
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        pw = request.data.get('password')
        if not pw:
            return Response({"error":"password_required"}, status=status.HTTP_400_BAD_REQUEST)
        t0 = timezone.now()
        ph = PH
        hashed = ph.hash(pw)
        t1 = timezone.now()
        elapsed_ms = (t1 - t0).total_seconds() * 1000
        # don't store password; return hash and measured time
        return Response({"hash": hashed, "time_ms": elapsed_ms})

class RoleRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        role = request.data.get('role')
        if role not in dict(Profile.ROLE_CHOICES):
            return Response({"error":"invalid_role"}, status=status.HTTP_400_BAD_REQUEST)
        rr = RoleRequest.objects.create(user=request.user, role_requested=role)
        log_event(request.user, "role_requested", {"role": role})
        return Response({"id": str(rr.id), "status": rr.status})

class RoleApproveView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        # only admins can approve
        if getattr(request.user, 'profile', None) and request.user.profile.role != 'admin':
            return Response({"error":"forbidden"}, status=status.HTTP_403_FORBIDDEN)
        rr_id = request.data.get('id')
        rr = get_object_or_404(RoleRequest, id=rr_id)
        rr.status = 'approved'
        rr.approved_by = request.user
        rr.approved_at = timezone.now()
        # for demo: grant role to user and set expiry for 15 minutes
        rr.expires_at = timezone.now() + timedelta(minutes=15)
        rr.save()
        # apply role
        profile, _ = Profile.objects.get_or_create(user=rr.user)
        profile.role = rr.role_requested
        profile.save()
        log_event(request.user, "role_approved", {"role_request": str(rr.id)})
        return Response({"detail":"approved", "expires_at": rr.expires_at})

class LogsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        qs = LogEvent.objects.all().order_by('-timestamp')[:200]
        ser = LogEventSerializer(qs, many=True)
        return Response(ser.data)
