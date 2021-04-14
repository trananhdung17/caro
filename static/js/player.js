
var Player = {
    _name: null,
    _turn: false,
    _board: null,
    _symbol: 'x',
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
    push: function (y, x) {
        if (!this._turn) {
            return;
        }
        this._turn = false;
        this._board.push(y, x, this._symbol)
    }
}
