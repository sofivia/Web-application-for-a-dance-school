from django.contrib import admin
from django.urls import path
from ping.views import ping

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/ping", ping, name="ping-no-slash"),
    path("api/ping/", ping, name="ping"),
]
