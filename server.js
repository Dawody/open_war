var mysql = require('mysql');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var qt = require('./quadtree');
var path = require('path');
var exphbs = require('express-handlebars');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var session = require('express-session');
var passport = require('passport');
var cookieparser = require('cookie-parser');
var expressvalidator = require('express-validator');
var flash = require('connect-flash');
var localstrategy = require('passport-local'), strategy;
var engines = require('consolidate');
var socket = require('socket.io');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var working_rooms = [];
var room_tanks = new Map();
var room_bullets = new Map();
var room_killedtanks = new Map();
var myreq;
var con = mysql.createConnection({
	host: "localhost",
	user: "team5",
	password: "TanKwaR",
	database: "team5db"
});

con.connect(function (err) {
	if (err) throw err;
	console.log("Connected!");

});

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 38371,
	ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

http.listen(port, ip, function () {
	console.log('listening');
});
console.log("myserver is running");
app.use(express.static('public'));
app.set('view engine', 'ejs');

////intialize session
var sessionMiddleware = session({ secret: "1gghk5hhhhhhhgchgcgc2", resave: false, saveUninitialized: false });

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
app.use(sessionMiddleware);
//intialize cookie
app.use(cookieparser());
//express validation
app.use(expressvalidator({
	errorformater: function (param, msg, value) {
		var namespace = param.split('.')
			, root = namespace.shift()
			, formparam = root;

		while (namespace.length) {
			formparam += '{' + namespace.shift() + '}';
		}
		return {
			param: formparam,
			msg: msg,
			value: value
		};
	}
}));

//connect flash
app.use(flash());

app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});
//passport

app.use(passport.initialize());
app.use(passport.session());


var width = 2000, height = 2000;

/*height and width of the game*/


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

function dist(t, b) {
	var x1, x2, y1, y2;
	x1 = t.x; x2 = b.x;
	y1 = t.y; y2 = b.y;
	var a = x1 - x2;
	var b = y1 - y2;

	var c = Math.sqrt(a * a + b * b);
	return c;
}

setInterval(function one() {

	for (let [roomm, _] of room_tanks) {
		let boundary = new qt.Rectangle(0, 0, width, height);
		let qtree = new qt.QuadTree(boundary, 4);

		var result = new Map(
			[...room_tanks.get(roomm)] // step 1
				.map(([k, v]) => [k, Object.values(v)]) // step 2
		);
		var result2 = Array.from(room_bullets.get(roomm), x => Object.values(x).splice(0,2));
		io.to(roomm).emit('tanks', { tanks: Array.from(result), bullets: result2 });
		// io.to(roomm).emit('tanks', {tanks:Array.from(room_tanks.get(roomm)),bullets:room_bullets.get(roomm)});
		for (var i = room_bullets.get(roomm).length - 1; i >= 0; i--) {
			room_bullets.get(roomm)[i].x += 10 * Math.cos(room_bullets.get(roomm)[i].angle);
			room_bullets.get(roomm)[i].y += 10 * Math.sin(room_bullets.get(roomm)[i].angle);
			if (Math.abs(room_bullets.get(roomm)[i].x) + 10 >= width || Math.abs(room_bullets.get(roomm)[i].y) + 10 >= height)
				room_bullets.get(roomm).splice(i, 1);
			else {
				let point = new qt.Point(room_bullets.get(roomm)[i].x, room_bullets.get(roomm)[i].y,
					room_bullets.get(roomm)[i], i);
				qtree.insert(point);
			}
		}
		for (let [pid, t] of room_tanks.get(roomm)) {
			let range = new qt.Circle(t.x, t.y, 50);
			let points = qtree.query(range);
			for (let point of points) {

				let other = point.userData;

				if (t.id != other.id) {
					if (dist(t, other) <= 20 + 10) {
						t.health -= 10;
						room_bullets.get(roomm).splice(point.index, 1);
						if (t.health <= 0) {
							if (room_tanks.get(roomm).has(other.id)) {
								room_tanks.get(roomm).get(other.id).score = room_tanks.get(roomm).get(other.id).score + 1;
							}
							room_killedtanks.get(roomm).set(pid, room_tanks.get(roomm).get(pid));
							room_tanks.get(roomm).delete(pid);
							break;
						}
					}
				}
			}
		}
	}
}, 1000 / 60);


io.sockets.on('connection', function (socket) {
	var room = null;
	var canFire = true;
	// console.log(socket.request.session.pname_session);
	console.log('A user connected');
	console.log(socket.id);
	socket.on("join", function (room_id) {
		if (room_tanks.has(room_id)) {
			room = room_id
			socket.join(room_id);
			room_tanks.get(room).set(socket.id, new Tank(0, 0, 0, socket.id, 100));
		}
	});

	socket.on('move', function (data) {
		if (room_tanks.has(room)&&room_tanks.get(room).has(socket.id)) {
			if (Math.abs(room_tanks.get(room).get(socket.id).x + data.x * 4) + 22.5 < width && Math.abs(room_tanks.get(room).get(socket.id).y + data.y * 4) + 22.5 < height && Math.abs(data.x) <= 1 && Math.abs(data.y) <= 1) {
				room_tanks.get(room).get(socket.id).x += data.x * 4;
				room_tanks.get(room).get(socket.id).y += data.y * 4;
			}
			room_tanks.get(room).get(socket.id).angle = data.angle;
		}
	});


	socket.on('continue_playing', function (data) {
		if (room_killedtanks.has(room)&&room_killedtanks.get(room).has(socket.id)) {
			var mytank = room_killedtanks.get(room).get(socket.id);
			mytank.health = 100;
			room_tanks.get(room).set(socket.id, mytank);
			room_killedtanks.get(room).delete(socket.id);
		}
	});


	socket.on('fire', function (data) {
		if (room_tanks.has(room)&&room_tanks.get(room).has(socket.id) && canFire/*room_tanks.get(room).get(socket.id).canFire*/) {

			let dx = room_tanks.get(room).get(socket.id).x + 50 * Math.cos(room_tanks.get(room).get(socket.id).angle);
			let dy = room_tanks.get(room).get(socket.id).y + 50 * Math.sin(room_tanks.get(room).get(socket.id).angle);
			if (Math.abs(dx) + 10 < width && Math.abs(dy) + 10 < height) {
				var bullet = new Bullet(room_tanks.get(room).get(socket.id).x + 50 * Math.cos(room_tanks.get(room).get(socket.id).angle), room_tanks.get(room).get(socket.id).y + 50 * Math.sin(room_tanks.get(room).get(socket.id).angle), room_tanks.get(room).get(socket.id).angle, socket.id);
				room_bullets.get(room).push(bullet);
				canFire = false;
				// room_tanks.get(room).get(socket.id).canFire = false;
				// tanks
				setTimeout(function () {
					canFire = true;
					// if(room_tanks.get(room).has(socket.id))
					//     room_tanks.get(room).get(socket.id).canFire=true;
				}, 200);
			}
		}
	});
	socket.on('disconnect', function () {
		let todelete = false;
		if(room_tanks.has(room)&&room_tanks.get(room).has(socket.id))
		{
			store_score_player(room_tanks.get(room).get(socket.id).score,socket.request.session.pname_session);
			store_score_room(room_tanks.get(room).get(socket.id).score,room,socket.request.session.pname_session);
		}
		if(room_tanks.has(room))
		{
			room_tanks.get(room).delete(socket.id);
			if(room_tanks.get(room).size == 0)
				todelete = true;

		}
		if(room_killedtanks.has(room)&&room_tanks.get(room).has(socket.id))
		{
			store_score_player(room_tanks.get(room).get(socket.id).score,socket.request.session.pname_session);
			store_score_room(room_tanks.get(room).get(socket.id).score,room,socket.request.session.pname_session);
		}
		if(room_killedtanks.has(room))
		{
			room_killedtanks.get(room).delete(socket.id);
			if(room_killedtanks.get(room).size == 0 && todelete === true)
			{
				room_tanks.delete(room);
				room_killedtanks.delete(room);
				if(room_bullets.has(room))
					room_bullets.delete(room);
				let index = working_rooms.indexOf(room);
				if (index > -1) {
				working_rooms.splice(index, 1);
				}
			}
		}
		
		console.log('A user disconnected');
	});
});









//////////////////////////////////////////////////////////////////////
app.get('/', function (req, res) {
	res.sendfile('index');
});

///////////////////////////////////////////////////////////////////////

app.get('/login', function (req, res) {
	if (typeof req.session.pname_session !== "undefined" && typeof req.session.ppass_session !== "undefined") {
		res.redirect('/rooms');

	}
	else {
		res.render('login');
	}
});
///////////////////////////////////////////////////////////////////////////
app.get('/create_room_error', function (req, res) {
	res.render('create_room_error');
});

///////////////////////////////////////////////////////////////////

app.get('/Sign_up', function (req, res) {
	res.render('Sign_up');
});


////////////////////////////////////////////////////////
app.get('/Sign_up_error', function (req, res) {
	res.render('Sign_up_error');
});


//////////////////////////////////////////////////////////////////

app.post('/Sign_up', urlencodedParser, function (req, res) {
	if (!req.body) return res.sendStatus(400)
	//res.send('index.html' + req.body.username);

	var data = {
		uname: req.body.username,
		uemail: req.body.useremail,
		upass: req.body.userpass
	}
	req.checkBody('username', 'Name is required').notEmpty();
	req.checkBody('useremail', 'Email is required').notEmpty();
	req.checkBody('useremail', 'Email isnot valid').isEmail();
	req.checkBody('userpass', 'password is required').notEmpty();
	var n = data.uname.indexOf(" ");
	var b = data.uemail.indexOf(" ");
	var c = data.upass.indexOf(" ");
	var error = req.validationErrors();
	if (error) {

		res.render('Sign_up', {
			errors: error
		});


	}
	else if (n != -1 || b != -1 || c != -1) {
		res.redirect('Sign_up_error.html');
	}
	else {
		var sql = 'SELECT COUNT(*) AS namecount FROM player WHERE Pname = ?'
		con.query(sql, [data.uname], function (err, rows, fields) {
			if (err) throw err;
			console.log(rows[0].namecount);

			if (rows[0].namecount > 0) {
				res.redirect('Sign_up_error.html');
			}
			else {
				var sql = "INSERT INTO player  (Pname,Pemail,Ppassword) VALUES (?,?,?)";
				con.query(sql, [data.uname, data.uemail, data.upass], function (err, result) {
					if (err) throw err;
					console.log("1 record inserted");
					console.log(data);
					req.flash('success_msg', 'Your are now registered and can login to our Game');
					res.redirect('/login');
				});

			}
		});
	}

});

////////////////////////////////////////////////////////////////////////////////////////////


app.post('/login', urlencodedParser, function (req, res) {
	if (!req.body) return res.sendStatus(400)
	var data = {
		uname: req.body.username,
		upass: req.body.password
	}
	req.checkBody('username', 'Name is required').notEmpty();
	req.checkBody('password', 'password is required').notEmpty();


	var error = req.validationErrors();
	if (error) {

		res.render('login', {
			errors: error
		});


	}

	else {
		var sql = 'SELECT * FROM player WHERE Pname = ? and Ppassword= ?';
		con.query(sql, [data.uname, data.upass], function (err, rows, fields) {
			if (err) throw err;

			if (rows.length === 0) {
				res.redirect('login_error.html');
			}
			else {
				req.session.pname_session = rows[0].Pname;
				req.session.ppass_session = rows[0].Ppassword;
				req.session.pemail_session = rows[0].Pemail;
				req.session.pscore_session = rows[0].P_latest_score;
				req.session.phighscore_session = rows[0].P_high_score;
				req.session.totalscore_session = rows[0].P_total_score;
				myreq = req.session.pname_session;
				// console.log(req.session);
				if (typeof req.session.pname_session !== "undefined" && typeof req.session.ppass_session !== "undefined") {

					res.redirect('profile');
				}
				else {
					res.redirect('/Sign_up');
				}

			}
		});
	}

});
/////////////////////////////////////////////////////////////////////////

app.get('/profile', function (req, res) {
	console.log(req.session.pscore_session);
	if (typeof req.session.pname_session !== "undefined" && typeof req.session.ppass_session !== "undefined") {
		var sql = 'SELECT * FROM player WHERE Pname = ?';
		con.query(sql, [req.session.pname_session], function (err, rows, fields) {
			if (err) throw err;
			var score = rows[0].P_latest_score;
			var highscore = rows[0].P_high_score;
			var totalscore = rows[0].P_total_score;
			res.render('profile', { username: req.session.pname_session, useremail: req.session.pemail_session, userscore: score, userhighs: highscore, usertotalscore: totalscore });
		});

	}
	else {
		res.redirect('/Sign_up');
	}

});

////////////////////////////////////////////////////////////

app.get('/Sign_up_error', function (req, res) {
	res.redirect('Sign_up_error.html');
});

////////////////////////////////////////////////////////////////////

app.post('/logout', function (req, res) {
	console.log(req.session);
	req.session.destroy();
	console.log(req.session);
	res.redirect('/login');
});

/////////////////////////////////////////////////////////////////////

app.get('/rooms', function (req, res) {
	if (typeof req.session.pname_session !== "undefined" && typeof req.session.ppass_session !== "undefined") {
		var data = {
			working: working_rooms
		}
		res.render('rooms', { data });

	}
	else {
		res.redirect('/Sign_up');
	}

});

//////////////////////////////////////////////////////////////////////
app.post('/create_room', urlencodedParser, function (req, res) {


	if (!req.body) return res.sendStatus(400);

	var room_crated = {
		room_name: req.body.roomname
	}

	req.checkBody('roomname', 'Name is required').notEmpty();
	var error = req.validationErrors();


	if (error) {
		res.render('rooms', {
			errors: error
		});

	}

	if (working_rooms.indexOf(req.body.roomname) > -1) {
		//////////////////////////////////////////////////////////////////////////////
		/////////////////////////redirect to room error//////////////////////////////
		///////////////////////////////////////////////////////////////////////////
		res.redirect('create_room_error');
	}
	else {


		working_rooms.push(req.body.roomname);
		room_tanks.set(room_crated.room_name, new Map());
		room_bullets.set(room_crated.room_name, []);
		room_killedtanks.set(room_crated.room_name, new Map());

		var sql = "INSERT IGNORE INTO room  (Room_name) VALUES (?)";
		con.query(sql, [room_crated.room_name], function (err, result) {
			if (err) throw err;
			console.log("1 record inserted into room");
			console.log(room_crated);
			console.dir(working_rooms);
			req.flash('success_msg', 'Your are now Created room and enter Game');

			//////////////////////insert into player_room///////////////
			var sql = "INSERT INTO player_room  (Rname,P_name_fk) VALUES (?,?)";
			con.query(sql, [room_crated.room_name, req.session.pname_session], function (err, result) {
				if (err) throw err;
				console.log("1 record inserted into player_room");
				req.flash('success_msg', 'Your are now Created room and enter Game');

				var data = {
					working: working_rooms
				}
				// res.render('rooms', { data });

				res.redirect('/rooms');

			});

		});

	}
});

//////////////////////////////////////////////////////////////////////////////////////

app.get('/joined_rooms', function (req, res) {
	console.log(req.session.pscore_session);
	if (typeof req.session.pname_session !== "undefined" && typeof req.session.ppass_session !== "undefined") {
		var sql = 'SELECT * FROM player_room WHERE P_name_fk = ?';
		con.query(sql, [req.session.pname_session], function (err, rows, fields) {
			if (err) throw err;
			var count = rows.length;
			var i;
			var myrooms = [];
			var myscore = [];
			for (i = 0; i < count; i++) {
				myrooms[i] = rows[i].Rname;
				myscore[i] = rows[i].P_score;
			}
			var data = {
				joined: myrooms,
				joined_score: myscore
			}
			res.render('joined_rooms', { data });
		});

	}
	else {
		res.redirect('/Sign_up');
	}

});
///////////////////////////////////////////////////////////////
app.get('/joinroom', urlencodedParser, function (req, res) {
	if (!req.body) return res.sendStatus(400);

	var room_joined = {
		room_name: req.query.joined_room
	}

	if (working_rooms.indexOf(req.query.joined_room) > -1) {
		// console.log(req.query.joined_room);
		var sql = 'SELECT * FROM room WHERE Room_name = ?';
		con.query(sql, [room_joined.room_name], function (err, rows, fields) {
			if (err) throw err;

			if (rows.length > 0) {
				// console.log(req.query.joined_room);

				// console.log(req.query.joined_room);
				var sql = "INSERT INTO player_room  (Rname,P_name_fk) VALUES (?,?)";
				con.query(sql, [room_joined.room_name, req.session.pname_session], function (err, result) {
					if (err) throw err;
					console.log("1 record inserted");
					console.log(room_joined);
					console.dir(working_rooms);
					req.flash('success_msg', 'Your are now Created room and enter Game');
					console.log('entering room');
					res.render('game', {
						myroom: room_joined.room_name
					});


				});
			}

			else {
				//////////////////////////////////////////////////////////////////////////////
				/////////////////////////redirect to room error//////////////////////////////
				///////////////////////////////////////////////////////////////////////////

				res.redirect('/rooms');
			}

		});
	}
});

//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////
//////function take score and req to insert score in row with the username in player table////
/////////////////////////////////////////////////////////////////


function store_score_player(newscore, req) {
	var score = parseInt(newscore);
	console.log(newscore);
	console.log(req);
	var sql = 'SELECT * FROM player WHERE Pname = ?';
	con.query(sql, [req], function (err, rows, fields) {
		if (err) throw err;
		var highscore = rows[0].P_high_score;
		var totalscore = rows[0].P_total_score;
		totalscore = totalscore + score;
		if (score > highscore) {
			var sql = 'UPDATE  player SET P_latest_score = ?,P_high_score = ?, P_total_score = ?  WHERE Pname = ? ';
			con.query(sql, [score, score, totalscore, req], function (err, result, rows, fields) {
				if (err) throw err;
				console.log("new score inserted");

			});
		}
		else {
			var sql = 'UPDATE  player SET P_latest_score = ?,P_high_score = ?, P_total_score = ?  WHERE Pname = ? ';
			con.query(sql, [score, highscore, totalscore, req], function (err, result, rows, fields) {
				if (err) throw err;
				console.log("new score inserted");
			});

		}
	});
}

//////////////////////////////////////////////////////////////
//////function take score ,room and req to iner score in row with the username and room name in room_player table////
/////////////////////////////////////////////////////////////////
function store_score_room(newscore, room, req) {
	var score = parseInt(newscore);
	console.log(newscore);
	console.log(room);
	console.log(req);
	var sql = 'INSERT INTO player_room (Rname, P_name_fk, P_score) VALUES (?, ?, ?)';
	// var sql = 'UPDATE  player_room SET P_score = ?  WHERE P_name_fk = ? and Rname =? ';
	con.query(sql, [room, req, score], function (err, result, rows, fields) {
		if (err) throw err;
		console.log("new score inserted into player_room");

	});

}

module.exports = router;
