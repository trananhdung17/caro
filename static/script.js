
const INFINITY = 999999999999;

var Player = {
    _name: null,
    _turn: false,
    _board: null,
    init: function (board, name) {
        this._board = board;
        this._name = name;
    },
    reset: function (name) {
        this._name = name;
    },
    play: function () {
        this._turn = true;
    },
    push: function () {

    }
}

var Bot = {
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
    init: function (board, level) {
        this._board = board;
        this._level = level
    },
    reset: function (level) {
        this._turn = false;
        this._level = level;
    },
    _evaluate: function (board, point, symbol) {
        var n = -4;
        var [i, j] = point;
        var h = '', v = '', d = '', u = '';
        var _board = {...board};
        _board[`${i}:${j}`] = symbol;

        while (n <= 4) {
            h += _board[`${i + n}:${j}`] == symbol ? 'o' : 'x';
            v += _board[`${i}:${j + n}`] == symbol ? 'o' : 'x';
            d += _board[`${i + n}:${j + n}`] == symbol ? 'o' : 'x';
            u += _board[`${i - n}:${j + n}`] == symbol ? 'o' : 'x';
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
        var pointIndex = availablePoint.indexOf(point)

        if (pointIndex >= 0){
            availablePoint.splice(pointIndex, 1)
        }

        var [i, j] = point;
        var x = -2, y = -2;

        while (y <= 2) {
            while (x <= 2) {
                if (board[i + y][j + x] == 0 && availablePoint.indexOf([i + y, j + x]) == -1) {
                    availablePoint.push([i + y, j + x])
                }
            }
        }
    },
    
    _min: function (board, availablePoints, symbol, level) {

        if (!this._turn) {
            return
        }

        var _availablePoints = [...availablePoints];
        var _board = {...board};

        var n = Math.min(2 * Object.keys(_board).length / (level + 1), 32);
        var min_value = 2 * INFINITY;
        var min_point = null;
        for (var i = 0; i < n; i++) {
            if (!this._turn) {
                return [null, null]
            }
            value = this._evaluate(_board, _availablePoints[i], symbol);
            if (value >= INFINITY) {
                return [_availablePoints[i], value];
            }
            this._push(_availablePoints[i], _board, symbol, _availablePoints);
            var point, max_value = this._max(_board, _availablePoints, -symbol, level + 1)
            if (max_value < min_value) {
                min_value = max_value;
                min_point = point;
            }
            if (Math.abs(max_value) >= INFINITY) {
                break;
            }
        }
        return [min_point, min_value];
    },
    _max: function (board, availablePoints, symbol, level) {

        var _availablePoints = [...availablePoints];
        var _board = {...board};

        var n = Math.min(2 * Object.keys(_board).length / (level + 1), 32);
        max_value = 2 * INFINITY;
        max_point = null;
        for (var i = 0; i < n; i++) {
            if (!this._turn) {
                return [null, null]
            }
            value = this._evaluate(_board, _availablePoints[i], symbol);
            if (value >= INFINITY) {
                return [_availablePoints[i], value];
            }
            this._push(_availablePoints[i], _board, symbol, _availablePoints);
            var [point, min_value] = this._min(_board, _availablePoints, -symbol, level + 1)
            if (max_value < min_value) {
                max_value = min_value;
                max_point = point;
            }
            if (Math.abs(max_value) >= INFINITY) {
                break;
            }
        }
        return [max_point, max_value];
    },
    _get_point: function () {
        var _available_points = this.board.get_available_points();
        var _board = {...this.board.get_board()};
        var [point, value] = this._max(_board, _available_points, this._symbol, 0);
        console.log(`Bot select ${JSON.stringify(point)} with value: ${value}`);
        return point
    },
    _push: function (point, board, symbol, availablePoints) {
        if (board) {
            var [i, j] = point;
            board[`${i}:${j}`] = symbol;
            this._update_available_points(board, point, availablePoints);
        } else {
            this.board.push(point)
        }
    },
    play: function () {
        this._turn = true;
        var point = this._get_point();
        if (point) {
            this.board.push(point);
        }
        this._turn = false;
    },
}

var Board = {
    $el: null,
    _board: {},
    _availablePoints: [],
    _isEnable: false,
    $lastActive: null,

    init: function (player, bot) {
        this.$el = $('.c_board');
        this.$panel = $('.c_panel');
        this.$el.empty();
        this.bot = bot;
        this.bot.init(this);
        this.player = player;
        this.player.init(this, null);
    },
    start: function (first) {
        if (first == 'bot') {
            this.bot.play();
        } else {
            this.player.play();
        }
    },
    new_game: function () {
        this.load();

        var player_name = this.$panel.find('#player_name').value;
        var game_level = this.$panel.find('#game_level').value;
        var go_first = this.$panel.find('#go_first').value;

        this._board = {};
        this._availablePoints = [[10, 10]];
        this.player.reset(player_name);
        this.bot.reset(game_level);

        this.start(go_first);
    },
    load: function () {
        var self = this;
        this.$el.empty();
        for (var i = -10; i <= 10; i++) {
            var $row = $('<div class="row"></div>');
            for (var j = -10; j <= 10; j++) {
                var $cell = $(`<span class="cell" data_i="${i}" data_j="${j}"></span>`);
                $cell.click((event => {
                    if (this.isEnable()) {
                        this.disable();
                        var y = event.target.getAttribute('data_i');
                        var x = event.target.getAttribute('data_j');
                        this.push(y, x, 'x');

                        console.log(event);
                    }
                }))
                $row.append($cell);

            }
            this.$el.append($row)
        }
    },
    enable: function () {
        this._isEnable = true
    },
    disable: function () {
        this._isEnable = false
    },
    isEnable: function () {
        return this._isEnable;
    },
    push: function (i, j, symbol) {
        var $cell = this.$el.find(`span[data_i="${i}"][data_j="${j}"]`);
        if (this.$lastActive) {
            this.$lastActive.removeClass('active');
        }
        $cell.addClass('active');
        $cell.addClass(symbol + '_cell');
        this.$lastActive = $cell;
    },

    get_available_points: function () {
        return this._availablePoints;
    },
    get_board: function () {
        return this._board;
    },

    _update_available_points: function (point) {
        var pointIndex = this._availablePoints.indexOf(point)

        if (pointIndex >= 0){
            this._availablePoints.splice(pointIndex, 1)
        }

        var i = point[0], j = point[1]
        var x = -2, y = -2;

        while (y <= 2) {
            while (x <= 2) {
                if (this._board[i + y][j + x] == 0 && this._availablePoints.indexOf([i + y, j + x]) == -1) {
                    this._availablePoints.push([i + y, j + x])
                }
            }
        }
    }

}


$(document).ready(() => {

    Board.init(Player, Bot);
    Board.load();

    $('#action_new').click(event => {
        Board.new_game();
    })
});
