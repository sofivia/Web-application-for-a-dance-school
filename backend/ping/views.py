from django.http import JsonResponse
from ping.models import PingData


def ping(request):
    data = PingData(status="ok")
    return JsonResponse(data.to_mongo())
