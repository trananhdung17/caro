# Created by trananhdung on 01/04/2021
# -*- coding: utf-8 -*-

from player import Player
from map import Map


class Game(object):
    def __init__(self):
        self.player = None
        self.map = None

    def new(self, player_name, level):
        self.stop()
        self.player = Player(player_name, -1)
        self.map = Map(self.player, -1, level)
        return self.start()

    def start(self):
        if self.map:
            return self.map.start()

    def stop(self):
        if self.map:
            return self.map.stop()
