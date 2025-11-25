# Registers models in Django admin so you can view/edit them at /admin/

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import InboxMessage, RoleRequest, LogEvent

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class InboxSerializer(serializers.ModelSerializer):
    class Meta:
        model = InboxMessage
        fields = ['id','to','type','subject','body','created_at','read']

class RoleRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleRequest
        fields = '__all__'

class LogEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogEvent
        fields = ['id','user','event_type','payload','timestamp']
