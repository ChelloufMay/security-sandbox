# backend/demo/apps.py
from django.apps import AppConfig

class DemoConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.demo"
    label= "demo"
