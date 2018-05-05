var socket = io();
var img;
var tank = {}, tank2;
var oldtank = {};
var tanks = new Map();
var oldTanks =  new Map();
var tempOldTanks = new Map();
var oldBullets =  [];
var tempOldBullets = [];
var bullets = [];
var dead = false;
var fire = false;
var canFire = true;
var isOverCircle = false;
var width2 = 2000;
var height2 = 2000;
var tanksInterpolation = 0.35;
var bulletsInterpolation = 0.35;
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
        // console.log(bullets);
        if(oldTanks.size==0)
        {
            oldTanks = tanks;
        }
        if(oldBullets.length==0)
        {
            oldBullets = bullets;
        }
        // console.log(bullets);
        if (tanks.has(socket.id)) {
            dead = false;
            // console.log(tanks.get(socket.id));
            // tank[6] = tanks.get(socket.id)[6];
            // tank[0] = tanks.get(socket.id)[0];
            // tank[2] = tanks.get(socket.id)[2];
            // tank[1] = tanks.get(socket.id)[1];
            // tank[3] = tanks.get(socket.id)[3];
            // tank[4] = tanks.get(socket.id)[4];
            // tanks.delete(socket.id);
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
    // window.requestAnimationFrame(draw2);
}

/**
 * this function draw the tank and health bar
 * @param t
 */

function drawTank(r)
{
    fill(186,174,174);
    switch(r) {
    case 0:
        rect(28,0,25,25);
        break;
    case 1:
        rect(28,0,25,25);
        rect(-28,0,25,25);
        break;
    case 2:
        rect(28,0,25,25);
        rect(0,28,25,25);
        rect(0,-28,25,25);
        break;
    default:
        rect(28,0,25,25);
        rect(-28,0,25,25);
        rect(0,28,25,25);
        rect(0,-28,25,25);
    }
    fill(255,0,0);
    ellipse(0,0,22.5,22.5);
}

function myshow(t) {
    push();
    if(oldTanks.has(t[3]))
    {
        let x1 = lerp(oldTanks.get(t[3])[0],t[0],tanksInterpolation);
        let y1 = lerp(oldTanks.get(t[3])[1],t[1],tanksInterpolation);
        translate(x1, y1);
        var temp = oldTanks.get(t[3]);
        temp[0] = x1;
        temp[1] = y1;
        tempOldTanks.set(t[3],temp);
    }
    else
    {
        translate(t[0], t[1]);
    }
    var drawWidth = (t[4] / 100) * 50;
    fill(0, 0, 0);
    rect(0, -40, drawWidth, 10);
    if (t[3] != socket.id)
        rotate(t[2]);
    else
        rotate(t.angle);
    strokeWeight(4);
    var level = Math.floor(t[6]/5);
    drawTank(level);
    // image(img, 0, 0);
    pop();
}

/**
 * this function draw the bullets
 * @param c
 */
//  function checkAdult(element) {
//     return element[2] = 18;
// }
function myshow2(t) {
    push();
    fill(255, 0, 0);
    let ind = oldBullets.find(o => o[2] == t[2]);
    if(ind !== undefined)
    {
        // console.log('has');
        // console.log(ind);
        let x1 = lerp(ind[0],t[0],bulletsInterpolation);
        let y1 = lerp(ind[1],t[1],bulletsInterpolation);
        translate(x1, y1);
        var temp = ind;
        temp[0] = x1;
        temp[1] = y1;
        tempOldBullets.push(temp);
    }
    else
    {
        translate(t[0], t[1]);
    }
    // translate(c[0], c[1]);
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
    tanks.get(socket.id).angle = angle;
    // tank[2] = angle;
    if ((keyIsDown(75) || fire === true) && canFire === true) {
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
    for (var i = -width2; i <= width2; i += 100) {
        push();
        stroke(0);
        line(-width2, i, width2, i);
        line(i, -height2, i, height2);
        pop();
    }
}
function draw() {
    tempOldTanks = new Map();
    tempOldBullets = [];
    push();
    background(222, 201, 255);
    /*drawing the score*/
    push();
    strokeWeight(4);
    fill(0, 0, 255);
    textSize(50);
    scale(width / 1366);
    if (!dead && tanks.has(socket.id))
        text(tanks.get(socket.id)[6], 0, 0);
    pop();


    translate(width / 2, height / 2);
    scale(width / 1366);

    if (tanks.has(socket.id) && !dead) {
        
        if(oldTanks.has(socket.id))
        {
            let x2 = lerp(oldTanks.get(socket.id)[0],tanks.get(socket.id)[0],tanksInterpolation);
            let y2 = lerp(oldTanks.get(socket.id)[1],tanks.get(socket.id)[1],tanksInterpolation);
            translate(-x2, -y2);
        }
        else
        {
            translate(-tanks.get(socket.id)[0], -tanks.get(socket.id)[1]);
        }
        push();
        noFill();
        stroke(255, 0, 0);
        myBackground();
        rect(0, 0, 2 * width2, 2 * height2);
        pop();
        update();
        for (let [pid, t] of tanks)
            myshow(t);
        for (var i = 0; i < bullets.length; i++)
            myshow2(bullets[i]);
    }
    if (dead) {
        died();
    }
    pop();
    oldTanks = tempOldTanks;
    oldBullets = tempOldBullets;
    //  requestAnimationFrame(draw2);
    // window.requestAnimationFrame(draw2);
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function keyPressed() {
    if (keyCode === 84) {
        fire = !fire;
    }
}
