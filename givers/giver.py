import sys
import argparse
import abc

import websocket
import json
from time import sleep


# Abstract data giver
class Giver(abc.ABC):
    @abc.abstractmethod
    def get_data(self):
        pass

    @abc.abstractmethod
    def prepare(self):
        pass

    @abc.abstractmethod
    def cleanup(self):
        pass

    @abc.abstractmethod
    def add_arguments(self, parser):
        pass

    @abc.abstractmethod
    def verify_arguments(self, parser, args):
        pass


def run(giver):
    # Parse parameters
    parser = argparse.ArgumentParser(description="Send random (test/example) data to Team13 DroneVis Server.")
    parser.add_argument("-a", type=str, default="0.0.0.0:8000", metavar="<ip:port>",
                        help="address of DroneVis Server (default: 0.0.0.0:8000 - local server)")
    parser.add_argument("-i", type=int, default=10, metavar="<interval>",
                        help=("interval of packet sending in milliseconds, "
                              "too low might cause connection issues, "
                              "too high might cause data decoding issues (default: 10)"))
    parser.add_argument("-v", action="store_true", default=False,
                        help="verbose output (log all data to stdout)")

    giver.add_arguments(parser)  # Arguments from used giver

    args = parser.parse_args()

    # Verify arguments
    if ":" not in args.a:
        parser.error("argument -a: invalid choice: {} (must contain IP and port)".format(args.a))

    if args.i < 1:
        parser.error("argument -i: invalid choice: {} (choose above 0)".format(args.i))

    giver.verify_arguments(parser, args)  # Arguments from used giver

    giver.prepare()  # Prepare used giver

    # Convert milliseconds to seconds
    seconds = args.i / 1000.0

    # Connect to WebSocket
    socket_url = "ws://{}/socket/1/".format(args.a)
    print("Connecting to: {}...".format(socket_url))

    try:
        conn = websocket.create_connection(socket_url)
    except Exception as e:
        print("Error! Unable to open WebSocket connection!\n=> {}".format(e))
        return 2

    print("Connected!")

    # Send data until keyboard interrupt or connection error
    try:
        while True:
            data = giver.get_data()

            if args.v:
                print(data)

            data = json.dumps(data)

            conn.send(data)
            sleep(seconds)
    except KeyboardInterrupt:
        print("Closing connection...")
    except Exception as e:
        print("Error! Connection lost!\n=> {}".format(e))

    # Cleanup
    conn.close()
    giver.cleanup()  # Cleanup used giver

    return 0
