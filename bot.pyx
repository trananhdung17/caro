     # Created by trananhdung on 01/04/2021
# -*- coding: utf-8 -*-

from libc.stdlib cimport malloc

cdef long int INFINITY = 999999999999


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
        state = self._push(point)
        if state == 'fail':
            if self.is_bot:
                self.play()
            else:
                return 'fail'
        elif state == 'pass':
            return point, None
        else:
            return point, state

    def set_map(self, map):
        self.map = map


class Player(BasePlayer):

    state = {
        'point': None,
    }

    def push(self, point):
        self.state.update(point=point)
        return self.play()

    def _get_point(self):
        return self.state.get('point')

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
    'x-ooo-x': 'three',
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
    'o_for': 50000000,
    'cross_o_for': 50000000,
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
_symbols = {
    1: 'o',
    -1: 'x',
    0: '-'
}

def _get_lines(map, point, symbol=None):
    """

    :return:
    """
    cdef int i, j
    i, j = point
    cdef str v = ''
    cdef str h = ''
    cdef str d = ''
    cdef str u = ''
    map[point] = symbol
    cdef int n = -4
    while n <= 4:
        v += _symbols[symbol * map.get((i + n, j), 0)]
        h += _symbols[symbol * map.get((i, j + n), 0)]
        d += _symbols[symbol * map.get((i + n, j + n), 0)]
        u += _symbols[symbol * map.get((i - n, j + n), 0)]
        n += 1
    del map[point]
    return v, h, d, u

cpdef long int _estimate(map, point, symbol=None):
    """

    :param map: dict
    :param point: (int, int)
    :param symbol: 1 or -1
    :return: int
    """

    v, h, d, u = _get_lines(map, point, symbol)
    cdef long int value = 0
    for state in _states:
        if state in v:
            value += _quantification[_states[state]]
        if state in h:
            value += _quantification[_states[state]]
        if state in d:
            value += _quantification['cross_' + _states[state]]
        if state in u:
            value += _quantification['cross_' + _states[state]]
    return value

class Bot(Player):

    _symbols = {
        1: 'o',
        -1: 'x',
        0: '-'
    }

    def __init__(self, name, symbol, map, level=1):
        super(Bot, self).__init__(name, symbol, map)
        self.max_depth = level
        self.is_bot = True


    def _get_point(self):

        _map = self.map.copy()
        available_points = self._get_available_points()

        if len(available_points) == 1:
            return available_points[0]

        _value_points = [(_estimate(_map, p, self.symbol) * 2 + _estimate(_map, p, -self.symbol), p) for p in available_points]
        _value_points.sort(key=lambda x: x[0], reverse=True)

        _max_point = None
        _max_value = -(2 * INFINITY)
        cdef long int value
        for v, p in _value_points[:20]:

            value = self._min(_map, available_points, p,  self.symbol, 0)

            if value > _max_value:
                _max_value = value
                _max_point = p

            if abs(value) >= INFINITY:
                break

        print('Selected point: %s with value is %s' % (str(_max_point), _max_value))
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
        _available_points = [*available_points]
        cdef long int current_value = _estimate(map, point, symbol)

        if current_value >= INFINITY:
            return -current_value

        if level == self.max_depth:
            return -current_value

        map[point] = symbol
        self._update_available_points(map, _available_points, point)

        _value_points = [(_estimate(map, p, -symbol) + _estimate(map, p, symbol) * 2, p) for p in _available_points]
        _value_points.sort(key=lambda x: x[0], reverse=True)

        cdef long int _max_value = -(3 * INFINITY)
        cdef long int value

        n = min(len(map), 8)
        for v, p in _value_points[:n]:

            value = self._min(map, _available_points, p, -symbol, level + 1)

            if value > _max_value:
                _max_value = value

            if abs(value) >= INFINITY:
                break

        map.pop(point)
        return _max_value

    def _min(self, map, available_points, point, symbol, level=0):
        """

        :param map:
        :param available_points:
        :param point:
        :param symbol:
        :param level:
        :return:
        """
        _available_points = [*available_points]
        cdef long int current_value = _estimate(map, point, symbol)

        if current_value >= INFINITY:
            return current_value

        if level == self.max_depth:
            return current_value

        map[point] = symbol
        self._update_available_points(map, _available_points, point)

        _value_points = [(_estimate(map, p, -symbol) + _estimate(map, p, symbol) * 2, p) for p in _available_points]
        _value_points.sort(key=lambda x: x[0], reverse=True)

        cdef long int _min_value = 3 * INFINITY
        cdef long int value

        n = min(len(map), 8)
        for v, p in _value_points[:n]:

            value = self._max(map, _available_points, p, -symbol, level + 1)

            if value < _min_value:
                _min_value = value

            if abs(value) >= INFINITY:
                break
        map.pop(point)
        return _min_value

    def _update_available_points(self, map, available_points, point):
        """

        :param point:
        :return:
        """
        cdef int i, j, x, y
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
