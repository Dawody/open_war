var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var WIDTH = 1000; //the ground
var HEIGHT = 400;
var Players =[] ;
var Fires =[];
var map = new Map();
function Player(){
    this.dx=5;
    this.dy=5;
    this.x=150; //initial position
    this.y=100; //initial position
    this.score=0;
    this.health=3;
    this.power=2;
}
function fire(pid,fx,fy,fdx,fdy){
    this.owner=pid;
    this.x=fx;
    this.y=fy;
    this.dx=fdx;
    this.dy=fdy;
    this.power=1;
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
        console.log("identification request : start player number : "+Players.length+1);
        Players.push(new Player());
        map.set(socket.id,player_id);
        socket.emit('identification',socket.id);
        player_id++;
    });

    socket.on('print my id',function (client_id) {
        console.log("the client id = "+client_id);

    })


    /**
     * this function is responsible for changing the player position or creat new fire according to the pressed key
     */
    socket.on('move_request',function (evtCode){
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
            case 32:
                console.log("FIRE");
                Fires.push(new fire(id,Players[id].x,Players[id].y,10,0));
        }

    })


    /**
     * this function is responsible for updating the fires positions and send the new positions to clients
     */
    socket.on('update request',function(){

        fireEngine();
        socket.emit('update response',Players,Fires);
    })




});


/**
 * this function is responsible for changing the fires positions in the array
 */
function fireEngine(){

    for(var i=0 ; i<Fires.length ;i++){
        Fires[i].x +=Fires[i].dx;
        Fires[i].y +=Fires[i].dy;
    }

}





