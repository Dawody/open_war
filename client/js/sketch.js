var socket = io();
var img;
var tank={}, tank2;
var tanks = [];
var bullets = [];
var dead = false;
var fire = false;
var canFire = true;
var isOverCircle = false;

// var vertices = [[65, 40], [48, 40], [48, 41], [47, 41], [47, 42], [46, 42], [46, 43], [45, 43], [45, 44], [44, 44], [44, 45], [43, 45], [43, 46], [42, 46], [42, 47], [41, 47], [41, 48], [39, 48], [39, 49], [37, 49], [37, 50], [34, 50], [34, 51], [29, 51], [29, 52], [24, 52], [24, 51], [19, 51], [19, 50], [16, 50], [16, 49], [14, 49], [14, 48], [12, 48], [12, 47], [11, 47], [11, 46], [10, 46], [10, 45], [9, 45], [9, 44], [8, 44], [8, 43], [7, 43], [7, 42], [6, 42], [6, 41], [5, 41], [5, 39], [4, 39], [4, 38], [3, 38], [3, 35], [2, 35], [2, 32], [1, 32], [1, 20], [2, 20], [2, 17], [3, 17], [3, 15], [4, 15], [4, 13], [5, 13], [5, 11], [6, 11], [6, 10], [7, 10], [7, 9], [8, 9], [8, 8], [9, 8], [9, 7], [10, 7], [10, 6], [11, 6], [11, 5], [13, 5], [13, 4], [14, 4], [14, 3], [16, 3], [16, 2], [19, 2], [19, 1], [34, 1], [34, 2], [36, 2], [36, 3], [39, 3], [39, 4], [40, 4], [40, 5], [42, 5], [42, 6], [43, 6], [43, 7], [44, 7], [44, 8], [45, 8], [45, 9], [46, 9], [46, 10], [47, 10], [47, 11], [48, 11], [48, 12], [65, 12]];
// var vertices = [[-50,-50], [50,-50], [50,50], [-50,50]];
// var vertices = [[0,0], [100,0], [100,50], [0,50]];
// var vertices = [[ 47,41],[47,11],[48,11],[48,41 ],[ 46,42],[46,10],[47,10],[47,42 ],[ 45,43],[45,9],[46,9],[46,43 ],[ 9,44],[8,9],[9,8],[44,8],[45,9],[45,44 ],[ 9,45],[9,44],[44,44],[44,45 ],[ 10,46],[10,45],[43,45],[43,46 ],[ 41,47],[42,46],[42,47 ],[ 11,46],[12,47],[11,47 ],[ 8,9],[9,44],[8,44 ],[ 8,9],[8,43],[7,43 ],[ 6,41],[7,42],[6,42 ],[ 4,38],[5,39],[4,39 ],[ 7,10],[6,11],[6,10 ],[ 8,9],[7,10],[7,9 ],[ 9,8],[8,9],[8,8 ],[ 44,7],[44,8],[9,8],[9,7 ],[ 11,6],[10,7],[10,6 ],[ 14,4],[13,5],[13,4 ],[ 40,5],[39,4],[40,4 ],[ 43,7],[42,6],[43,6 ],[ 45,9],[44,8],[45,8 ],[ 48,40],[48,12],[65,12],[65,40 ],[ 39,48],[41,47],[41,48 ],[ 37,49],[39,48],[39,49 ],[ 14,48],[16,49],[14,49 ],[ 12,47],[14,48],[12,48 ],[ 5,39],[6,41],[5,41 ],[ 4,15],[7,42],[3,17],[3,15 ],[ 5,13],[4,15],[4,13 ],[ 6,11],[5,13],[5,11 ],[ 13,5],[11,6],[11,5 ],[ 16,3],[14,4],[14,3 ],[ 36,3],[10,7],[34,2],[36,2 ],[ 42,6],[40,5],[42,5 ],[ 34,50],[37,49],[37,50 ],[ 16,49],[19,50],[16,50 ],[ 3,35],[4,38],[3,38 ],[ 2,20],[3,35],[2,35 ],[ 3,17],[7,42],[5,39],[2,20],[2,17 ],[ 19,2],[16,3],[16,2 ],[ 39,4],[36,3],[39,3 ],[ 19,51],[19,50],[34,50],[34,51 ],[ 24,52],[24,51],[29,51],[29,52 ],[ 3,35],[2,20],[5,39],[4,38 ],[ 40,5],[36,3],[39,4 ],[ 39,48],[34,50],[19,50],[14,48],[12,47],[11,46],[42,46],[41,47 ],[ 5,39],[7,42],[6,41 ],[ 8,9],[7,42],[4,15],[6,11 ],[ 19,2],[34,1],[34,2],[10,7],[11,6 ],[ 16,3],[19,2],[13,5],[14,4 ],[ 43,7],[10,7],[36,3],[42,6 ],[ 1,20],[2,20],[2,32],[1,32 ],[ 34,1],[19,2],[19,1 ],[ 34,50],[39,48],[37,49 ],[ 14,48],[19,50],[16,49 ]];
// var vertices = [[31,13],[14,13],[14,14],[13,14],[13,15],[12,15],[12,16],[11,16],[11,17],[10,17],[10,18],[9,18],[9,19],[8,19],[8,20],[7,20],[7,21],[5,21],[5,22],[3,22],[3,23],[0,23],[0,24],[-5,24],[-5,25],[-10,25],[-10,24],[-15,24],[-15,23],[-18,23],[-18,22],[-20,22],[-20,21],[-22,21],[-22,20],[-23,20],[-23,19],[-24,19],[-24,18],[-25,18],[-25,17],[-26,17],[-26,16],[-27,16],[-27,15],[-28,15],[-28,14],[-29,14],[-29,12],[-30,12],[-30,11],[-31,11],[-31,8],[-32,8],[-32,5],[-33,5],[-33,-7],[-32,-7],[-32,-10],[-31,-10],[-31,-12],[-30,-12],[-30,-14],[-29,-14],[-29,-16],[-28,-16],[-28,-17],[-27,-17],[-27,-18],[-26,-18],[-26,-19],[-25,-19],[-25,-20],[-24,-20],[-24,-21],[-23,-21],[-23,-22],[-21,-22],[-21,-23],[-20,-23],[-20,-24],[-18,-24],[-18,-25],[-15,-25],[-15,-26],[0,-26],[0,-25],[2,-25],[2,-24],[5,-24],[5,-23],[6,-23],[6,-22],[8,-22],[8,-21],[9,-21],[9,-20],[10,-20],[10,-19],[11,-19],[11,-18],[12,-18],[12,-17],[13,-17],[13,-16],[14,-16],[14,-15],[31,-15]];

// vertex(0,0);
// vertex(100,0);
// vertex(100,50);
// vertex(0,50);


// setInterval(function(){
//     // if(tanks.has(socket.id))
//     canFire=true;
// },200);


function findTank(element) {
    return element.id == socket.id;
}
function preload()
{
    img = loadImage("../assets/images/tank.png");
}
function setup() {
    createCanvas(windowWidth, windowHeight);
    socket.on('tanks', function (data) {
        tanks = new Map(data.tanks);
        bullets = data.bullets;
        // var index = tanks.findIndex(findTank);
        if(tanks.has(socket.id))
        {
            tank.score = tanks.get(socket.id).score;
            tank.x = tanks.get(socket.id).x;
            tank.y = tanks.get(socket.id).y;
            tank.health = tanks.get(socket.id).health;
            tanks.delete(socket.id);
            dead = false;
        }
        else
        {
            dead = true;
        }
        
    });
    imageMode(CENTER);
    rectMode(CENTER);
    ellipseMode(RADIUS);
    frameRate(60);
}


function fire() {
    socket.emit('fire',{});
}
function myshow(t) {
    push();
    // console.log(t.score);
    translate(t.x, t.y);
    // console.log(t.health);
    var drawWidth = (t.health / 100) * 50;
    fill(0,0,0);
    rect(0,-40,drawWidth,10);
    // stroke(255,0,0);
    // noFill();
    // rect(0,-40,50,10);
    // ellipseMode(RADIUS)
    rotate((t.angle));
    image(img, 0, 0);
    // ellipse(0,0,20,20);
    pop();
}
function myshow2(c) {
    push();
    fill(255,0,0);
    translate(c.x, c.y);
    ellipse(0,0,10,10);
    pop();
}
function update() {
    // console.log(frameRate());
    var angle = atan2(mouseY - height / 2, mouseX - width / 2);
    var a=0,b=0;
    if (keyIsDown(83)) b++;
    if (keyIsDown(87)) b--;
    if (keyIsDown(65)) a--;
    if (keyIsDown(68)) a++;
    socket.emit('move',{x:a,y:b,angle:angle});
	tank.angle = angle;
    if ((keyIsDown(75)||fire===true) && canFire === true) {
        console.log('fire');
        socket.emit('fire',{});
        canFire = false;
        setTimeout(function(){
                canFire = true;
            }, 120);
    }
}
function died(){

  // background(backgroundColor);
 
  // get distance between mouse and circle
  var distance = dist(mouseX - (width / 2), mouseY - ( height / 2), 0, 0); 
  
  // if the distance is less than the circle's radius
  if(distance < 100 * (width/1366))
  {
    isOverCircle = true;
  } else {
    isOverCircle = false;
  }
  
  // draw a circle
  // ellipseMode(CENTER);
  stroke(0);
  strokeWeight(5);
  if(isOverCircle == true)
  {
    fill(100);
    cursor(HAND);
  } else {
    fill(200); 
    cursor(ARROW); 
  }
  ellipse(0, 0, 100, 100);
  
}
 
function mousePressed()
{
  if(isOverCircle == true && dead == true)
  {
    fill(200); 
    cursor(ARROW);
    socket.emit('continue_playing',{});

    // backgroundColor = color(random(255), random(255), random(255));
  }
}
function draw(){
    // if(tank!={})
    background(222, 201, 255);
    translate(width / 2, height / 2);
    scale(width/1366);
    if(Object.keys(tank).length&&!dead)
    {
        translate(-tank.x, -tank.y);
        update();
        myshow(tank);
        for(var i=0;i<tanks.length;i++)
            myshow(tanks[i]);

        for(let [pid, t] of tanks){
                myshow(t);
                // ctx.fillStyle = "purple";
                // circle(player.x,player.y,10);
            }

        for(var i=0;i<bullets.length;i++)
            myshow2(bullets[i]);
    }
    if(dead)
    {

        background(255);
        died();
    }
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function keyPressed() {
  if (keyCode === 84) {
    fire = !fire;
  }
}
