# Created by trananhdung on 01/04/2021
# -*- coding: utf-8 -*-

from player import Player

INFINITY = 999999999999


class Bot(Player):

    _symbols = {
        1: 'o',
        -1: 'x',
        0: '-'
    }

    _states = {
        'ooooo': 'win',
        '-oooo-': 'o_for',
        'xoooo-': 'four',
        '-oooox': 'four',
        '-ooo--': 'o_three',
        '--ooo-': 'o_three',
        'xooo--': 'three',
        '--ooox': 'three',
        '-oo-': 'o_two',
        '-oox': 'two',
        'xoo-': 'two',
        '-o-': 'o_one',
        'xo-': 'one',
        '-ox': 'one'
    }
    _quantification = {
        'win': INFINITY,
        'cross_win': INFINITY,
        'o_for': 5000000,
        'cross_o_for': 5000000,
        'four': 200000,
        'cross_four': 230000,
        'o_three': 260000,
        'cross_o_three': 280000,
        'three': 20000,
        'cross_three': 25000,
        'o_two': 400,
        'cross_o_two': 550,
        'two': 30,
        'cross_two': 40,
        'o_one': 3,
        'cross_o_one': 3,
        'one': 1,
        'cross_one': 2
    }

    def __init__(self, name, symbol, map, level=1):
        super(Bot, self).__init__(name, symbol, map)
        self.max_depth = level
        self.is_bot = True

    def _get_lines(self, map, point, symbol=None):
        """

        :return:
        """
        i, j = point
        v = h = d = u = ''
        symbol = symbol or self.symbol
        n = -4
        while n <= 4:
            v += n == 0 and self._symbols[self.symbol] or self._symbols[symbol * map.get((i + n, j), 0)]
            h += n == 0 and self._symbols[self.symbol] or self._symbols[symbol * map.get((i, j + n), 0)]
            d += n == 0 and self._symbols[self.symbol] or self._symbols[symbol * map.get((i + n, j + n), 0)]
            u += n == 0 and self._symbols[self.symbol] or self._symbols[symbol * map.get((i - n, j + n), 0)]
            n += 1
        return v, h, d, u

    def _estimate(self, map, point, symbol=None):
        """

        :param point: tuple or list of 2 int (int, int)
        :return:
        """
        v, h, d, u = self._get_lines(map, point, symbol)
        # print(v, h, d, u)
        lines = []
        for state in self._states:
            if state in v:
                lines.append(self._states[state])
            if state in h:
                lines.append(self._states[state])
            if state in d:
                lines.append('cross_' + self._states[state])
            if state in u:
                lines.append('cross_' + self._states[state])
        value = sum([self._quantification[line] for line in lines])
        return value

    def _get_point(self):
        points = []
        _map = self.map.copy()
        available_points = self._get_available_points()

        _value_points = [(self._estimate(_map, p, self.symbol) + self._estimate(_map, p, -self.symbol), p) for p in available_points]
        _value_points.sort(key=lambda x: x[0], reverse=True)
        for v, p in _value_points[:8]:
            points.append((self._min(_map, available_points, p,  self.symbol, 0)[0], p))

        points.sort(key=lambda x: x[0])
        value, point = points[-1]
        print('Selected point: %s with value is %s' % (str(point), value))
        return point

    def _max(self, map, available_points, point, symbol, level=0):
        """

        :param map:
        :param available_points:
        :param point:
        :param symbol:
        :param level:
        :return:
        """
        _map = map.copy()
        _available_points = available_points.copy()
        _map[point] = symbol
        current_value = self._estimate(_map, point, symbol)
        if current_value >= INFINITY:
            return -current_value, point

        if level == self.max_depth:
            return -current_value, point

        self._update_available_points(_map, _available_points, point)
        _value_points = [(self._estimate(_map, p, -symbol) + self._estimate(_map, p, symbol), p) for p in _available_points]
        _value_points.sort(key=lambda x: x[0], reverse=True)
        self._update_available_points(_map, _available_points, point)

        points = []
        for v, p in _value_points[:8]:
            points.append((self._min(_map, _available_points, p, -symbol, level + 1)[0], p))

        points.sort(key=lambda x: x[0])
        return points[-1]

    def _min(self, map, available_points, point, symbol, level=0):
        """

        :param map:
        :param available_points:
        :param point:
        :param symbol:
        :param level:
        :return:
        """
        _map = map.copy()
        _available_points = available_points.copy()
        _map[point] = symbol
        current_value = self._estimate(_map, point, symbol)
        if current_value >= INFINITY:
            return current_value, point
        if level == self.max_depth:
            return current_value, point
        self._update_available_points(_map, _available_points, point)
        _value_points = [(self._estimate(_map, p, -symbol) + self._estimate(_map, p, symbol), p) for p in _available_points]
        _value_points.sort(key=lambda x: x[0], reverse=True)

        points = []
        for v, p in _value_points[:8]:
            points.append((self._max(_map, _available_points, p, -symbol, level + 1)[0], p))

        points.sort(key=lambda x: x[0])
        return points[0]

    def _update_available_points(self, map, available_points, point):
        """

        :param point:
        :return:
        """
        # print('Update available point: %s' % str(point))
        i, j = point
        if point in available_points:
            available_points.remove(point)

        for x in range(-2, 3):
            for y in range(-2, 3):
                cell = (i + x, j + y)
                if cell not in available_points and cell not in map:
                    available_points.append(cell)
        # print('Available points: %s' % str(available_points))

    def _get_available_points(self):
        """

        :return:
        """
        return self.map.get_available_cells().copy()
