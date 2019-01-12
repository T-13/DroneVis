from channels.generic.websocket import AsyncWebsocketConsumer
import json

sockets = dict()
givers = []
disconnect_msg = json.dumps(
                        {
                            "online": False
                        })

class DataConsumer(AsyncWebsocketConsumer):

    socket_type = -1

    async def connect(self):
        socket_type = self.scope['url_route']['kwargs']['type']

        # If new giver wants to connect while we already have one
        if socket_type == 1 and len(givers) > 0:
            return  # Ignore - Later can support multiple data sources
        # Else assign as giver
        elif socket_type == 1:
            givers.append(self)

        # Keep track of all sockets and their type
        sockets[self] = socket_type

        await self.accept() # Accept connection

    async def disconnect(self, close_code):
        # If giver disconnected
        if sockets[self] == 1:
            givers.remove(self) # Remove from givers
            # Alert sockets that data source disconnected
            for key, value in sockets.items():
                # if receiver
                if value == 0:
                    await key.send(text_data=disconnect_msg)

        sockets.pop(self)   # Remove from sockets

    # Receive msg from web socket
    async def receive(self, text_data=None, bytes_data=None):
        # If socket is sender
        if sockets[self] == 1:
            for key, value in sockets.items():
                # if receiver
                if value == 0:
                    await key.send(text_data=text_data)
