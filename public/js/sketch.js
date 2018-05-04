var socket = io();
var img;
var tank = {}, tank2;
var tanks = [];
var bullets = [];
var dead = false;
var fire = false;
var canFire = true;
var isOverCircle = false;
// var myroom = <%-JSON.stringify(myroom)%>;

console.log(myroom);
socket.emit('join', myroom);

function preload() {
    img = loadImage("../assets/images/tank.png");
}
async function setup() {
    createCanvas(windowWidth, windowHeight);
    socket.on('tanks', function (data) {
        tanks = new Map(data.tanks);
        bullets = data.bullets;
        console.log(bullets);
        if (tanks.has(socket.id)) {
            dead = false;
            // console.log(tanks.get(socket.id));
            tank[6] = tanks.get(socket.id)[6];
            tank[0] = tanks.get(socket.id)[0];
            tank[2] = tanks.get(socket.id)[2];
            tank[1] = tanks.get(socket.id)[1];
            tank[4] = tanks.get(socket.id)[4];
            tanks.delete(socket.id);
        }
        else {
            dead = true;
        }
        // draw2();
    });
    imageMode(CENTER);
    rectMode(CENTER);
    ellipseMode(RADIUS);
    textAlign(LEFT, TOP);
    frameRate(60);
    // requestAnimationFrame(draw2);
}

/**
 * this function draw the tank and health bar
 * @param t
 */
function myshow(t) {
    push();
    translate(t[0], t[1]);
    var drawWidth = (t[4] / 100) * 50;
    fill(0, 0, 0);
    rect(0, -40, drawWidth, 10);
    if (t.id != socket.id)
        rotate(/*t[2]*/tank.angle);
    image(img, 0, 0);
    pop();
}

/**
 * this function draw the bullets
 * @param c
 */
function myshow2(c) {
    push();
    fill(255, 0, 0);
    translate(c[0], c[1]);
    ellipse(0, 0, 10, 10);
    pop();
}

/**
 * this function track the move direction or fire event and send the request to server
 */
function update() {
    // console.log(frameRate());
    var angle = atan2(mouseY - height / 2, mouseX - width / 2);
    var a = 0, b = 0;
    if (keyIsDown(83)) b++;
    if (keyIsDown(87)) b--;
    if (keyIsDown(65)) a--;
    if (keyIsDown(68)) a++;
    socket.emit('move', { x: a, y: b, angle: angle });
    tank.angle = angle;
    if ((keyIsDown(75) || fire === true) && canFire === true) {
        console.log('fire');
        socket.emit('fire', {});
        canFire = false;
        setTimeout(function () {
            canFire = true;
        }, 120);
    }
}
function died() {

    var distance = dist(mouseX - (width / 2), mouseY - (height / 2), 0, 0);

    if (distance < 100 * (width / 1366)) {
        isOverCircle = true;
        fill(100);
    } else {
        isOverCircle = false;
        fill(200);
    }
    ellipse(0, 0, 100, 100);
}

function mousePressed() {
    if (isOverCircle == true && dead == true) {
        fill(200);
        socket.emit('continue_playing', {});
    }
}
function myBackground() {
    for (var i = -2000; i <= 2000; i += 100) {
        push();
        stroke(0);
        line(-2000, i, 2000, i);
        line(i, -2000, i, 2000);
        pop();
    }
}
function draw() {
    push();
    background(222, 201, 255);
    /*drawing the score*/
    push();
    strokeWeight(4);
    fill(0, 0, 255);
    textSize(50);
    scale(width / 1366);
    if (Object.keys(tank).length && !dead)
        text(tank[6], 0, 0);
    pop();


    translate(width / 2, height / 2);
    scale(width / 1366);

    if (Object.keys(tank).length && !dead) {
        
        translate(-tank[0], -tank[1]);
        push();
        noFill();
        stroke(255, 0, 0);
        myBackground();
        rect(0, 0, 4000, 4000);
        pop();
        update();
        myshow(tank);
        for (let [pid, t] of tanks)
            myshow(t);
        for (var i = 0; i < bullets.length; i++)
            myshow2(bullets[i]);
    }
    else if (dead) {
        died();
    }
    pop();
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
