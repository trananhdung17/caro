$(document).ready(() => {

    var push = (i, j, symbol) => {
        $(`span[data_i="${i}"][data_j="${j}"]`).addClass(symbol + '_cell')
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
                    push(resp.point[0], resp.point[1], 'o')
                }
            },
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
        });
    }

    var load = () => {
        var $map = $('.c_map');
        $map.empty();
        for (var i = -10; i <= 10; i++) {
            var $row = $('<div class="row"></div>');
            for (var j = -10; j <= 10; j++) {
                var $cell = $(`<span class="cell" data_i="${i}" data_j="${j}"></span>`);
                $cell.click((event => {
                    var y = event.target.getAttribute('data_i')
                    var x = event.target.getAttribute('data_j')
                    push(y, x, 'x');
                    send(y, x);
                    console.log(event);
                }))
                $row.append($cell);

            }
            $map.append($row)
        }
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
                    load();
                }
            },
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
        });
    })
    
    load();
})