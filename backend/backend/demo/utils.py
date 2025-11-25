# backend/demo/utils.py
import os
import base64
from datetime import timedelta
from django.conf import settings
from cryptography.fernet import Fernet
from django.utils import timezone

from .models import Vault

def _ensure_root_key():
    """
    Return a root fernet key (bytes). Expect VAULT_ROOT_KEY env var in urlsafe base64 form.
    If not set, derive a key from SECRET_KEY (demo only).
    """
    root = os.getenv("VAULT_ROOT_KEY")
    if root:
        # if already bytes-like string, ensure it's bytes
        if isinstance(root, str):
            root = root.encode("utf-8")
        return root
    # fallback (DEMO ONLY): derive from Django SECRET_KEY
    sk = settings.SECRET_KEY.encode("utf-8")
    return base64.urlsafe_b64encode(sk.ljust(32, b"0")[:32])

def root_fernet() -> Fernet:
    return Fernet(_ensure_root_key())

def generate_vault_key() -> bytes:
    """Return a new vault key in urlsafe_b64 bytes (32 random bytes base64)."""
    return base64.urlsafe_b64encode(os.urandom(32))

def wrap_vault_key_with_root(vault_key_b64: bytes) -> bytes:
    """Encrypt the vault key with root fernet and return ciphertext bytes."""
    f = root_fernet()
    return f.encrypt(vault_key_b64)

def unwrap_vault_key_with_root(wrapped_key: bytes) -> bytes:
    """Decrypt wrapped_key with root fernet; return vault_key_b64 (bytes)."""
    f = root_fernet()
    return f.decrypt(wrapped_key)

def compute_next_rotation(now, rotation_period: str):
    if rotation_period == "monthly":
        return now + timedelta(days=30)
    if rotation_period == "yearly":
        return now + timedelta(days=365)
    return None

def rotate_vault(vault: Vault):
    """
    Rotate a single Vault:
    - unwrap existing vault key (if any)
    - generate new vault key
    - rewrap every secret: decrypt with old key, encrypt with new key
    - store new wrapped_key encrypted under root
    - update last_rotated and next_rotation
    """
    from cryptography.fernet import Fernet

    now = timezone.now()
    if not vault.wrapped_key:
        raise RuntimeError("Vault has no wrapped_key to rotate")

    # get old vault key (bytes, URL-safe base64)
    old_vault_key_b64 = unwrap_vault_key_with_root(vault.wrapped_key)
    old_fernet = Fernet(old_vault_key_b64)

    # generate new vault key
    new_vault_key_b64 = generate_vault_key()
    new_fernet = Fernet(new_vault_key_b64)

    # rewrap all secrets
    for secret in vault.secrets.all():
        try:
            plaintext = old_fernet.decrypt(bytes(secret.wrapped))
        except Exception as e:
            # If decrypt fails, skip or raise depending on policy; here we raise to avoid data loss
            raise RuntimeError(f"Failed to decrypt secret {secret.id}: {e}")
        # encrypt with new key
        new_ct = new_fernet.encrypt(plaintext)
        secret.wrapped = new_ct
        secret.save(update_fields=["wrapped"])

    # store new wrapped_key using root fernet
    vault.wrapped_key = wrap_vault_key_with_root(new_vault_key_b64)
    vault.last_rotated = now
    vault.next_rotation = compute_next_rotation(now, vault.rotation_period)
    vault.save(update_fields=["wrapped_key", "last_rotated", "next_rotation"])
    return vault
