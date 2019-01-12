import sys
import argparse

import websocket
from time import sleep
import serial
import json

import random

def on_error(ws, error):
    print(error)


def on_close(ws):
    print("### Connection closed ###")


# Gets Parses mavlink data to json string
def mav_as_json(port=None):
    # TODO - Retrieve data from port

    # TODO - Replace random with correct values
    data = {
        "online": True,
        "roll": random.randint(1,360),
        "pitch": random.randint(1,360),
        "yaw": random.randint(1,360),
    }
    return json.dumps(data)

def main():

    try:
        # Define parameters
        parser = argparse.ArgumentParser(
            description="Receive mavlink data from serial port and send to T13 DroneVisServer as Json")

        parser.add_argument('-a', metavar='<server address>', type=str, required=True,
                            help='Domain/IP of server')
        parser.add_argument('-p', metavar='<serial port>', type=str, required=True,
                            help='Serial port through which data is received')
        parser.add_argument('-t', metavar='<int: send interval in ms>', type=int, required=True,
                            help='How many ms pass between each packet')
        args = parser.parse_args()  # Get parameter values

        # Connect to WebSocket
        socket_url = "ws://" + args.a + "/socket/1/"
        print("Connecting to: " + socket_url)
        ws = websocket.create_connection(socket_url,
                                    on_error=on_error,
                                    on_close=on_close)

        # Get ms
        milies = args.t if args.t >= 200 else 200
        seconds = milies/1000

        # TODO - Open serial port

        # loop infinitely
        try:
            print("Connected")
            while True:
                ws.send(mav_as_json())  # Pass serial port object to this function to get data as JSON
                sleep(seconds)

        # Cancel on keyboard interrupt
        except KeyboardInterrupt as e:
            print(e)
            ws.close()
            return 0

    # Except any error
    except Exception as e:
        print(e)
        return -1


if __name__ == '__main__':
    sys.exit(main())
