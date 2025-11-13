import os
from pathlib import Path


def read_secret(name):
    path = f"/run/secrets/{name}"
    with open(path) as f:
        return f.read().strip()


BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key-change-me")
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() not in {"0", "false", "no"}

ALLOWED_HOSTS = [h for h in os.getenv("DJANGO_ALLOWED_HOSTS", "*").split(",")]

INSTALLED_APPS = [
    "corsheaders",
    "ping",
    "core"
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": []},
    }
]

WSGI_APPLICATION = "config.wsgi.application"

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"

_default_cors = "http://localhost:5173,http://127.0.0.1:5173"
_origins = os.getenv("CORS_ALLOWED_ORIGINS", _default_cors).split(",")
CORS_ALLOWED_ORIGINS = [o for o in _origins if o]

dbpasswd = read_secret("db_app_passwd")
MONGODB_SETTINGS = {
    "host": f"mongodb://app:{dbpasswd}@db:27017/szkola?tls=true"
}
