# Created by trananhdung on 01/04/2021
# -*- coding: utf-8 -*-

from flask import Flask, Response, request, jsonify
import os
import json
from urllib import parse as urlparse
from game import Game


def root_dir():  # pragma: no cover
    return os.path.abspath(os.path.dirname(__file__))


def get_file(filename):  # pragma: no cover
    try:
        src = os.path.join(root_dir(), 'static', filename)
        # Figure out how flask returns static files
        # Tried:
        # - render_template
        # - send_file
        # This should not be so non-obvious
        return open(src).read()
    except IOError as exc:
        return str(exc)


app = Flask('Caro')
game = Game()


@app.route('/', methods=['GET', 'POST'])
def index():  # pragma: no cover
    if request.method == 'GET':
        content = get_file('index.html')
        return Response(content, mimetype="text/html")
    else:
        data = urlparse.parse_qs(request.data.decode())
        game_level = int(data['game_level'][0])
        player_name = data['player_name'][0]
        point = game.new(player_name, game_level)
        return jsonify({'success': True, 'bot': point})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def get_resource(path):  # pragma: no cover
    mimetypes = {
        ".css": "text/css",
        ".html": "text/html",
        ".js": "application/javascript",
    }
    ext = os.path.splitext(path)[1]
    mimetype = mimetypes.get(ext, "text/html")
    content = get_file(path)
    return Response(content, mimetype=mimetype)


@app.route('/api/player/push', methods=['POST'])
def push():
    data = urlparse.parse_qs(request.data.decode())
    i = int(data['i'][0])
    j = int(data['j'][0])
    game.player.push((i, j))
    point = game.map.bot_play()

    return jsonify({'success': True, 'point': point})


def run():
    app.run(host='0.0.0.0', port=9090)


if __name__ == '__main__':
    run()
