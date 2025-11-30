from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def ping(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/ping/", ping),

    path("api/accounts/", include("accounts.urls")),
]
