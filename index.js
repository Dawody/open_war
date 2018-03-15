var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3000,function () {
    console.log("listening on *:3000");
});



app.get('/',function (req,res) {
    res.sendFile(__dirname + '/battle.html');

})

// io.on('connection',function (socket) {
//     console.log("connected.");
//
// })


var nsp = io.of('/survive-room');
nsp.on('connection',function (socket) {
    console.log('connected to survive-room');

    socket.on('MY position',function (x,y) {
        console.log("MY position is("+x+","+y+")");

    });

    socket.on('test',function (data) {
        console.log(data);

    })

});


