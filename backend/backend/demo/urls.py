# backend/demo/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("symmetric/encrypt/", views.SymmetricEncryptView.as_view(), name="sym-encrypt"),
    path("symmetric/decrypt/", views.SymmetricDecryptView.as_view(), name="sym-decrypt"),
    path("rsa/generate/", views.RSAKeyGenView.as_view(), name="rsa-gen"),
    path("rsa/sign/", views.RSASignView.as_view(), name="rsa-sign"),
    path("rsa/verify/", views.RSAVerifyView.as_view(), name="rsa-verify"),
    path("vaults/", views.VaultListCreateView.as_view(), name="vault-list-create"),
    path("vaults/<uuid:vault_id>/", views.VaultDetailView.as_view(), name="vault-detail"),
    path("vaults/<uuid:vault_id>/rotate/", views.VaultRotateView.as_view(), name="vault-rotate"),
    path("vaults/<uuid:vault_id>/secrets/", views.VaultStoreSecretView.as_view(), name="vault-store-secret"),
    path("vaults/<uuid:vault_id>/secrets/<uuid:secret_id>/", views.VaultRetrieveSecretView.as_view(), name="vault-get-secret"),
]
