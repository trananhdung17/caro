# Created by trananhdung on 31/03/2021
# -*- coding: utf-8 -*-

import pyximport
pyximport.install()

from bot import Player
from bot import Bot


class Map(object):
    """
    map(i,j)
   i^
    |
    |
    |
    |____________>
                 j

    """

    _symbols = {
        1: 'o',
        -1: 'x',
        0: '-'
    }

    def __init__(self, player, turn, bot_level=1, test=False):
        """

        :param player: str
        """
        self.map = {}
        self._available_cells = [(0, 0)]
        self.bot = Bot('Bot', 1, map=self, level=bot_level)
        if isinstance(player, Player):
            self.player = player
            self.player.set_map(self)
        else:
            self.player = Player(player, -1, map=self)
        self.players = {
            1: self.bot,
            -1: self.player
        }
        self.turn = turn
        self.is_end = False

    def start(self):
        """

        :return:
        """
        self.is_end = False
        player = self.players[self.turn]
        player.turn = True
        if player.is_bot:
            return player.play()
        else:
            return None

    def bot_play(self):
        return self.bot.play()

    def stop(self):
        self.is_end = True

    def get_lines(self, i, j):
        """

        :param i:
        :param j:
        :return:
        """
        v = h = d = u = ''
        symbol = self.map[(i, j)]
        n = -4
        while n <= 4:
            v += self._symbols[symbol * self.map.get((i + n, j), 0)]
            h += self._symbols[symbol * self.map.get((i, j + n), 0)]
            d += self._symbols[symbol * self.map.get((i + n, j + n), 0)]
            u += self._symbols[symbol * self.map.get((i - n, j + n), 0)]
            n += 1
        print(v, h, d, u)
        return v, h, d, u

    def get_available_cells(self):
        return self._available_cells

    def _check_end_game(self, point):
        """

        :param point: (int, int)
        :return:
        """
        for line in self.get_lines(*point):
            if 'ooooo' in line:
                print('End Game')
                return True
        else:
            return False

    def _do_end_game(self):
        """

        :return:
        """
        self.is_end = True
        msg = f'{self.players[self.turn].name} is Winner'
        print(msg)
        return msg

    def _update_available_cell(self, point):
        """

        :param point:
        :return:
        """
        i, j = point
        if point in self._available_cells:
            self._available_cells.remove(point)

        for x in range(-3, 4):
            for y in range(-3, 4):
                cell = (i + x, j + y)
                if cell not in self._available_cells and cell not in self.map:
                    self._available_cells.append(cell)

    def get(self, point, default):
        """

        :param point: (int, int)
        :param default:
        :return:
        """
        return self.map.get(point, default)

    def copy(self):
        """

        :return:
        """
        return self.map.copy()

    def push(self, point, symbol):
        """

        :param point:
        :param symbol:
        :return:
        """
        if self.map.get(point, 0) != 0:
            return 'fail'
        self.map[point] = symbol
        self._update_available_cell(point)
        self.players[self.turn].turn = False
        self.turn = -self.turn
        self.players[self.turn].turn = True
        if self._check_end_game(point):
            return self._do_end_game()
        else:
            return 'pass'


if __name__ == '__main__':
    """
    Test in console
    """
    game = Map('Alex', turn=1, bot_level=3)
    game.start()
