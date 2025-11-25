# Declares app name and (if modified) imports signals on startup. ready() it ensures accounts.signals runs to create Profile objects automatically

from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.accounts"
    label = "accounts"

    def ready(self):
        # import signals
        import backend.accounts.signals  # noqa