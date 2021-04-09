var Player = {
    _name: null,
    _turn: false,
    _map: null,
    init: function (map, name) {
        this._map = map;
        this._name = name;
    },
    play: function () {
        this._turn = true;
    },
    push: function () {

    }
}

var Bot = {
    _map: null,
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
    init: function (map) {
        this._map = map;
    },
    reset: function (level) {
    },
    _evaluate: function () {},
    _update_available_points: function () {},
    _get_available_points: function () {},
    _min: function (map, symbol, level) {
        var
        var n = 12;
        for (var i = 0; i < n; i++) {

        }
    },
    _max: function (map, symbol, level) {
        var available_points = this._get_available_points()
    },
    _get_point: function () {},
    play: function () {
    },
}

var Map = {
    $el: null,
    _map: null,
    _availablePoints: [],
    _isEnable: false,
    $lastActive: null,

    init: function (player, bot) {
        this.$el = $('.c_map');
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

        this._map = new Array(21).fill(new Array(21).fill(0));
        this._availablePoints = [[10, 10]];
        this.player.reset(player_name);
        this.bot.reset(level);

        this.start(go_first);
    }
    load: function () {
        var self = this;
        this.$el.empty();
        for (var i = 0; i <= 21; i++) {
            var $row = $('<div class="row"></div>');
            for (var j = 0; j <= 21; j++) {
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
    _send: function (i, j) {
        var data = {
            i: i,
            j: j
        }
        $.ajax({
            type: "POST",
            url: '/api/player/push',
            data: data,
            success: (resp) => {
                if (resp.point) {
                    this.push(resp.point[0], resp.point[1], 'o');
                    this.enable();
                }
            },
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
        });
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

    _update_available_points: function (point) {
        var pointIndex = this._availablePoints.indexOf(point)

        if (pointIndex >= 0){
            this._availablePoints.splice(pointIndex, 1)
        }

        var i = point[0], j = point[1]
        var x = -2, y = -2;

        while (y <= 2) {
            while (x <= 2) {
                if (this._map[i + y][j + x] == 0 && this._availablePoints.indexOf([i + y, j + x]) == -1) {
                    this._availablePoints.push([i + y, j + x])
                }
            }
        }
    }

}



$(document).ready(() => {

    var map = {
        _isEnable: false,
        $lastActive: null,
        $el: $('.c_map'),
        load: function () {
            var self = this;
            self.empty();
            for (var i = -10; i <= 10; i++) {
                var $row = $('<div class="row"></div>');
                for (var j = -10; j <= 10; j++) {
                    var $cell = $(`<span class="cell" data_i="${i}" data_j="${j}"></span>`);
                    $cell.click((event => {
                        if (self.isEnable()) {
                            self.disable();
                            var y = event.target.getAttribute('data_i');
                            var x = event.target.getAttribute('data_j');
                            self.push(y, x, 'x');
                            send(y, x);
                            console.log(event);
                        }
                    }))
                    $row.append($cell);

                }
                self.$el.append($row)
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
        empty: function () {
            this.$el.empty();
        }
    }

    var

    $('#action_new').click(event => {
        var data = {
            game_level: $('#game_level')[0].value,
            player_name: $('#player_name')[0].value
        }
        $.ajax({
            type: "POST",
            url: '/',
            data: data,
            success: (resp) => {
                if (resp.success) {
                    map.load();
                    map.enable();
                }
            },
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
        });
    })

    map.load();
})