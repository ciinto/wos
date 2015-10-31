(function () {
    var HOST, PORT, SNAKE_LENGTH, STAGE_HEIGHT, STAGE_WIDTH, Snake, autoClient, checkCollisions, fs, http, io, port, send404, server, snakes, socket, sys, tick, updateState, url, util, foodRender;
    var tFood = [];
    sys = require('sys');
    http = require('http');
    util = require('util');
    url = require('url');
    io = require('socket.io');
    fs = require('fs');
    HOST = null;
    PORT = 5000;
    STAGE_WIDTH = 59;
    STAGE_HEIGHT = 39;
    SNAKE_LENGTH = 3;
    Array.prototype.remove = function (e) {
        var t, _ref;
        if ((t = this.indexOf(e)) > -1) {
            return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
        }
    };
    Array.prototype.indexInArray = function (a) {
        for (i = 0; i < this.length; i++) {
            var is_same = (this[i].length == a.length) && this[i].every(function (element, index) {
                return element === a[index];
            });
            if(is_same === true){
                return i;
            }
        }
        return false;
    }
    autoClient = 1;
    snakes = [];
    /* Server */
    server = http.createServer(function (req, res) {
        var path;
        path = url.parse(req.url).pathname;
        switch (path) {
        case '/':
        case '/index.html':
        case '/client.js':
        case '/jquery.js':
        case '/style.css':
            if (path === '/') {
                path = '/index.html';
            }
            return fs.readFile(__dirname + path, function (err, data) {
                if (err) {
                    send404(res);
                } else {
                    res.writeHead(200, 'text/html');
                }
                res.write(data, 'utf8');
                return res.end();
            });
        default:
            return send404(res);
        }
    });
    send404 = function (res) {
        res.writeHead(404);
        res.write('404');
        return res.end();
    };
    server.listen(port = Number(process.env.PORT || PORT));
    /* Snake Class */
    Snake = (function () {
        function Snake(id) {
            this.id = id.id;
            this.reset();
            this.name = id.name;
            this.kills = 0;
            this.deaths = 0;
            this.tfoo = tFood;
        }
        Snake.prototype.addKill = function (type) {
            if (type !== 'eat') {
                this.kills++;
            }
            return this.length = this.elements.unshift([-1, -1]);
        };
        Snake.prototype.reset = function () {
            var i, rH;
            rH = Math.floor(Math.random() * 49);
            this.deaths++;
            this.length = SNAKE_LENGTH;
            this.direction = "right";
            return this.elements = (function () {
                var _ref, _results;
                _results = [];
                for (i = _ref = this.length; _ref <= 1 ? i <= 1 : i >= 1; _ref <= 1 ? i++ : i--) {
                    _results.push([-i, rH]);
                }
                return _results;
            }).call(this);
        };
        Snake.prototype.doStep = function () {
            var i, _ref;
            for (i = 0, _ref = this.length - 2; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
                this.moveTail(i);
            }
            return this.moveHead();
        };
        Snake.prototype.moveTail = function (i) {
            this.elements[i][0] = this.elements[i + 1][0];
            return this.elements[i][1] = this.elements[i + 1][1];
        };
        Snake.prototype.moveHead = function () {
            var head;
            head = this.length - 1;
            switch (this.direction) {
            case "left":
                this.elements[head][0] -= 1;
                break;
            case "right":
                this.elements[head][0] += 1;
                break;
            case "up":
                this.elements[head][1] -= 1;
                break;
            case "down":
                this.elements[head][1] += 1;
            }
            if (this.elements[head][0] < 0) {
                this.elements[head][0] = STAGE_WIDTH;
            }
            if (this.elements[head][1] < 0) {
                this.elements[head][1] = STAGE_HEIGHT;
            }
            if (this.elements[head][0] > STAGE_WIDTH) {
                this.elements[head][0] = 0;
            }
            if (this.elements[head][1] > STAGE_HEIGHT) {
                return this.elements[head][1] = 0;
            }
        };
        Snake.prototype.head = function () {
            return this.elements[this.length - 1];
        };
        Snake.prototype.blocks = function (other) {
            var collision, element, head, _i, _len, _ref;
            head = other.head();
            collision = false;
            _ref = this.elements;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                element = _ref[_i];
                if (head[0] === element[0] && head[1] === element[1]) {
                    collision = true;
                }
            }
            return collision;
        };
        Snake.prototype.blocksSelf = function () {
            var collision, head, i, _ref;
            head = this.head();
            collision = false;
            for (i = 0, _ref = this.length - 2; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
                if (head[0] === this.elements[i][0] && head[1] === this.elements[i][1]) {
                    collision = true;
                }
            }
            return collision;
        };
        Snake.prototype.changeFood = function (f) {
            this.tfoo = f;
        };
        Snake.prototype.eat = function (snake) {
            var collision, element, head, _i, _len, _ref, eated;
            head = snake.head();
            collision = false;
            _ref = this.elements;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                element = _ref[_i];
                eated = tFood.indexInArray(head);
                if (eated !== false) {
                    collision = eated;
                    console.log(eated);
                }
            }
            return collision;
        };
        return Snake;
    })();
    /* Handle Connections */
    socket = io.listen(server);
    socket.on("connection", function (client) {
        var clientId, clientSnake;

        initStage = function (value) {
            clientId = {
                id: autoClient,
                name: value.name
            };
            clientSnake = new Snake(clientId);
            autoClient += 1;
            snakes.push(clientSnake);
            sys.puts("Client " + value.name + " connected");
            foodRender('con');
            client.send(JSON.stringify({
                type: 'id',
                value: clientId
            }));
        }

        client.on("message", function (message) {
            message = JSON.parse(message);
            switch (message.type) {
            case 'log':
                return initStage(message.value);
            case 'direction':
                return clientSnake.direction = message.value;
            }
        });
        return client.on("disconnect", function () {
            snakes.remove(clientSnake);
            foodRender('dis');
            return sys.puts("Client " + clientId + " disconnected");
        });
    });
    /* Update Game State */
    updateState = function () {
        var snake, _i, _len;
        for (_i = 0, _len = snakes.length; _i < _len; _i++) {
            snake = snakes[_i];
            snake.doStep();
        }
        checkCollisions();
        return socket.send(JSON.stringify({
            type: 'snakes',
            value: snakes,
        }));
    };
    checkCollisions = function () {
        var other, resetSnakes, snake, _i, _j, _k, _len, _len2, _len3, _results;
        resetSnakes = [];
        for (_i = 0, _len = snakes.length; _i < _len; _i++) {
            snake = snakes[_i];
            if (snake.blocksSelf()) {
                resetSnakes.push(snake);
            }
            for (_j = 0, _len2 = snakes.length; _j < _len2; _j++) {
                other = snakes[_j];
                if (other !== snake) {
                    if (other.blocks(snake)) {
                        if (other.length == snake.length) {
                            resetSnakes.push(snake);
                            resetSnakes.push(other);
                        }

                        if (other.length > snake.length) {
                            resetSnakes.push(snake);
                            other.addKill();
                        }

                        if (other.length < snake.length) {
                            resetSnakes.push(other);
                            snake.addKill();
                        }
                    }
                } else {
                    if (other.eat(snake) === 'reFood') {
                        other.changeFood(tFood);
                    }else if(typeof other.eat(snake) === 'number'){
                        other.addKill('eat');
                        foodRender('eat', other.eat(snake));
                        other.changeFood(tFood);
                    }
                }
            }
        }
        _results = [];
        for (_k = 0, _len3 = resetSnakes.length; _k < _len3; _k++) {
            snake = resetSnakes[_k];
            _results.push(snake.reset());
        }
        return _results;
    };
    /* Render food */
    foodRender = function (status, f) {
        // console.log(snakes.length);
        if (status === 'con') {
            tFood.push([Math.floor(Math.random() * STAGE_WIDTH), Math.floor(Math.random() * STAGE_HEIGHT)]);
        }

        if (status === 'dis') {
            tFood.splice(Math.floor(Math.random() * tFood.length - 1), 1);
        }

        if (status === 'eat') {
            tFood.splice(f, 1);
            tFood.push([Math.floor(Math.random() * STAGE_WIDTH), Math.floor(Math.random() * STAGE_HEIGHT)]);
        }
        // console.log(tFood);
    };

    tick = setInterval(updateState, 100);
    /* Start Server */
    sys.puts("Server running on port " + port);
}).call(this);
