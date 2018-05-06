var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "team5",
  password: "TanKwaR",
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  /*Create a database named "mydb":*/
  con.query("CREATE DATABASE team5db", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});
