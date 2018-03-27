var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var WIDTH = 1000; //the ground
var HEIGHT = 400;
var Players =[] ;
var map = new Map();
function Player(){
    this.dx=5;
    this.dy=5;
    this.x=150; //initial position
    this.y=100; //initial position
}



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

var player_id=0;
var nsp = io.of('/survive-room');
nsp.on('connection',function (socket) {
    console.log('connected to survive-room');

    socket.on('MY position',function () {
        id=map.get(socket.id);
        console.log("player id = "+id+" ..   position is("+Players[id].x+","+Players[id].y+")");

    });

    socket.on('test',function (data) {
        console.log(data);

    });


    socket.on('init',function(){
        console.log("identification request : start player number : "+Players.length);
        Players.push(new Player());
        map.set(socket.id,player_id);
        socket.emit('identification',socket.id);
        player_id++;
    });

    socket.on('print my id',function (client_id) {
        console.log("the client id = "+client_id);

    })



    socket.on('move_request',function (evtCode){
        console.log("MMMOOOOOOOVVVVVVVEEEEE");
        var id = map.get(socket.id);

        console.log("keycode foe id  :"+id +" is equal : "+evtCode);

        switch (evtCode) {
            case 38:  /* Up arrow was pressed */
                console.log("UP");
                if (Players[id].y - Players[id].dy > 0){
                    Players[id].y -= Players[id].dy;
                }
                break;
            case 40:  /* Down arrow was pressed */
                console.log("Down");
                if (Players[id].y + Players[id].dy < HEIGHT){
                    Players[id].y += Players[id].dy;
                }
                break;
            case 37:  /* Left arrow was pressed */
                console.log("Left");
                if (Players[id].x - Players[id].dx > 0){
                    Players[id].x -= Players[id].dx;
                }
                break;
            case 39:  /* Right arrow was pressed */
                console.log("Right");
                if (Players[id].x + Players[id].dx < WIDTH){
                    Players[id].x += Players[id].dx;
                }
                break;
        }

//            socket.emit('MY position',me.x,me.y);
    })


    socket.on('updatePlayers request',function(){
        socket.emit('updatePlayers response',Players);
    })




});


