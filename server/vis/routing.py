from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("socket/<int:type>/", consumers.DataConsumer),
]