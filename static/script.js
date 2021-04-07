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

    var send = (i, j) => {
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
                    map.push(resp.point[0], resp.point[1], 'o');
                    map.enable();
                }
            },
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
        });
    }

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