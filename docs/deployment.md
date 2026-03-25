# Deployment Guide

This guide covers deploying the ESTAM Clinic system to a production Linux server (Ubuntu 24) using Gunicorn, NGINX, and Docker Compose.

---

## Table of Contents

- [Environment Configuration](#environment-configuration)
- [Docker Compose (Recommended)](#docker-compose-recommended)
- [Manual Deployment](#manual-deployment)
- [NGINX Configuration](#nginx-configuration)
- [Security Checklist](#security-checklist)

---

## Environment Configuration

Create a `.env` file on the server. Never commit this file.

```env
SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False
DATABASE_URL=postgres://estam:strongpassword@db:5432/estam_clinic
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

For the frontend build, set:

```env
VITE_API_URL=https://your-domain.com
```

---

## Docker Compose (Recommended)

A minimal `docker-compose.yml` for production:

```yaml
version: '3.9'

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: estam
      POSTGRES_PASSWORD: strongpassword
      POSTGRES_DB: estam_clinic
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    command: gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 4
    env_file: .env
    depends_on:
      - db
    volumes:
      - static_files:/app/staticfiles

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - static_files:/static
      - ./certbot/conf:/etc/letsencrypt
    depends_on:
      - backend

volumes:
  postgres_data:
  static_files:
```

**Deploy steps:**

```bash
# 1. Pull latest code
git pull origin main

# 2. Build and start
docker compose up -d --build

# 3. Run migrations
docker compose exec backend python manage.py migrate

# 4. Collect static files
docker compose exec backend python manage.py collectstatic --no-input
```

---

## Manual Deployment

### Backend

```bash
# Install dependencies
pip install -e .

# Set environment variables (or use .env)
export DJANGO_SETTINGS_MODULE=backend.settings
export DATABASE_URL=postgres://...
export SECRET_KEY=...
export DEBUG=False

# Migrate and collect statics
python manage.py migrate
python manage.py collectstatic --no-input

# Run with Gunicorn
gunicorn backend.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 4 \
    --timeout 120 \
    --access-logfile /var/log/gunicorn/access.log \
    --error-logfile /var/log/gunicorn/error.log \
    --daemon
```

### Frontend

```bash
cd frontend
npm ci
npm run build
# Serve the dist/ directory via NGINX
```

---

## NGINX Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Serve the React SPA
    root /var/www/estam-clinic/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Gunicorn
    location /api/ {
        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Serve Django static files
    location /static/ {
        alias /var/www/estam-clinic/staticfiles/;
    }
}
```

---

## Security Checklist

Before going live, verify the following:

- [ ] `DEBUG=False` in production environment.
- [ ] `SECRET_KEY` is long, random, and kept secret.
- [ ] `ALLOWED_HOSTS` is restricted to the actual domain — no wildcards.
- [ ] `CORS_ALLOWED_ORIGINS` only includes the frontend origin.
- [ ] Database is not exposed to the public internet (bind to `localhost` or a private network).
- [ ] HTTPS is enforced (NGINX redirects HTTP → HTTPS).
- [ ] Django's `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, and `CSRF_COOKIE_SECURE` are set to `True`.
- [ ] UFW firewall allows only ports 80, 443, and 22 (SSH).
- [ ] Fail2Ban is configured to block repeated failed login attempts.
- [ ] Superuser accounts have strong passwords and are not named `admin`.
- [ ] `drf-spectacular` Swagger UI is disabled or access-restricted in production.