import sys

import giver

import random


# Random data giver
class RandomGiver(giver.Giver):
    def get_data(self):
        data = {
            "online": True,
            "armed": False,
            "roll": random.uniform(-3.14, 3.14),
            "pitch": random.uniform(-3.14, 3.14),
            "yaw": random.uniform(0.0, 6.28),
            "heading": random.uniform(0.0, 360.0),
            "throttle": random.uniform(0.0, 100.0),
            "rc_ch1": random.uniform(1000.0, 2000.0),
            "rc_ch2": random.uniform(1000.0, 2000.0),
            "rc_ch3": random.uniform(1000.0, 2000.0),
            "rc_ch4": random.uniform(1000.0, 2000.0),
            "rc_ch5": random.uniform(1000.0, 2000.0),
            "rc_ch6": random.uniform(1000.0, 2000.0),
            "rc_ch7": random.uniform(1000.0, 2000.0),
            "rc_ch8": random.uniform(1000.0, 2000.0)
        }

        return data

    def prepare(self):
        pass

    def cleanup(self):
        pass

    def add_arguments(self, parser):
        pass

    def verify_arguments(self, parser, args):
        pass


giver.run(RandomGiver())
