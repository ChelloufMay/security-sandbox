# Hooks into Django lifecycle to auto-create Profile when a User is created
#Listens to post_save for User and creates a Profile for new users.

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

@receiver(post_save, sender=User)
def create_profile(_sender, instance, created, **_kwargs):
    if created:
        Profile.objects.create(user=instance)
