import sys

import giver

import random


# Random data giver
class RandomGiver(giver.Giver):
    def get_data(self):
        data = {
            "online": True,
            "roll": random.uniform(0.0, 360.0),
            "pitch": random.uniform(0.0, 360.0),
            "yaw": random.uniform(0.0, 360.0),
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
