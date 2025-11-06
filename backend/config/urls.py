from django.urls import path
from ping.views import ping

urlpatterns = [
    path("api/ping", ping, name="ping-no-slash"),
    path("api/ping/", ping, name="ping"),
]
