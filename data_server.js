var express = require('express');
var fs = require('fs');
var favicon = require('serve-favicon');

var app = express();
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/logo.png'));

var port = 3000;
app.listen(port, function(){
  console.log('Server started at '+ new Date()+', on port ' + port+'!');
});//console confirmation of established server

app.get('/', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('index');
});

var userStringToObject = function (userArray) {
    var output = {};//initiates object that will be the user
    output["name"] = userArray[0];
    output["gamesPlayed"] = parseInt(userArray[1]);
    output["wins"] = parseInt(userArray[2]);
    output["losses"] = parseInt(userArray[3]);
    output["paper"] = parseInt(userArray[4]);
    output["rock"] = parseInt(userArray[5]);
    output["scissors"] = parseInt(userArray[6]);
    output["password"] = userArray[7];
    //adds object attributes dependent on index in array
    return output;//returns object as output
}

app.get('/login', function(request, response){
  var user_data={
      name: request.query.player_name,
      password: request.query.player_password
  };//reads data fields
  var users_file=fs.readFileSync('data/users.csv','utf8');//converts users csv to a string
  var rows = users_file.split('\n');//generates array of stringified user objects
  var user_info = [];//array which will hold objectified users
  for(var i=1; i<rows.length-1; i++){//indexing does not include header or whitespace at the end
    var user = userStringToObject(rows[i].split(','));//converts stringified user object to array of stringified values
    user_info.push(user);//adds user to list
  }

  var newUserInfo = true;//boolean which tells if new or current user
  for(i=0;i<user_info.length;i++){
    if(user_info[i]["name"]==user_data["name"]){
      if(user_info[i]["password"]==user_data["password"]){
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        var villains_file=fs.readFileSync('data/villains.csv','utf8');
        console.log("Villains file",villains_file);
        var villainsRows = villains_file.split('\n');
        console.log("Villains rows",villainsRows);
        var villain_data = [];
        for(var i=1; i<rows.length-1; i++){
          var villain_d = villainsRows[i].split(',');
          console.log(villain_d);
          var villain = {};
          villain["name"] = villain_d[0];
          villain["gamesPlayed"] = parseInt(villain_d[1]);
          villain["wins"] = parseInt(villain_d[2]);
          villain["losses"] = parseInt(villain_d[3]);
          villain["paper"] = parseInt(villain_d[4]);
          villain["rock"] = parseInt(villain_d[5]);
          villain["scissors"] = parseInt(villain_d[6]);
          villain_data.push(villain);
        }
        console.log("Villain_data",villain_data);
        response.render('game', {user:user_data,villain: villain_data});

        //this is where it's happening


      } else {
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.render('index', {message:"Invalid password!"});
        console.log("Wrong password!");

        //document.getElementById("feedback").classList.remove("hidden");
        //document.getElementById("feedback").classList.add("visible");
        //error message
        //console.log(user_info[i]["password"] + " " + user_data["password"]);//tool for console to compare passwords, obvious security flaw for final project

        //regenerate index, insert username and password
      }
      newUserInfo = false;
    }
  }

  if (newUserInfo) {
    //adds new user and goes to game page, maybe later make it new page?
  }
});

app.get('/:user/results', function(request, response){
  var user_data={
      name: request.params.user,
      weapon: request.query.weapon
  };//also add villain request
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('results', {user:user_data});
});

app.get('/rules', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('rules');
});

app.get('/stats', function(request, response){
  //load the csv
  var users_file=fs.readFileSync('data/users.csv','utf8');
  var villains_file=fs.readFileSync('data/villains.csv','utf8');
  //fs.writeFile('data/text.txt','Message');//replaces first argument (file) content with second argument (text) content
  console.log(villains_file);
  console.log(users_file);
  //parse the csv
  var rows = users_file.split('\n');
  var villainsRows = villains_file.split('\n');
  //converts strings into arrays
  console.log(rows);
  console.log(villainsRows);
  //logs to developer console for reference
  var user_data = [];
  var villain_data = [];
  for(var i=1; i<rows.length-1; i++){
    var user_d = rows[i].split(',');
    console.log(user_d);
    var user = {};
    user["name"] = user_d[0];
    user["gamesPlayed"] = parseInt(user_d[1]);
    user["wins"] = parseInt(user_d[2]);
    user["losses"] = parseInt(user_d[3]);
    user["paper"] = parseInt(user_d[4]);
    user["rock"] = parseInt(user_d[5]);
    user["scissors"] = parseInt(user_d[6]);
    user["password"] = user_d[7];

    //add the user to the array of users
    user_data.push(user);

  }
  for(var i=1; i<rows.length-1; i++){
    var villain_d = villainsRows[i].split(',');
    console.log(villain_d);
    var villain = {};
    villain["name"] = villain_d[0];
    villain["gamesPlayed"] = parseInt(villain_d[1]);
    villain["wins"] = parseInt(villain_d[2]);
    villain["losses"] = parseInt(villain_d[3]);
    villain["paper"] = parseInt(villain_d[4]);
    villain["rock"] = parseInt(villain_d[5]);
    villain["scissors"] = parseInt(villain_d[6]);
    villain_data.push(villain);
  }
  console.log(user_data);
  console.log(villain_data);
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('stats', {user:user_data});
});
app.get('/about', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('about');
});
