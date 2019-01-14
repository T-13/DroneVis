import sys

import giver

import math
import threading
from pymavlink import mavutil
from datetime import datetime


# MAVLink data giver
class MAVLinkGiver(giver.Giver):
    HEARTBEAT_WAIT = 1

    def __init__(self):
        self.device = None
        self.baudrate = 0
        self.streamrate = 0
        self.conn = None

        self.last_heartbeat_time = datetime.min
        self.data = {
            "online": False,
            "armed": False,
            "time_since_boot": 0,
            "roll": 0.0,
            "pitch": 0.0,
            "yaw": 0.0,
            "heading": 0.0,
            "throttle": 0.0,
            "rc_ch1": 0,
            "rc_ch2": 0,
            "rc_ch3": 0,
            "rc_ch4": 0,
            "rc_ch5": 0,
            "rc_ch6": 0,
            "rc_ch7": 0,
            "rc_ch8": 0,
            "rssi": 0,
            "load": 0.0,
            "battery_voltage": 0.0,
            "battery_current": 0.0,
            "battery_remaining": 0.0,
            "comm_drop_rate": 0,
            "comm_errors": 0,
        }

    def mav_read(self, stop):  # Threaded
        while not stop.is_set():
            # Grab a MAVLink message
            msg = self.conn.recv_match(blocking=True)
            if not msg:
                continue

            # Decode MAVLink message and save it to dataset
            msg_type = msg.get_type()
            if msg_type == "HEARTBEAT":
                self.last_heartbeat_time = datetime.now()
                self.data["online"] = True
                self.data["armed"] = (msg.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED)
            if msg_type == "ATTITUDE":
                self.data["time_since_boot"] = msg.time_boot_ms
                self.data["roll"] = msg.roll
                self.data["pitch"] = -msg.pitch
                self.data["yaw"] = msg.yaw - math.pi  # yaw comes in [0, 360], convert to [-180, 180]
            if msg_type == "VFR_HUD":
                self.data["heading"] = msg.heading
                self.data["throttle"] = msg.throttle
            if msg_type == "RC_CHANNELS_RAW":
                self.data["rc_ch1"] = msg.chan1_raw
                self.data["rc_ch2"] = msg.chan2_raw
                self.data["rc_ch3"] = msg.chan3_raw
                self.data["rc_ch4"] = msg.chan4_raw
                self.data["rc_ch5"] = msg.chan5_raw
                self.data["rc_ch6"] = msg.chan6_raw
                self.data["rc_ch7"] = msg.chan7_raw
                self.data["rc_ch8"] = msg.chan8_raw
                self.data["rssi"] = msg.rssi
            if msg_type == "SYS_STATUS":
                self.data["load"] = msg.load / 10.0
                self.data["battery_voltage"] = msg.voltage_battery / 1000.0
                self.data["battery_current"] = msg.current_battery / 100.0
                self.data["battery_remaining"] = msg.battery_remaining
                self.data["drop_rate_comm"] = msg.drop_rate_comm
                self.data["errors_comm"] = msg.errors_comm


            # Invalidate data (set to offline) if heartbeat not received for some time
            heartbeat_delta = datetime.now() - self.last_heartbeat_time
            if heartbeat_delta.seconds > self.HEARTBEAT_WAIT:
                self.data["online"] = False

    def get_data(self):
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

        # Start MAVLink reader/decoder thread
        self.mav_thread_stop = threading.Event()
        self.mav_thread = threading.Thread(target=self.mav_read, args=(self.mav_thread_stop,))
        self.mav_thread.daemon = True
        self.mav_thread.start()

    def cleanup(self):
        # Stop MAVLink thread gracefully
        self.mav_thread_stop.set()
        self.mav_thread.join()

        # Close MAVLink serial connection
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


giver.run(MAVLinkGiver())
