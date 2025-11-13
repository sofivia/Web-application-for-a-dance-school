from django.apps import AppConfig
from django.conf import settings
from mongoengine import connect


class CoreConfig(AppConfig):
    name = "core"

    def ready(self):
        connect(**settings.MONGODB_SETTINGS)
