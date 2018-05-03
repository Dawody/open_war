var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bullets = [];
var tanks = new Map();
var killedTanks = new Map();
var qt = require('./quadtree');
var width = 2000,height = 2000;



/**
 *we may ignore some parameters during sending the tank data to the client to speedup the transmission process
 */
function Tank(x, y, angle, id, health) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.id = id;
    this.health = health;
    this.canFire = true;
    this.score = 0;
}

function Bullet(x, y, angle, id) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.id = id;
}

function dist(t,b)
{
    var x1,x2,y1,y2;
    x1 = t.x; x2 = b.x;
    y1 = t.y; y2 = b.y;
    var a = x1 - x2;
    var b = y1 - y2;
    var c = Math.sqrt( a*a + b*b );
    return c;
}

setInterval(function one() {
    let boundary = new qt.Rectangle(0, 0, width, height);
    let qtree = new qt.QuadTree(boundary, 4);
    var result = new Map(
    [...tanks] // step 1
    .map(([k, v]) => [k, Object.values(v)]) // step 2
	);
	var result2 = Array.from(bullets, x => Object.values(x));
	// console.log(result);
	// console.log(result2);
 //    console.log(bullets);
    io.emit('tanks', {tanks:Array.from(result),bullets:result2});
	for(var i = bullets.length - 1;i>=0;i--)
    {
        bullets[i].x+=10*Math.cos(bullets[i].angle);
        bullets[i].y+=10*Math.sin(bullets[i].angle);
        if(Math.abs(bullets[i].x) + 10>=2000||Math.abs(bullets[i].y) + 10>=2000)
            bullets.splice(i,1);
        else
        {
            let point = new qt.Point(bullets[i].x, bullets[i].y,  bullets[i] , i);
            qtree.insert(point); 
        }
    }
    for(let [pid, t] of tanks){

        let range = new qt.Circle(t.x, t.y, 50);
        let points = qtree.query(range);
        for (let point of points) {

            let other = point.userData;

            if (t.id != other.id) {
                if(dist(t,other)<=20+10)
                {
                    t.health-=10;
                  	bullets.splice(point.index,1);
                    if(t.health<=0)
                    {
                    	if(tanks.has(other.id))
				        {
				            tanks.get(other.id).score = tanks.get(other.id).score + 1;
				        }
				        killedTanks.set(pid,tanks.get(pid));
                        tanks.delete(pid);
                        break;
                    }
                }
            }
        }
        /*for(var i = bullets.length - 1;i>=0;i--)
        {
            if(dist(t,bullets[i])<=40&&(bullets[i].id!=t.id))
            {
                t.health-=10;
                bullets.splice(i,1);
                if(t.health<=0)
                {
                    tanks.delete(pid);
                }
            }
        }  */    
    }
}, 1000/60);


io.on('connection', function (socket) {

    console.log('A user connected');
    console.log(socket.id);
    var canFire = true;
    tanks.set(socket.id,new Tank(0, 0, 0, socket.id,100));

    socket.on('disconnect', function () {
        tanks.delete(socket.id);
        killedTanks.delete(socket.id); 
        // if(tanks.has(socket.id))
        // {
            
        // }
        // if(killedTanks.has(socket.id))
        // {
              
        // }
        console.log('A user disconnected');
    });
    socket.on('move', function (data) {
        if(tanks.has(socket.id) )
        {

            if(Math.abs(tanks.get(socket.id).x + data.x*4 - 22.5) < width && Math.abs(tanks.get(socket.id).y + data.y*4 - 22.5) < height && Math.abs(data.x) <= 1 && Math.abs(data.y) <= 1)
            {
                tanks.get(socket.id).x += data.x*4;
                tanks.get(socket.id).y += data.y*4;
            }
            tanks.get(socket.id).angle = data.angle;
        }
    });


socket.on('continue_playing', function (data) {
        if(killedTanks.has(socket.id))
        {
        	var mytank = killedTanks.get(socket.id);
        	mytank.health = 100;
            tanks.set(socket.id,mytank);
            killedTanks.delete(socket.id);
        }
    });


    socket.on('fire', function (data) {

        if(tanks.has(socket.id)&&canFire/*tanks.get(socket.id).canFire*/)
        {	
            let dx = tanks.get(socket.id).x + 50*Math.cos(tanks.get(socket.id).angle);
            let dy = tanks.get(socket.id).y + 50*Math.sin(tanks.get(socket.id).angle);
            if(Math.abs(dx) - 10 < width && Math.abs(dy) - 10 < height)
            {
                var bullet = new Bullet(tanks.get(socket.id).x + 50*Math.cos(tanks.get(socket.id).angle),tanks.get(socket.id).y + 50*Math.sin(tanks.get(socket.id).angle),tanks.get(socket.id).angle,socket.id);
                bullets.push(bullet);
                // tanks.get(socket.id).canFire = false;
                // tanks
                setTimeout(function(){
                	canFire = true;
                    // if(tanks.has(socket.id))
                    //     tanks.get(socket.id).canFire=true;
                },200);
            }
        	// 10*Math.cos(bullets[i].angle);
			// 10*Math.sin(bullets[i].angle);
            
        }
    });
});


app.use(express.static('./'));
app.use(express.static('./client/'));
app.get('/', function (req, res) {
    res.sendfile('./client/index.html');
});

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

http.listen(port,ip, function () {
    // console.log('listening on localhost:2000');
});