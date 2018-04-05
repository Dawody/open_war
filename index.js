var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var WIDTH = 1000; //the ground
var HEIGHT = 400;

var Bullets =[];
var Players = new Map();
function Player(){
    this.dx=5;
    this.dy=5;
    this.x=150; //initial position
    this.y=100; //initial position
    this.status=1;  //1=live , 0=dead
    this.score=0;
    this.health=3;
    this.power=2;
}
function bullet(pid,fx,fy,fdx,fdy){
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
        //id=map.get(socket.id);
        console.log("player id = "+socket.id+" ..   position is("+Players.get(socket.id).x+","+Players.get(socket.id).y+")");

    });

    socket.on('test',function (data) {
        console.log(data);

    });


    socket.on('init',function(){
        console.log("identification request : start player number : "+(Players.size+1));
        Players.set(socket.id,new Player);
  //      setTimeout(function(){  //here i tried to simulate the expected slow performance of server to check the synchronization
            socket.emit('identification',socket.id);
//        },2000);

    });

    socket.on('print my id',function (client_id) {
        console.log("the client id = "+client_id);

    })


    /**
     * this function is responsible for changing the player position or creat new fire according to the pressed key
     */
    socket.on('move_request',function (evtCode){

        switch (evtCode) {
            case 38:  /* Up arrow was pressed */
                console.log("UP");
                if (Players.get(socket.id).y - Players.get(socket.id).dy > 0){
                    Players.get(socket.id).y -= Players.get(socket.id).dy;
                }
                break;
            case 40:  /* Down arrow was pressed */
                console.log("Down");
                if (Players.get(socket.id).y + Players.get(socket.id).dy < HEIGHT){
                    Players.get(socket.id).y += Players.get(socket.id).dy;
                }
                break;
            case 37:  /* Left arrow was pressed */
                console.log("Left");
                if (Players.get(socket.id).x - Players.get(socket.id).dx > 0){
                    Players.get(socket.id).x -= Players.get(socket.id).dx;
                }
                break;
            case 39:  /* Right arrow was pressed */
                console.log("Right");
                if (Players.get(socket.id).x + Players.get(socket.id).dx < WIDTH){
                    Players.get(socket.id).x += Players.get(socket.id).dx;
                }
                break;
            case 32:
                console.log("FIRE");
                Bullets.push(new bullet(socket.id,Players.get(socket.id).x,Players.get(socket.id).y,10,0));

        }

    })


    /**
     * this function is responsible for updating the fires positions and send the new positions to clients
     */


    // setInterval(function(){
    //     fireEngine()
    //     socket.emit('update Players',Array.from(Players))
    //     socket.emit('update Bullets',Bullets)
    // },1000);


    socket.on('disconnect',function(){
        Players.delete(socket.id);
    })

});


setInterval(function(){
    fireEngine()
    nsp.emit('update Players',Array.from(Players))
    nsp.emit('update Bullets',Bullets)
},10);


/**
 * this function is responsible for changing the fires positions in the array
 */
function fireEngine(){


    for(var i = 0 ; i < Bullets.length ; i++){
        console.log("FIRE number : "+i+"  , owner code : "+Bullets[i].owner);
        Bullets[i].x +=Bullets[i].dx;
        Bullets[i].y +=Bullets[i].dy;
        if(Bullets[i].x <0 || Bullets[i].y<0 || Bullets[i].x>WIDTH || Bullets[i].y>HEIGHT){
            Bullets.splice(i,1);
            i-=1;
        }
    }

    //shot success! -> collession detection and sure that the fire owner is still alive in the Players Array.
}





