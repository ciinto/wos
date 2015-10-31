(function() {
    if (window["WebSocket"]) {
        $(document).ready(function() {
            var animate, canvas, connect, context, id, sendDirection, server;
            server = null;
            canvas = $("#stage");
            context = canvas.get(0).getContext("2d");
            id = null;
            var isMobile = false; //initiate as false
            // device detection
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;
            sendDirection = function(direction) {
                if (server) {
                    return server.send(JSON.stringify({
                        'type': 'direction',
                        'value': direction
                    }));
                }
            };
            Array.prototype.sortKills = function(){
                var swapped;
                do {
                    swapped = false;
                    for (var i=0; i < this.length-1; i++) {
                        if (this[i].kills > this[i+1].kills) {
                            var temp = this[i];
                            this[i] = this[i+1];
                            this[i+1] = temp;
                            swapped = true;
                        }
                    }
                } while (swapped);
                return this;
            };
            animate = function(snakes) {
                var element, snake, x, y, _i, _len, _results;
                var userHtml = [];
                snakes = snakes.sortKills();
                context.fillStyle = 'rgb(230,230,230)';
                for (x = 0; x <= 59; x++) {
                    for (y = 0; y <= 39; y++) {
                        context.fillRect(x * 10, y * 10, 9, 9);
                    }
                }

                _results = [];
                for (_i = 0, _len = snakes.length; _i < _len; _i++) {
                    snake = snakes[_i];
                    userHtml.push(['<tr>',
                        '<td>' + snake.name + '</td>',
                        '<td>' + snake.kills + '</td>',
                        '<td>' + snake.deaths + '</td>',
                        '<td>' + snake.length + '</td>',
                        '</tr>'
                    ].join(''));

                    context.fillStyle = snake.id === id ? 'rgb(170,0,0)' : 'rgb(0,0,0)';
                    if (snake.id === id) {
                        $("#name").html(snake.name);
                        $("#kills").html("Kills: " + snake.kills);
                        $("#deaths").html("Deaths: " + snake.deaths);
                        $("#length").html("Length: " + snake.length);

                        if (snake.tfoo) {
                            for(i=0; i < snake.tfoo.length; i++){
                                context.fillRect(snake.tfoo[i][0] * 10, snake.tfoo[i][1] * 10, 9, 9);
                            }
                        }
                    }
                    _results.push((function() {
                        var _j, _len2, _ref, _results2;
                        _ref = snake.elements;
                        _results2 = [];
                        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
                            element = _ref[_j];
                            x = element[0] * 10;
                            y = element[1] * 10;
                            _results2.push(context.fillRect(x, y, 9, 9));
                        }
                        return _results2;
                    })());
                }
                $("#userboard").find('tbody').html(userHtml.join(''));
                return _results;
            };
            connect = function() {
                server = io();
                var person = prompt("Please enter your name", "Satomi");
                if (person != null) {
                    server.send(JSON.stringify({
                        'type': 'log',
                        'value': {
                            name: person
                        }
                    }));
                }
                return server.on("message", function(event) {
                    var message;
                    message = JSON.parse(event);
                    switch (message.type) {
                        case 'id':
                            return id = message.value.id;
                        case 'snakes':
                            return animate(message.value);
                    }
                });
            };
            connect();
            // if (isMobile === true) {
            //     $('body').swipeup(function() {
            //         sendDirection("up");
            //     }).swipedown(function() {
            //         sendDirection("down");
            //     }).swipeleft(function() {
            //         sendDirection("left");
            //     }).swiperight(function() {
            //         sendDirection("right");
            //     });
            // } else {
            return $(document).keydown(function(event) {
                var key;
                key = event.keyCode ? event.keyCode : event.which;
                switch (key) {
                    case 37:
                        return sendDirection("left");
                    case 38:
                        return sendDirection("up");
                    case 39:
                        return sendDirection("right");
                    case 40:
                        return sendDirection("down");
                }
            });
            // }
        });
    } else {
        alert("Your browser does not support websockets.");
    }
}).call(this);
