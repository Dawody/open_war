var mysql=require('mysql');
var express=require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var session=require('express-session');
var passport=require('passport');
var cookieparser=require('cookie-parser');
var expressvalidator=require('express-validator');
var flash=require('connect-flash');
var localstrategy=require('passport-local'),strategy;
var engines = require('consolidate');
var socket=require('socket.io');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var working_rooms=[];
var myreq;
// create application/x-www-form-urlencoded parser
//var urlencodedParser = bodyParser.urlencoded({ extended: false })

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "open_war"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//intialize app
var app=express();
var server =app.listen(3000);
console.log("myserver is running");

app.use(express.static('public'));
app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'views'));
//app.engine('handlebars', exphbs({defaultLayout:'layout'}));
////intialize session
app.use(session({secret:"1gghk5hhhhhhhgchgcgc2",resave:false,saveUninitialized:false}));
//intialize cookie
app.use(cookieparser());
//express validation
app.use(expressvalidator({
	errorformater: function(param,msg,value){
		var namespace =param.split('.')
		,root =namespace.shift()
		, formparam =root;
        
        while(namespace.length){
        	formparam += '{' +namespace.shift() +'}';
        }
        return {
        	param : formparam,
        	msg : msg,
            value :value
        };
	}
}));

//connect flash
app.use(flash());

app.use(function(req,res,next){
	res.locals.success_msg=req.flash('success_msg');
	res.locals.error_msg=req.flash('error_msg');
	res.locals.error=req.flash('error');
	next();
});
//passport

app.use(passport.initialize());
app.use(passport.session());
//intialize socket
var io=socket(server);
io.sockets.on('connection',newconnection);



function newconnection(socket) {
	console.log('new connection from: '+ socket.id);
}
//////////////////////////////////////////////////////////////////////
app.get('/',function(req,res){
 res.sendfile('index');
});

///////////////////////////////////////////////////////////////////////

app.get('/login',function(req,res){
 if(typeof req.session.pname_session!=="undefined" && typeof req.session.ppass_session!=="undefined" )
         {
           res.redirect('/rooms');
        
         }
         else{
 res.render('login');
}
});
///////////////////////////////////////////////////////////////////////////
app.get('/create_room_error',function(req,res){
res.render('create_room_error');
});

///////////////////////////////////////////////////////////////////

app.get('/Sign_up',function(req,res){
 res.render('Sign_up');
});


////////////////////////////////////////////////////////
app.get('/Sign_up_error',function(req,res){
 res.render('Sign_up_error');
});


//////////////////////////////////////////////////////////////////

app.post('/Sign_up', urlencodedParser ,function(req, res){
      if (!req.body) return res.sendStatus(400)
  //res.send('index.html' + req.body.username);
  
var data={
	uname:req.body.username,
	uemail:req.body.useremail,
	upass:req.body.userpass
}
req.checkBody('username','Name is required').notEmpty();
req.checkBody('useremail','Email is required').notEmpty();
req.checkBody('useremail','Email isnot valid').isEmail();
req.checkBody('userpass','password is required').notEmpty();
 var n = data.uname.indexOf(" ");
 var b = data.uemail.indexOf(" ");
 var c = data.upass.indexOf(" ");
var error=req.validationErrors();
if(error)
{
	  
        res.render('Sign_up',{
      errors:error
});
    

}
else if( n!=-1 || b!=-1||c!=-1)
{
	res.redirect('Sign_up_error.html');
}
else{
var sql = 'SELECT COUNT(*) AS namecount FROM Player WHERE Pname = ?'
con.query(sql, [data.uname], function(err, rows, fields) {
  if (err) throw err;
  console.log(rows[0].namecount);

  if(rows[0].namecount>0)
  {
  	res.redirect('Sign_up_error.html');
  }
  else {
var sql = "INSERT INTO Player  (Pname,Pemail,Ppassword) VALUES (?,?,?)";
  con.query(sql,[data.uname,data.uemail,data.upass], function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
    console.log(data);
    req.flash('success_msg','Your are now registered and can login to our Game');
 res.redirect('/login');
  });

  }
});
}

});

////////////////////////////////////////////////////////////////////////////////////////////


app.post('/login', urlencodedParser ,function(req, res){
      if (!req.body) return res.sendStatus(400)
      	var data={
	uname:req.body.username,
	upass:req.body.password
}
req.checkBody('username','Name is required').notEmpty();
req.checkBody('password','password is required').notEmpty();


var error=req.validationErrors();
if(error)
{
	  
        res.render('login',{
      errors:error
});
    

}

else{
var sql = 'SELECT * FROM Player WHERE Pname = ? and Ppassword= ?';
con.query(sql, [data.uname,data.upass], function(err, rows, fields) {
  if (err) throw err;

  if(rows.length===0)
  {
  	res.redirect('login_error.html');
  }
  else {
   req.session.pname_session=rows[0].Pname;
   req.session.ppass_session=rows[0].Ppassword;
      req.session.pemail_session=rows[0].Pemail;
      req.session.pscore_session=rows[0].P_latest_score;
      req.session.phighscore_session=rows[0].P_high_score;
      req.session.totalscore_session=rows[0].P_total_score;
      myreq= req.session.pname_session;
     // console.log(req.session);
     if(typeof req.session.pname_session!=="undefined" && typeof req.session.ppass_session!=="undefined" )
         {
           
          res.redirect('profile');
     }
       else{
         res.redirect('/Sign_up');
       }
  
  }
});
}

  });
/////////////////////////////////////////////////////////////////////////

app.get('/profile',function(req,res){
	console.log( req.session.pscore_session);
  if(typeof req.session.pname_session!=="undefined" && typeof req.session.ppass_session!=="undefined" )
         {
           var sql = 'SELECT * FROM Player WHERE Pname = ?';
   con.query(sql, [req.session.pname_session], function(err, rows, fields) {
  if (err) throw err;
  var score=rows[0].P_latest_score;
   var highscore=rows[0].P_high_score;
   var totalscore=rows[0].P_total_score;
     res.render('profile',{username:req.session.pname_session ,useremail:req.session.pemail_session,userscore:score,userhighs:highscore,usertotalscore:totalscore});
 });
        
         }
       else{
         res.redirect('/Sign_up');
       }

});

////////////////////////////////////////////////////////////

app.get('/Sign_up_error',function(req,res){
 res.redirect('Sign_up_error.html');
});

////////////////////////////////////////////////////////////////////

app.post('/logout',function(req,res){
 console.log(req.session);
 req.session.destroy();
console.log(req.session);
res.redirect('/login');
});

/////////////////////////////////////////////////////////////////////

app.get('/rooms',function(req,res){
   if(typeof req.session.pname_session!=="undefined" && typeof req.session.ppass_session!=="undefined" )
         {
             var data={
              working:working_rooms
             }
          res.render('rooms',{data});

     }
       else{
         res.redirect('/Sign_up');
       }

});

//////////////////////////////////////////////////////////////////////
app.post('/create_room',urlencodedParser,function(req,res){


     if (!req.body) return res.sendStatus(400);

     var room_crated={
      room_name:req.body.roomname
     }

     req.checkBody('roomname','Name is required').notEmpty();
     var error=req.validationErrors();


if(error)
{
     res.render('rooms',{
     errors:error
});
    
}


if (working_rooms.indexOf(req.body.roomname)>-1) {
  //////////////////////////////////////////////////////////////////////////////
    /////////////////////////redirect to room error//////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
          res.redirect('create_room_error');
      }
     else {
  var sql = 'SELECT * FROM room WHERE Room_name = ?';
con.query(sql, [room_crated.room_name], function(err, rows, fields) {
  if (err) throw err;

  if(rows.length>0)
  {
    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////redirect to room error//////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    res.redirect('create_room_error');
  }
  else{
    working_rooms.push(req.body.roomname);
 
var sql = "INSERT INTO room  (Room_name) VALUES (?)";
  con.query(sql,[room_crated.room_name], function (err, result) {
    if (err) throw err;
    console.log("1 record inserted into room");
    console.log(room_crated);
    console.dir(working_rooms);
    req.flash('success_msg','Your are now Created room and enter Game');

    //////////////////////insert into player_room///////////////
    var sql = "INSERT INTO player_room  (Rname,P_name_fk) VALUES (?,?)";
  con.query(sql,[room_crated.room_name,req.session.pname_session], function (err, result) {
    if (err) throw err;
    console.log("1 record inserted into player_room");
    req.flash('success_msg','Your are now Created room and enter Game');
    
    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////redirect to room link//////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
 res.redirect('/profile');
  });

});
}
});
}
});

//////////////////////////////////////////////////////////////////////////////////////

app.get('/joined_rooms',function(req,res){
  console.log( req.session.pscore_session);
  if(typeof req.session.pname_session!=="undefined" && typeof req.session.ppass_session!=="undefined" )
         {
           var sql = 'SELECT * FROM player_room WHERE P_name_fk = ?';
   con.query(sql, [req.session.pname_session], function(err, rows, fields) {
  if (err) throw err;
        var count=rows.length;
        var i;
        var myrooms=[];
        var myscore=[];
        for (i=0;i<count;i++)
        {
          myrooms[i]=rows[i].Rname;
          myscore[i]=rows[i].P_score;
        }
       var data={
        joined:myrooms,
        joined_score:myscore
       }
      res.render('joined_rooms',{data});
 });
        
         }
       else{
         res.redirect('/Sign_up');
       }

});
///////////////////////////////////////////////////////////////
app.post('/joinroom', urlencodedParser ,function(req, res){
     if (!req.body) return res.sendStatus(400);

     var room_joined={
      room_name:req.body.gender
     }

     req.checkBody('gender','select from selections').notEmpty();
     var error=req.validationErrors();


if(error)
{
     res.render('rooms',{
     errors:error
});
    
}


if (working_rooms.indexOf(req.body.gender)>-1) {
  var sql = 'SELECT * FROM room WHERE Room_name = ?';
con.query(sql, [room_joined.room_name], function(err, rows, fields) {
  if (err) throw err;

  if(rows.length>0)
  {
     var sql = 'SELECT * FROM player_room WHERE Rname = ? and P_name_fk = ?';
con.query(sql, [room_joined.room_name,req.session.pname_session], function(err, rows1, fields) {
  if (err) throw err;

  if (rows1.length==0) {
      var sql = "INSERT INTO player_room  (Rname,P_name_fk) VALUES (?,?)";
  con.query(sql,[room_joined.room_name,req.session.pname_session], function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
    console.log(room_joined);
    console.dir(working_rooms);
    req.flash('success_msg','Your are now Created room and enter Game');
    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////redirect to room link//////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
 res.redirect('/profile');
  });
  }
  else
  {
 res.redirect('rooms');
  }
 
});
}

else{
  //////////////////////////////////////////////////////////////////////////////
    /////////////////////////redirect to room error//////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

          res.redirect('rooms');
      }
     
    });
}
});

//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////
//////function take score and req to insert score in row with the username in player table////
/////////////////////////////////////////////////////////////////


function store_score_player(newscore,req){
  var score=parseInt(newscore);
   
  var sql = 'SELECT * FROM Player WHERE Pname = ?';
con.query(sql, [myreq], function(err, rows, fields) {
  if (err) throw err;
   var highscore=rows[0].P_high_score;
   var totalscore=rows[0].P_total_score;
   totalscore=totalscore+score;
   if(score>highscore)
   {
    var sql = 'UPDATE  Player SET P_latest_score = ?,P_high_score = ?, P_total_score = ?  WHERE Pname = ? ';
  con.query(sql,[score,score,totalscore,myreq], function (err, result,rows,fields) {
    if (err) throw err;
    console.log("new score inserted");
   
  });
   }
  else{
    var sql = 'UPDATE  Player SET P_latest_score = ?,P_high_score = ?, P_total_score = ?  WHERE Pname = ? ';
  con.query(sql,[score,highscore,totalscore,req.session.pname_session], function (err, result,rows,fields) {
    if (err) throw err;
    console.log("new score inserted");
  });

   }
});
}

//////////////////////////////////////////////////////////////
//////function take score ,room and req to iner score in row with the username and room name in room_player table////
/////////////////////////////////////////////////////////////////
function store_score_room(newscore,room,req){
  var score=parseInt(newscore);
   
  
    var sql = 'UPDATE  player_room SET P_score = ?  WHERE P_name_fk = ? and Rname =? ';
  con.query(sql,[score,req.session.pname_session,room], function (err, result,rows,fields) {
    if (err) throw err;
    console.log("new score inserted into player_room");
   
  });
  
}

module.exports = router;