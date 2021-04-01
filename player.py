# Created by trananhdung on 01/04/2021
# -*- coding: utf-8 -*-

import asyncio
import selectors


class BasePlayer(object):

    def __init__(self, name, symbol=-1, map=None):
        """

        :param name:
        :param map:
        :param symbol:
        """
        self.name = name
        self.map = map
        self.symbol = symbol
        self.turn = False
        self.is_bot = False

    def _push(self, point):
        return self.map.push(point, self.symbol)

    def _get_point(self):
        print('Turn %s' % self.name)
        i = int(input('Enter i: '))
        j = int(input('Enter j: '))
        return i, j

    def play(self):
        if not self.turn:
            return False
        point = self._get_point()
        if self._push(point) == 'fail' and self.is_bot:
            self.play()
        return point

    def set_map(self, map):
        self.map = map


class Player(BasePlayer):

    state = {
        'point': None,
    }

    def push(self, point):
        self.state.update(point=point)
        self.play()

    def _get_point(self):
        return self.state.get('point')

