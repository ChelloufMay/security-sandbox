# Database models for account-related features.
import uuid
import hashlib
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class VerificationToken(models.Model):
    """
    Stores a verification token for email/sms with a hashed token.
    Raw tokens are not stored, only a SHA256 hash is stored for demo safety. Provides hash_token and check helper.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token_hash = models.CharField(max_length=64)
    type = models.CharField(max_length=10, choices=(('email','email'), ('sms','sms')))
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    @staticmethod
    def hash_token(raw: str):
        return hashlib.sha256(raw.encode('utf-8')).hexdigest()

    def verify(self, raw: str):
        return self.token_hash == self.hash_token(raw)

class InboxMessage(models.Model):
    """
    Simulated inbox for email and sms (dev only).
    Frontend reads this for a local "inbox".
    """
    TYPE_CHOICES = (('email','email'), ('sms','sms'))
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    to = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

class Profile(models.Model):
    """
    Extra fields for users: totp_secret and role.
    """
    ROLE_CHOICES = (('reader','reader'), ('operator','operator'), ('admin','admin'))
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    totp_secret = models.CharField(max_length=64, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='reader')

    def __str__(self):
        return f"{self.user.username} profile"

class RoleRequest(models.Model):
    """
    PIM: user requests a role; admin approves. expires_at is when elevated rights end.
    """
    STATUS = (('pending','pending'), ('approved','approved'), ('rejected','rejected'))
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role_requested = models.CharField(max_length=20)
    status = models.CharField(max_length=10, choices=STATUS, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approvals')
    approved_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

class LogEvent(models.Model):
    """
    Structured log events for the UI (SIEM-like demo).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    event_type = models.CharField(max_length=100)
    payload = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']
