# backend/demo/serializers.py
from rest_framework import serializers
from .models import Vault, WrappedSecret

#return vault info.
class VaultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vault
        fields = ["id","owner","name","managed","rotation_period","created_at","last_rotated","next_rotation"]
        read_only_fields = ["owner","created_at","last_rotated","next_rotation"]

#handles vault creation input
class CreateVaultSerializer(serializers.Serializer):
    name = serializers.CharField()
    # if managed True the backend will create a vault key; if False, user must provide key_b64
    managed = serializers.BooleanField(default=True)
    rotation_period = serializers.ChoiceField(choices=[("none","none"),("monthly","monthly"),("yearly","yearly")], default="monthly")
    # optional base64 urlsafe key provided by user; should be 44 chars if valid fernet
    key_b64 = serializers.CharField(required=False, allow_blank=True)
