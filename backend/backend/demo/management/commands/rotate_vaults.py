# backend/demo/management/commands/rotate_vaults.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from backend.demo.models import Vault
from backend.demo import utils

class Command(BaseCommand):
    help = "Rotate due vaults (those with managed=True and next_rotation <= now)."

    def handle(self, *args, **options):
        now = timezone.now()
        due = Vault.objects.filter(managed=True, next_rotation__isnull=False, next_rotation__lte=now)
        self.stdout.write(f"Found {due.count()} vault(s) due for rotation.")
        for v in due:
            try:
                utils.rotate_vault(v)
                self.stdout.write(self.style.SUCCESS(f"Rotated vault {v.id} ({v.name}) -> next_rotation {v.next_rotation}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to rotate vault {v.id}: {e}"))
