
var Board = {
    $el: null,
    _board: {},
    _availablePoints: [],
    _isEnable: false,
    $lastActive: null,
    _turn: 0,
    _players: {
        1: null,
        0: null,
    },

    init: function (player1, player2) {
        this.$el = $('.c_board');
        this.$panel = $('.c_panel');
        this.$el.empty();
        player1.init(this);
        player2.init(this);
        this._players = {
            0: player1,
            1: player2,
        }
    },
    start: function (first) {
        this.enable();
        this.play(first)
    },
    play: function (turn) {
        this._turn = turn;
        this._players[turn].play();
    },
    new_game: function () {
        this.load();

        var player_name = this.$panel.find('#player_name').val();
        var game_level = parseInt(this.$panel.find('#game_level').val());
        var go_first = this.$panel.find('#go_first').val();
        var first = 0;
        if (go_first == 'bot') {
            first = 1;
        }
        this._board = {};
        this._availablePoints = [[0, 0]];
        this._players[0].reset(player_name)
        this._players[1].reset('Bot', game_level)

        this.start(first);
    },
    load: function () {
        var self = this;
        this.$el.empty();
        for (var i = -10; i <= 10; i++) {
            var $row = $('<div class="row"></div>');
            for (var j = -10; j <= 10; j++) {
                var $cell = $(`<span class="cell" data_i="${i}" data_j="${j}"></span>`);
                $cell.click((event => {
                    var y = parseInt(event.target.getAttribute('data_i'));
                    var x = parseInt(event.target.getAttribute('data_j'));
                    this._players[this._turn].push(y, x);

                    console.log(event);
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

        if (this.isEnable()) {
            var $cell = this.$el.find(`span[data_i="${i}"][data_j="${j}"]`);
            if (this.$lastActive) {
                this.$lastActive.removeClass('active');
            }
            $cell.addClass('active');
            $cell.addClass(symbol + '_cell');
            this.$lastActive = $cell;

            this._board[`${i}:${j}`] = symbol;
            this._update_available_points([i, j]);
        }
        this.play(1 - this._turn);
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
        var y = -2;

        while (y <= 2) {
            var x = -2
            while (x <= 2) {
                if ((!(`${y}:${x}` in this._board)) && (this._availablePoints.indexOf([i + y, j + x]) == -1)) {
                    this._availablePoints.push([i + y, j + x])
                }
                x++;
            }
            y++;
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
