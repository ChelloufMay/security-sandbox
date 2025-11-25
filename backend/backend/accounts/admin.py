# Registers models in Django admin so you can view/edit them at /admin/

from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import VerificationToken, InboxMessage, Profile, RoleRequest, LogEvent

User = get_user_model()

admin.site.register(VerificationToken)
admin.site.register(InboxMessage)
admin.site.register(Profile)
admin.site.register(RoleRequest)
admin.site.register(LogEvent)

# optionally show users in admin (default)
