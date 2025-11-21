#!/usr/bin/env bash
# entrypoint.sh - runs migrations and starts Django dev server

set -e

# Wait for postgres
wait_for_postgres() {
  if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL not set — skipping postgres wait."
    return 0
  fi

  # Try to connect until success
  echo "Waiting for Postgres to be ready at $DATABASE_URL ..."
  python - <<PY
import os, time
from urllib.parse import urlparse
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("No DATABASE_URL set; skipping DB wait.")
    raise SystemExit(0)

# attempt to connect using psycopg2
import psycopg2, sys
for i in range(60):
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.close()
        print("Postgres is available.")
        sys.exit(0)
    except Exception as e:
        print("Postgres not ready, retrying... (%d/60)" % (i+1))
        time.sleep(1)
print("Timed out waiting for Postgres.")
sys.exit(1)
PY
}
wait_for_postgres || true

# load .env if present (python-dotenv will also load in Django settings if used)
# Wait for possible dependent services (not strictly necessary for MailHog)
# run migrations (safe with sqlite)
python manage.py migrate --noinput || true


# create a superuser automatically if env vars present (optional)
if [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  echo "Creating superuser (if not exists)..."
  python manage.py shell - <<PY
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME','$DJANGO_SUPERUSER_EMAIL','$DJANGO_SUPERUSER_PASSWORD')
print('Superuser check done.')
PY
fi

# run server accessible from host
python manage.py runserver 0.0.0.0:8000
