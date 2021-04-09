# Created by trananhdung on 01/04/2021
# -*- coding: utf-8 -*-

from player import Player

INFINITY = 999999999999
ESTIMATION_TIMES = 0


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
        'oo-oo': 'four',
        'ooo-o': 'four',
        'o-ooo': 'four',
        '-oooox': 'four',
        '-ooo--': 'o_three',
        '-o-oo-': 'o_three',
        '-oo-o-': 'o_three',
        '--ooo-': 'o_three',
        'xooo--': 'three',
        'xo-oo-': 'three',
        'xoo-o-': 'three',
        '--ooox': 'three',
        '-o-oox': 'three',
        '-oo-ox': 'three',
        '-oo-': 'o_two',
        '-o-o-': 'o_two',
        '-oox': 'two',
        'xoo-': 'two',
    }
    _quantification = {
        'win': INFINITY,
        'cross_win': INFINITY,
        'o_for': 5000000,
        'cross_o_for': 5000000,
        'four': 300000,
        'cross_four': 330000,
        'o_three': 260000,
        'cross_o_three': 280000,
        'three': 20000,
        'cross_three': 45000,
        'o_two': 400,
        'cross_o_two': 900,
        'two': 30,
        'cross_two': 80,
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
        map[point] = symbol
        n = -4
        while n <= 4:
            v += self._symbols[symbol * map.get((i + n, j), 0)]
            h += self._symbols[symbol * map.get((i, j + n), 0)]
            d += self._symbols[symbol * map.get((i + n, j + n), 0)]
            u += self._symbols[symbol * map.get((i - n, j + n), 0)]
            n += 1
        del map[point]
        return v, h, d, u

    def _estimate(self, map, point, symbol=None):
        """

        :param map: dict
        :param point: (int, int)
        :param symbol: 1 or -1
        :return: int
        """
        global ESTIMATION_TIMES
        ESTIMATION_TIMES += 1
        print("Estimation times: %s" % ESTIMATION_TIMES)
        v, h, d, u = self._get_lines(map, point, symbol)
        value = 0
        for state in self._states:
            if state in v:
                value += self._quantification[self._states[state]]
            if state in h:
                value += self._quantification[self._states[state]]
            if state in d:
                value += self._quantification['cross_' + self._states[state]]
            if state in u:
                value += self._quantification['cross_' + self._states[state]]
        return value

    def _get_point(self):

        _map = self.map.copy()
        available_points = self._get_available_points()

        if len(available_points) == 1:
            return available_points[0]

        _value_points = [(self._estimate(_map, p, self.symbol) + self._estimate(_map, p, -self.symbol), p) for p in available_points]
        _value_points.sort(key=lambda x: x[0], reverse=True)

        _max_point = None
        _max_value = -(2 * INFINITY)
        for v, p in _value_points[:20]:

            value = self._min(_map, available_points, p,  self.symbol, 0)[0]

            if value > _max_value:
                _max_value = value
                _max_point = p

            if abs(value) >= INFINITY:
                break

        print('Selected point: %s with value is %s' % (str(_max_point), _max_value))
        global ESTIMATION_TIMES
        ESTIMATION_TIMES = 0
        return _max_point

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
        _available_points = [*available_points]
        _map[point] = symbol

        current_value = self._estimate(_map, point, symbol)

        if current_value >= INFINITY:
            return -current_value, point

        if level == min(self.max_depth, int((len(self.map.map) + 2) / 3)):
            return -current_value, point

        self._update_available_points(_map, _available_points, point)

        _value_points = [(self._estimate(_map, p, -symbol) + self._estimate(_map, p, symbol), p) for p in _available_points]
        _value_points.sort(key=lambda x: x[0], reverse=True)

        _max_point = None
        _max_value = -(2 * INFINITY)

        n = min(max(8, int((len(_map) + 8) / (level + 1))), 24)
        for v, p in _value_points[:n]:

            value = self._min(_map, _available_points, p, -symbol, level + 1)[0]

            if value > _max_value:
                _max_value = value
                _max_point = p

            if abs(value) >= INFINITY:
                break

        return _max_value, _max_point

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
        _available_points = [*available_points]
        _map[point] = symbol

        current_value = self._estimate(_map, point, symbol)

        if current_value >= INFINITY:
            return current_value, point
        if level == min(self.max_depth, int((len(self.map.map) + 1) / 2)):
            return current_value, point

        self._update_available_points(_map, _available_points, point)

        _value_points = [(self._estimate(_map, p, -symbol) + self._estimate(_map, p, symbol), p) for p in _available_points]
        _value_points.sort(key=lambda x: x[0], reverse=True)

        _min_value = 2 * INFINITY
        _min_point = None

        n = min(max(8, int((len(_map) + 8) / (level + 1))), 24)
        for v, p in _value_points[:n]:

            value = self._max(_map, _available_points, p, -symbol, level + 1)[0]

            if value < _min_value:
                _min_value = value
                _min_point = p

            if abs(value) >= INFINITY:
                break

        return _min_value, _min_point

    def _update_available_points(self, map, available_points, point):
        """

        :param point:
        :return:
        """
        i, j = point
        if point in available_points:
            available_points.remove(point)

        for x in range(-2, 3):
            for y in range(-2, 3):
                cell = (i + x, j + y)
                if cell not in available_points and cell not in map:
                    available_points.append(cell)

    def _get_available_points(self):
        """

        :return:
        """
        return self.map.get_available_cells().copy()
