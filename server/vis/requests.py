from django.http import JsonResponse
from utilities.json_helper import *
from .models import *


def get_model(request, model):
    try:
        mesh = Mesh.objects.get(pk=model)
        return JsonResponse(response_json(STATUSES["OK"], mesh.value))
    except Exception as e:
        print(e)
        return JsonResponse(response_json(STATUSES["ERROR_RETRIEVING_DATA"]))

