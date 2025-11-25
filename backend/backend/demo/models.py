# backend/demo/models.py
import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

ROTATION_CHOICES = (
    ("none", "None"),
    ("monthly", "Monthly"),
    ("yearly", "Yearly"),
)

class Vault(models.Model):
    """
    Represents a Key Vault (demo).
    - owner: user who owns the vault
    - name: friendly name
    - managed: if True, backend generates and rotates the vault key per rotation_period
    - rotation_period: 'none', 'monthly', 'yearly'
    - wrapped_key: the vault's wrapping key encrypted with the root key (Binary)
    - created_at, last_rotated, next_rotation
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vaults")
    name = models.CharField(max_length=200)
    managed = models.BooleanField(default=True)
    rotation_period = models.CharField(max_length=20, choices=ROTATION_CHOICES, default="monthly")
    wrapped_key = models.BinaryField(null=True, blank=True)  # encrypted vault key (bytes)
    created_at = models.DateTimeField(auto_now_add=True)
    last_rotated = models.DateTimeField(null=True, blank=True)
    next_rotation = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.owner.username})"

class WrappedSecret(models.Model):
    """
    Secret stored inside a Vault. The .wrapped field stores the ciphertext produced
    by Fernet(vault_key). For demo simplicity it's a BinaryField.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vault = models.ForeignKey(Vault, on_delete=models.CASCADE, related_name="secrets")
    name = models.CharField(max_length=200)
    wrapped = models.BinaryField()  # ciphertext bytes
    created_at = models.DateTimeField(auto_now_add=True)
