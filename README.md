# Security Sandbox

Security Sandbox is a learning-oriented web application designed to simulate and demonstrate common security mechanisms similar to those used in Microsoft Azure, in a safe local environment. Its purpose is to help understand how modern security concepts such as HTTPS/TLS termination, authentication flows, CSRF protection, role-based access control, secure cookies, email/SMS-based verification, and reverse-proxy architectures work together in real-world systems. By combining a Dockerized Django backend, a Vite + React frontend, and an HTTPS entrypoint using mkcert and nginx, the project mirrors Azure-style setups (App Gateway / Front Door, managed identities, secure networking) while remaining fully local, transparent, and educational.

---

## Quick summary

* **Backend:** Django (in Docker)
* **Frontend:** Vite + React (running on the host during dev)
* **Dev services (Docker):** Postgres, MailHog, (optional nginx for TLS)
* **Local HTTPS:** `mkcert` + nginx (TLS termination)
* **Dev modes:**

  * **Mode A (fast):** Vite dev server (`http://localhost:5173`) + Django exposed at `http://localhost:8000` (useful for quick dev and debugging)
  * **Mode B (recommended):** HTTPS entrypoint `https://security-sandbox.test` served by nginx (mkcert certs)   same-origin for frontend and backend, no CORS, simulates production HTTPS

---

## Repository structure (recommended)

```
security-sandbox/
├─ backend/                 # Django project (Dockerfile, entrypoint.sh, .env)
├─ frontend/                # Vite + React (dev server runs on host)
├─ nginx/                   # nginx config (nginx.conf)
├─ certs/                   # local mkcert certs (gitignored)
├─ docker-compose.yml       # orchestrates db, mailhog, backend, nginx
├─ .env.example             # example env vars for backend/frontend
└─ README.md                # this file
```

---

## Prerequisites

* Docker & Docker Compose (Docker Desktop on Windows is recommended)
* Node.js + npm/yarn (for frontend)
* Python (for local scripts if you run Django outside Docker)   optional
* **mkcert** (for local trusted certs on Windows)   [https://github.com/FiloSottile/mkcert](https://github.com/FiloSottile/mkcert)

On Windows you can install mkcert with Chocolatey:

```powershell
choco install mkcert
mkcert -install
```

You only need to install mkcert once per machine. `mkcert -install` sets up a local CA in the system trust store.

---

## Generate local certificates (mkcert)

1. At repo root create a `certs/` folder:

```powershell
mkdir certs
cd certs
```

2. Generate certificate + key for the hostname we use (`security-sandbox.test`) plus `localhost`, `127.0.0.1` and Docker host alias:

```bash
mkcert -cert-file security-sandbox.test.pem -key-file security-sandbox.test-key.pem \
  security-sandbox.test localhost 127.0.0.1 ::1 host.docker.internal
```

This will create:

* `certs/security-sandbox.test.pem`
* `certs/security-sandbox.test-key.pem`

3. Verify mkcert CA folder (optional):

```bash
mkcert -CAROOT
```

4. Add hosts entry (Windows) requires Administrator privileges:

Edit `C:\Windows\System32\drivers\etc\hosts` and add:

```
127.0.0.1   security-sandbox.test
```

Now your browser will resolve `security-sandbox.test` to your machine.

---

## nginx (TLS termination + proxy)

Place your `nginx.conf` in `nginx/nginx.conf` and mount it in docker-compose. The nginx job:

* Terminate TLS with the mkcert certificate
* Proxy `/api` or `/admin` paths to `backend:8000` (Django container)
* Proxy all other paths to the Vite dev server running on the host (`host.docker.internal:5173`) for HMR and assets

A working `nginx.conf` example is provided in the repo (or see `nginx/nginx.conf.example`).

---

## docker-compose (services)

Typical services used in development:

* `db`   Postgres (volume-backed)
* `mailhog`   SMTP capture for testing email flows
* `backend`   Django app (built from `backend/Dockerfile`)   prefer `expose: "8000"` when using nginx; use `ports: - "8000:8000"` only in Mode A (quick dev)
* `nginx`   TLS termination and reverse proxy (optional in Mode A)

Start services:

```bash
# build and run
docker-compose up --build

# or detach
docker-compose up -d --build

docker-compose logs -f backend
```

**Note:** If you use Mode B (nginx TLS), you do **not** need to publish `8000` to the host   leave backend with `expose: ["8000"]`.

---

## Frontend (Vite)   dev server

Run from `frontend/` folder:

```bash
npm install
npm run dev -- --host
```

Key points:

* Use `--host` (or `server.host: true` in `vite.config.ts`) so the dev server is reachable from the nginx container via `host.docker.internal:5173`.
* **Do not** hardcode backend absolute URLs in browser-executed code. Use relative paths: `postJson('/register', data)`.
* Use `vite.config.ts -> server.proxy` to forward API calls to `http://localhost:8000` during Mode A if desired.
* If you're running through nginx (Mode B), keep API calls relative and allow nginx to route them.

**Vite host check:** Add `allowedHosts: ['security-sandbox.test']` in `vite.config.ts` so Vite accepts requests forwarded from `security-sandbox.test`.

---

## Django backend notes

* Ensure Django binds to `0.0.0.0:8000` so it is reachable inside Docker: e.g. in `entrypoint.sh`:

```bash
python manage.py runserver 0.0.0.0:8000
```

* In `settings.py` set:

```py
ALLOWED_HOSTS = ['security-sandbox.test', 'localhost', '127.0.0.1']
CSRF_TRUSTED_ORIGINS = ['https://security-sandbox.test']
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
```

* For development you may keep `DEBUG = True` but avoid using production-grade secrets.

---

## Environment variables & git rules

* **Do not commit** developer-specific env files. Add to `.gitignore`:

```
# local secrets and certs
certs/
*.pem
*.key
.env.local
frontend/.env.local
```

* Commit `backend/.env.example` and `frontend/.env.example` as guidance for other developers.
* If you use `VITE_API_BASE` for a quick local setup, **do not** commit `.env.local` with `VITE_API_BASE=http://localhost:8000` when you plan to use nginx/HTTPS.

---

## Workflows (Mode A vs Mode B)

### Mode A   Fast local dev (no HTTPS)

1. `docker-compose up --build` (ensure backend publishes `8000:8000` in compose)
2. `cd frontend && npm run dev -- --host`
3. Open `http://localhost:5173`

**Use when:** quick debugging, backend port needs to be accessible by browser.

### Mode B   HTTPS dev (recommended)

1. Create mkcert certs under `certs/` as above
2. Add `127.0.0.1 security-sandbox.test` to hosts file
3. Ensure `backend` uses `expose: - "8000"` (do not publish to host)
4. Start with `docker-compose up --build` (nginx included)
5. `cd frontend && npm run dev -- --host`
6. Open `https://security-sandbox.test`

**Use when:** you want HTTPS locally, same-origin behavior, correct cookie/CSRF behavior and to test TLS.

---

## Debugging checklist

* `ERR_CONNECTION_REFUSED` → backend not listening or port not published. Check `docker-compose ps` and `docker-compose logs backend`.
* `Blocked request. This host ("security-sandbox.test") is not allowed.` → add `allowedHosts: ['security-sandbox.test']` in `vite.config.ts` and restart Vite.
* `CORS` errors → browser is calling `http://localhost:8000` directly. Remove absolute URLs and use relative paths or ensure requests pass through nginx.
* Certificate not trusted → run `mkcert -install` and regenerate certs if needed; ensure you used the exact hostname in SANs.

---

## Security best practices (dev)

* Never commit private keys or `.env.local` files
* Keep certs out of repo and describe generation steps in README
* Prefer same-origin design with a single TLS entrypoint in dev to reduce CORS and cookie issues
* Add a `SECURITY.md` describing how to report issues and avoid committing secrets

---

## Useful commands

```bash
# build & run docker
docker-compose up --build

# rebuild backend only
docker-compose up --build backend

# stop
docker-compose down

# check containers
docker ps

# view logs
docker-compose logs -f backend
```

---

## Example .gitignore (recommended additions)

```
# local envs and certs
.env.local
frontend/.env.local
certs/
*.pem
*.key

# node
node_modules/

# python
__pycache__/
*.pyc

# docker
docker-compose.override.yml
```

---

## Contributing & notes

If you find issues with the dev TLS configuration, or if you want to dockerize the frontend as well, file an issue or send a PR. Consider adding a `Makefile` or `scripts/dev-setup.sh` to automate mkcert generation and host-file edits (be careful editing system hosts requires admin rights).

License: MIT

---

If you want, I can also:

* Add a ready-made `nginx/nginx.conf.example` to the repo
* Create a `scripts/dev-setup.ps1` that runs mkcert and prints host instructions (Windows)
* Draft a `SECURITY.md` file for responsible disclosure

Tell me which extras you want and I’ll add them.
