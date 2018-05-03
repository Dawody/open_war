var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database:"open_war"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  
});
var express=require('express');
var app=express();
var server =app.listen(3000);
app.use(express.static('public'));
var socket=require('socket.io');
var io=socket(server);
io.sockets.on('connection',newconnection);
function newconnection(socket) {
	console.log('new connection from: '+ socket.id);
	
}

console.log("myserver is running");