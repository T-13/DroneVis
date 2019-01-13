import sys

import giver

import serial
from pymavlink import mavutil
from datetime import datetime


HEARTBEAT_WAIT = 1


# MAVLink data giver
class MAVLinkGiver(giver.Giver):
    def __init__(self):
        self.device = None
        self.baudrate = 0
        self.streamrate = 0
        self.conn = None

        self.last_heartbeat_time = datetime.min
        self.data = {
            "online": False,
            "armed": False,
            "roll": 0.0,
            "pitch": 0.0,
            "yaw": 0.0,
            "heading": 0.0,
            "throttle": 0.0,
        }

    def get_data(self):
        # Grab a MAVLink message
        msg = self.conn.recv_match(blocking=False)
        if msg:
            msg_type = msg.get_type()

            if msg_type == "HEARTBEAT":
                self.last_heartbeat_time = datetime.now()
                self.data["online"] = True
                self.data["armed"] = (msg.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED)
            if msg_type == "ATTITUDE":
                self.data["roll"] = msg.roll
                self.data["pitch"] = msg.pitch
                self.data["yaw"] = msg.yaw
            if msg_type == "VFR_HUD":
                self.data["heading"] = msg.heading
                self.data["throttle"] = msg.throttle
            if msg_type == "RC_CHANNELS_RAW":
                self.data["ch1"] = msg.chan1_raw
                self.data["ch2"] = msg.chan2_raw
                self.data["ch3"] = msg.chan3_raw
                self.data["ch4"] = msg.chan4_raw

        # Invalidate data (set to offline) if heartbeat not received for some time
        heartbeat_delta = datetime.now() - self.last_heartbeat_time
        if heartbeat_delta.seconds > HEARTBEAT_WAIT:
            self.data["online"] = False

        return self.data

    def prepare(self):
        # Create MAVLink serial instance
        conn = mavutil.mavlink_connection(self.device, baud=self.baudrate)
        self.conn = conn

        # Wait for heartbeat message to find system ID
        print("=> Waiting for MAVLink heartbeat...")
        conn.wait_heartbeat()
        print("=> Received MAVLink heartbeat!")

        # Request data to be sent a the given rate
        conn.mav.request_data_stream_send(conn.target_system, conn.target_component,
                                          mavutil.mavlink.MAV_DATA_STREAM_ALL,
                                          self.streamrate, 1)

    def cleanup(self):
        self.conn.close()

    def add_arguments(self, parser):
        parser.add_argument("-d", default=None, metavar="<device>", required=True,
            help="serial device")
        parser.add_argument("-b", type=int, default=115200, metavar="<baud rate>",
            help="baud rate (default: 115200)")
        parser.add_argument("-r", type=int, default=4, metavar="<stream rate>",
            help="stream rate (default: 4)")

    def verify_arguments(self, parser, args):
        if args.d is None:
            parser.error("argument -d: invalid choice: {} (choose a valid device)".format(args.d))

        if args.b < 0:
            parser.error("argument -b: invalid choice: {} (choose above 0)".format(args.b))

        if args.r < 0:
            parser.error("argument -r: invalid choice: {} (choose above 0)".format(args.r))

        self.device, self.baudrate, self.streamrate = args.d, args.b, args.r

        if args.i > 10:
            print("Warning! Low interval required for MAVLink to receive data consistently!")


giver.run(MAVLinkGiver())
