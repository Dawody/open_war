var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var tanks = [];
var bullets = [];


function Tank(x, y, angle, id, health) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.id = id;
    this.health = health;
}

function Bullet(x, y, angle, id) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.id = id;
}

setInterval(function one() {
    io.emit('tanks', {tanks:tanks,bullets:bullets});
	for(var i = bullets.length - 1;i>=0;i--)
    {
        bullets[i].x+=10*Math.cos(bullets[i].angle);
        bullets[i].y+=10*Math.sin(bullets[i].angle);
        if(Math.abs(bullets[i].x)>=2000||Math.abs(bullets[i].y)>=2000)
            bullets.splice(i,1);
    }
}, 40);


io.on('connection', function (socket) {
    function findTank(element) {
        return element.id == socket.id;
    }

    console.log('A user connected');
    console.log(socket.id);
    tanks.push(new Tank(0, 0, 0, socket.id,100));
    socket.on('disconnect', function () {
        var index = tanks.findIndex(findTank);
        tanks.splice(index,1);
        console.log('A user disconnected');
    });
    socket.on('move', function (data) {
        var index = tanks.findIndex(findTank);
        tanks[index].x += data.x;
        tanks[index].y += data.y;
        tanks[index].angle = data.angle;
    });
    socket.on('fire', function (data) {
        var index = tanks.findIndex(findTank);
        var bullet = new Bullet(tanks[index].x,tanks[index].y,tanks[index].angle,socket.id);
        bullets.push(bullet);
    });
});


app.use(express.static('./'));
app.use(express.static('./client/'));
app.get('/', function (req, res) {
    res.sendfile('./client/index.html');
});

http.listen(process.env.PORT || 2000, function () {
    // console.log('listening on localhost:2000');
});