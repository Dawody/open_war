var socket = io();
var img;
var tank={}, tank2;
var tanks = [];
var bullets = [];
var dead = false;
var fire = false;
var canFire = true;
var isOverCircle = false;


function getTank(id) {
    return id == socket.id;
}


function findTank(element) {
    return element.id == socket.id;
}
function preload()
{
    img = loadImage("../assets/images/tank.png");
}
async function setup() {
    createCanvas(windowWidth, windowHeight);
    socket.on('tanks', function (data) {
        tanks = new Map(data.tanks);
        bullets = data.bullets;
        if(tanks.has(socket.id))
        {
            dead = false;
            tank[6] = tanks.get(socket.id)[6];
            tank[0] = tanks.get(socket.id)[0];
            tank[2] = tanks.get(socket.id)[2];
            tank[1] = tanks.get(socket.id)[1];
            tank[4] = tanks.get(socket.id)[4];
            tanks.delete(socket.id);
        }
        else
        {
            dead = true;
        }
        
    });
    //awiat new Promise(function (resolve){

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
      //      resolve(data);

        });

    //});

    imageMode(CENTER);
    rectMode(CENTER);
    ellipseMode(RADIUS);
    textAlign(LEFT,TOP);
    // textAlign(LEFT);
    frameRate(60);
    // noLoop();
	// requestAnimationFrame(draw2);
}


function fire() {
    socket.emit('fire',{});
}

/**
 * this function draw the tank and health bar
 * @param t
 */
function myshow(t) {
    push();
    // console.log(t[5]);
    translate(t[0], t[1]);
    // console.log(t[4]);
    var drawWidth = (t[4] / 100) * 50;
    fill(0,0,0);
    rect(0,-40,drawWidth,10);
    // stroke(255,0,0);
    // noFill();
    // rect(0,-40,50,10);
    // ellipseMode(RADIUS)
    rotate(t[2]);
    image(img, 0, 0);
    // ellipse(0,0,20,20);
    pop();
}

/**
 * this function draw the bullets
 * @param c
 */
function myshow2(c) {
    push();
    fill(255,0,0);
    translate(c[0], c[1]);
    ellipse(0,0,10,10);
    pop();
}

/**
 * this function track the move direction or fire event and send the request to server
 */
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
  // stroke(0);
  // strokeWeight(5);
  if(isOverCircle == true)
  {
    fill(100);
    // cursor(HAND);
  } else {
    fill(200); 
    // cursor(ARROW); 
  }
  ellipse(0, 0, 100, 100);
  
}
 
function mousePressed()
{
  if(isOverCircle == true && dead == true)
  {
    fill(200); 
    // cursor(ARROW);
    socket.emit('continue_playing',{});

    // backgroundColor = color(random(255), random(255), random(255));
  }
}
function myBackground()
{
    for(var i=-2000;i<=2000;i+=100)
    {
        push();
        stroke(0);
        line(-2000,i,2000,i);
        line(i,-2000,i,2000);
        pop();
    }
}
function draw(){
    // if(tank!={})
    background(222, 201, 255);
    // background(lerpColor(color(204, 102, 0), color(0, 102, 153), 0.1));
    push();
    strokeWeight(4);
    fill(0,0,255);
    textSize(50);
    scale(width/1366);
    if(Object.keys(tank).length&&!dead)
        text(tank[6],/*-width/2*/ + 0/*+ (-width/2) * 0.2*/,/*-height/2*/  + 0 /*+ (-height/2) * 0.2*/);
    pop();
    translate(width / 2, height / 2);
    scale(width/1366);
    
    if(Object.keys(tank).length&&!dead)
    {
        
        
        translate(-tank[0], -tank[1]);

        push();
        
        // text('omar',-300,-300);
        noFill();
        stroke(255,0,0);
        myBackground();

        rect(0, 0, 4000, 4000);
        pop();
        update();
        myshow(tank);
        for(var i=0;i<tanks.length;i++)
            myshow(tanks[i]);

        for(let [pid, t] of tanks){
                myshow(t);
            }

        for(var i=0;i<bullets.length;i++)
            myshow2(bullets[i]);
    }
    if(dead)
    {
        background(255);
        died();
    }

//	requestAnimationFrame(draw2);
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function keyPressed() {
  if (keyCode === 84) {
    fire = !fire;
  }
}
