
var Bot = {
    _isBot: true,
    _name: 'Bot',
    _board: null,
    _level: 3,
    _symbol: 'o',
    _turn: false,
    _states: {
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
    },
    _quantification: {
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
    },
    init: function (board, name) {
        this._board = board;
        this._name = name;
    },
    reset: function (name, level) {
        this._turn = false;
        this._name = name;
        this._level = level;
    },
    _evaluate: function (board, point, symbol) {
        var n = -4;
        var [i, j] = point;
        var h = '', v = '', d = '', u = '';
        var _board = {...board};
        _board[JSON.stringify([i, j])] = symbol;

        while (n <= 4) {
            h += _board[JSON.stringify([i + n, j])] == undefined ? '-' : _board[JSON.stringify([i + n, j])] == symbol ? 'o' : 'x';
            v += _board[JSON.stringify([i, j + n])] == undefined ? '-' : _board[JSON.stringify([i, j + n])] == symbol ? 'o' : 'x';
            d += _board[JSON.stringify([i + n, j + n])] == undefined ? '-' : _board[JSON.stringify([i + n, j + n])] == symbol ? 'o' : 'x';
            u += _board[JSON.stringify([i - n, j + n])] == undefined ? '-' : _board[JSON.stringify([i - n, j + n])] == symbol ? 'o' : 'x';
            n++;
        }
        
        var value = 0.0;
        for (var state in this._states) {
            if (h.includes(state)) {
                value += this._quantification[this._states[state]];
            }
            if (v.includes(state)) {
                value += this._quantification[this._states[state]];
            }
            if (d.includes(state)) {
                value += this._quantification['cross_' + this._states[state]];
            }
            if (u.includes(state)) {
                value += this._quantification['cross_' + this._states[state]];
            }
        }
        return value;
    },
    _update_available_points: function (board, point, availablePoint) {
        var pointIndex = availablePoint.indexOf(JSON.stringify(point));

        if (pointIndex >= 0){
            availablePoint.splice(pointIndex, 1)
        }

        var [i, j] = point;
        var x = -2, y = -2;

        while (y <= 2) {
            while (x <= 2) {
                var key = JSON.stringify([i + y, j + x]);
                if ((!(key in board)) && (availablePoint.indexOf(key) == -1)) {
                    availablePoint.push(key)
                }
                x++;
            }
            y++;
        }
    },
    
    _min: function (board, availablePoints, symbol, level) {
        console.log(level)
        if (!this._turn) {
            return
        }


        // var n = Math.max(4, Math.min(2 * Object.keys(board).length / (level + 1), 12));
        // n = Math.min(n, availablePoints.length)
        var n = availablePoints.length;
        var min_value = 2 * INFINITY;
        var min_point = null;
        for (var i = 0; i < n; i++) {
            if (!this._turn) {
                return [null, null]
            }

            var _availablePoints = [...availablePoints];
            var _board = {...board};
            var point = JSON.parse(_availablePoints[i]);
            this._push(point, _board, symbol, _availablePoints);
            var value = -this._evaluate(_board, point, symbol);
            if (-value >= INFINITY) {
                return [point, value];
            }
            if (level == this._level) {
                if (value < min_value) {
                    min_value = value;
                    min_point = point;
                }
            } else {
                var [point, max_value] = this._max(_board, _availablePoints, symbol == 'x' ? 'o' : 'x', level + 1)
                if (max_value < min_value) {
                    min_value = max_value;
                    min_point = point;
                }
                if (Math.abs(max_value) >= INFINITY) {
                    break;
                }
            }
        }
        return [min_point, min_value];
    },
    _max: function (board, availablePoints, symbol, level) {
        console.log(level)

        // var n = Math.max(4, Math.min(2 * Object.keys(board).length / (level + 1), 12));
        // n = Math.min(n, availablePoints.length)
        var n = availablePoints.length;

        var max_value = -2 * INFINITY;
        var max_point = null;
        for (var i = 0; i < n; i++) {
            if (!this._turn) {
                return [null, null]
            }

            var _availablePoints = [...availablePoints];
            var _board = {...board};
            var point = JSON.parse(_availablePoints[i]);
            this._push(point, _board, symbol, _availablePoints);
            var value = this._evaluate(_board, point, symbol);
            if (value >= INFINITY) {
                return [point, value];
            }
            if (level == this._level) {
                if (value > max_value) {
                    max_value = value;
                    max_point = point;
                }
            } else {
                var [point, min_value] = this._min(_board, _availablePoints, symbol == 'x' ? 'o' : 'x', level + 1)
                if (max_value < min_value) {
                    max_value = min_value;
                    max_point = point;
                }
                if (Math.abs(max_value) >= INFINITY) {
                    break;
                }
            }
        }
        return [max_point, max_value];
    },
    _get_point: function () {
        var _available_points = this._board.get_available_points();
        var _board = {...this._board.get_board()};
        var [point, value] = this._max(_board, _available_points, this._symbol, 0);
        console.log(`Bot select ${JSON.stringify(point)} with value: ${value}`);
        return point
    },
    _push: function (point, board, symbol, availablePoints) {
        if (board) {
            var [i, j] = point;
            board[JSON.stringify([i, j])] = symbol;
            this._update_available_points(board, point, availablePoints);
        } else {
            this._board.push(point)
        }
    },
    play: function () {
        this._turn = true;
        var point = this._get_point();
        if (point) {
            this._board.push(point[0], point[1], 'o');
        }
        this._turn = false;
    },
}
