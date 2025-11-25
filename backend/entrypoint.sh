#!/usr/bin/env bash
# entrypoint.sh - runs migrations and starts Django dev server
# Fixed: removed stray '-' passed to `manage.py shell` and improved robustness.

set -euo pipefail

# Wait for postgres (if DATABASE_URL points to postgres)
wait_for_postgres() {
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL not set — skipping postgres wait."
    return 0
  fi

  echo "Waiting for Postgres to be ready at $DATABASE_URL ..."
  python - <<'PY'
import os, time, sys
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("No DATABASE_URL set; skipping DB wait.")
    sys.exit(0)

import psycopg2
for i in range(60):
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.close()
        print("Postgres is available.")
        sys.exit(0)
    except Exception as e:
        print(f"Postgres not ready, retrying... ({i+1}/60) {e}")
        time.sleep(1)
print("Timed out waiting for Postgres.")
sys.exit(1)
PY
}

# Try waiting for Postgres, but don't fail the whole script if something odd happens
wait_for_postgres || true

# Run migrations (safe with sqlite or Postgres)
echo "Running migrations..."
python manage.py migrate --noinput || true

# Create a superuser automatically if env vars present (optional)
if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ] && [ -n "${DJANGO_SUPERUSER_EMAIL:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  echo "Creating superuser (if not exists)..."
  python manage.py shell <<PY
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='${DJANGO_SUPERUSER_USERNAME}').exists():
    User.objects.create_superuser('${DJANGO_SUPERUSER_USERNAME}','${DJANGO_SUPERUSER_EMAIL}','${DJANGO_SUPERUSER_PASSWORD}')
print('Superuser check done.')
PY
fi

# Start development server (exec so signals are forwarded to Django)
exec python manage.py runserver 0.0.0.0:8000
