# backend/demo/views.py
import os, base64
from .serializers import VaultSerializer, CreateVaultSerializer
from . import utils

from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import WrappedSecret, Vault
from django.utils import timezone
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.fernet import Fernet



# helper: get vault master key as bytes. If not present, derive from SECRET_KEY
def get_master_key():
    mk = os.getenv("VAULT_MASTER_KEY")
    if mk:
        # ensure it's 32-bytes base64 or a raw passphrase — for demo we'll derive a fernet key
        if len(mk) == 44 and mk.endswith('='):
            return mk.encode('utf-8')
        # derive a fernet key from passphrase
        return base64.urlsafe_b64encode(mk.encode('utf-8').ljust(32, b'0')[:32])
    # fallback: use Django SECRET_KEY
    sk = settings.SECRET_KEY
    return base64.urlsafe_b64encode(sk.encode('utf-8').ljust(32, b'0')[:32])

# Symmetric AES-GCM encrypt
class SymmetricEncryptView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        plaintext = request.data.get('plaintext','').encode('utf-8')
        # generate random 256-bit key for demo and return it to user (in real system keys are kept secret)
        key = AESGCM.generate_key(bit_length=256)
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        ct = aesgcm.encrypt(nonce, plaintext, None)
        return Response({
            "key": base64.b64encode(key).decode('utf-8'),
            "nonce": base64.b64encode(nonce).decode('utf-8'),
            "ciphertext": base64.b64encode(ct).decode('utf-8'),
        })

class SymmetricDecryptView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        key_b64 = request.data.get('key')
        nonce_b64 = request.data.get('nonce')
        ct_b64 = request.data.get('ciphertext')
        if not (key_b64 and nonce_b64 and ct_b64):
            return Response({"error":"missing_fields"}, status=status.HTTP_400_BAD_REQUEST)
        key = base64.b64decode(key_b64)
        nonce = base64.b64decode(nonce_b64)
        ct = base64.b64decode(ct_b64)
        aesgcm = AESGCM(key)
        try:
            pt = aesgcm.decrypt(nonce, ct, None)
        except Exception as e:
            return Response({"error":"decrypt_failed", "detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"plaintext": pt.decode('utf-8')})

# Asymmetric RSA generate/sign/verify
class RSAKeyGenView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        priv_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        pub_pem = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        return Response({
            "private_key": priv_pem.decode('utf-8'),
            "public_key": pub_pem.decode('utf-8')
        })

class RSASignView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        priv_pem = request.data.get('private_key').encode('utf-8')
        message = request.data.get('message','').encode('utf-8')
        private_key = serialization.load_pem_private_key(priv_pem, password=None)
        signature = private_key.sign(
            message,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256()
        )
        return Response({"signature": base64.b64encode(signature).decode('utf-8')})

class RSAVerifyView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        pub_pem = request.data.get('public_key').encode('utf-8')
        message = request.data.get('message','').encode('utf-8')
        signature_b64 = request.data.get('signature')
        signature = base64.b64decode(signature_b64)
        public_key = serialization.load_pem_public_key(pub_pem)
        try:
            public_key.verify(
                signature,
                message,
                padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
                hashes.SHA256()
            )
            return Response({"valid": True})
        except Exception:
            return Response({"valid": False})

class VaultListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Vault.objects.filter(owner=request.user)
        ser = VaultSerializer(qs, many=True)
        return Response(ser.data)

    def post(self, request):
        """
        Create a vault.
        Payload:
        {
         "name": "my vault",
         "managed": true/false,
         "rotation_period": "monthly"/"yearly"/"none",
         "key_b64": optional base64 URL-safe key if user supplies their own (44 chars)
        }
        """
        s = CreateVaultSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        name = s.validated_data["name"]
        managed = s.validated_data["managed"]
        rotation_period = s.validated_data["rotation_period"]
        key_b64 = s.validated_data.get("key_b64", "").strip()

        # Validate key_b64 if provided
        if key_b64:
            try:
                kb = key_b64.encode("utf-8")
                # ensure Fernet-compatible by decoding/validating
                Fernet(kb)
            except Exception:
                return Response({"error":"invalid_key_format"}, status=status.HTTP_400_BAD_REQUEST)

        if not managed and not key_b64:
            return Response({"error":"unmanaged_vault_requires_key"}, status=status.HTTP_400_BAD_REQUEST)

        vault = Vault(owner=request.user, name=name, managed=managed, rotation_period=rotation_period)

        # Determine vault key to use
        if key_b64:
            vault_key_b64 = key_b64.encode("utf-8")
        else:
            # generate new key (backend-managed)
            vault_key_b64 = utils.generate_vault_key()

        # Wrap vault key with root fernet and store
        vault.wrapped_key = utils.wrap_vault_key_with_root(vault_key_b64)
        vault.last_rotated = timezone.now()
        vault.next_rotation = utils.compute_next_rotation(vault.last_rotated, vault.rotation_period) if vault.managed else None
        vault.save()
        ser = VaultSerializer(vault)
        return Response(ser.data, status=status.HTTP_201_CREATED)

class VaultDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, vault_id):
        vault = get_object_or_404(Vault, id=vault_id)
        if vault.owner != request.user and request.user.profile.role != "admin":
            return Response({"error":"forbidden"}, status=status.HTTP_403_FORBIDDEN)
        ser = VaultSerializer(vault)
        return Response(ser.data)

class VaultRotateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, vault_id):
        """
        Manual trigger of rotation. Allowed for owner of the vault or admin.
        """
        vault = get_object_or_404(Vault, id=vault_id)
        if vault.owner != request.user and request.user.profile.role != "admin":
            return Response({"error":"forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if not vault.managed:
            return Response({"error":"vault_not_managed"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            utils.rotate_vault(vault)
        except Exception as e:
            return Response({"error":"rotation_failed", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"detail":"rotated", "next_rotation": vault.next_rotation})

class VaultStoreSecretView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, vault_id):
        """
        Store a secret in the vault. Payload:
        { "name": "api-key", "value": "secret-value" }
        """
        vault = get_object_or_404(Vault, id=vault_id)
        if vault.owner != request.user and request.user.profile.role != "admin":
            return Response({"error":"forbidden"}, status=status.HTTP_403_FORBIDDEN)

        name = request.data.get("name")
        value = request.data.get("value")
        if not name or value is None:
            return Response({"error":"name_and_value_required"}, status=status.HTTP_400_BAD_REQUEST)

        # unwrap vault key and use it to encrypt value
        vault_key_b64 = utils.unwrap_vault_key_with_root(vault.wrapped_key)
        f = Fernet(vault_key_b64)
        wrapped = f.encrypt(value.encode("utf-8"))
        secret = WrappedSecret.objects.create(vault=vault, name=name, wrapped=wrapped)
        return Response({"id": secret.id, "name": secret.name, "created_at": secret.created_at})

class VaultRetrieveSecretView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, vault_id, secret_id):
        vault = get_object_or_404(Vault, id=vault_id)
        if vault.owner != request.user and request.user.profile.role != "admin":
            return Response({"error":"forbidden"}, status=status.HTTP_403_FORBIDDEN)
        secret = get_object_or_404(WrappedSecret, id=secret_id, vault=vault)
        vault_key_b64 = utils.unwrap_vault_key_with_root(vault.wrapped_key)
        f = Fernet(vault_key_b64)
        try:
            plaintext = f.decrypt(bytes(secret.wrapped)).decode("utf-8")
        except Exception as e:
            return Response({"error":"unwrap_failed", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"id": secret.id, "name": secret.name, "value": plaintext})

