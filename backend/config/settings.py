import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Basic config (env-overridable)
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key-change-me")
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() not in {"0", "false", "no"}

# Allow everything in dev; override in prod with env
ALLOWED_HOSTS = [h for h in os.getenv("DJANGO_ALLOWED_HOSTS", "*").split(",")]

# Minimal installed apps (no DB-required contrib apps)
INSTALLED_APPS = [
    "corsheaders",
    "ping",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"

# Templates kept minimal for compatibility (not really used here)
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": []},
    }
]

WSGI_APPLICATION = "config.wsgi.application"

# Dummy SQLite DB; not used by our endpoint, but keeps Django happy.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# i18n/timezone
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static (unused, but included for completeness)
STATIC_URL = "static/"

# CORS: allow Vite dev server by default
_default_cors = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ALLOWED_ORIGINS = [o for o in os.getenv("CORS_ALLOWED_ORIGINS", _default_cors).split(",") if o]
