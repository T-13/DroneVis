from django.urls import path

from utilities.url_helper import *
from . import views, requests

urlpatterns = [
    path(generate_request_name("getModel/<int:model>"), requests.get_model),

    path('', views.main_view),
]