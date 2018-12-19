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
});

app.get('/', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('index');
});

app.get('/login', function(request, response){
  var user_data={
      name: request.query.player_name,
      password: request.query.player_password
  };
  var users_file=fs.readFileSync('data/users.csv','utf8');
  var rows = users_file.split('\n');
  var user_info = [];
  for(var i=1; i<rows.length-1; i++){
    var user_d = rows[i].split(',');
    var user = {};
    user["name"] = user_d[0];
    user["password"] = user_d[7];
    user_info.push(user);
  }
  for(i=0;i<user_info.length;i++){
    if(user_info[i]["name"]==user_data["name"]){

      if(user_info[i]["password"]==user_data["password"]){
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        response.render('game', {user:user_data});
      }

      else{
          document.getElementById("feedback").classList.remove("visible");
          document.getElementById("feedback").classList.add("hidden");
          document.getElementById("enter_name").classList.remove("hidden");
          document.getElementById("enter_name").classList.add("visible");
        //error message
        //regenerate index, insert username and password
      }

    }
    else{
      //create new user and send to csv
    }

  }

});

app.get('/:user/results', function(request, response){
  var user_data={
      name: request.params.user,
      weapon: request.query.weapon
  };//also add villain request
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.send(JSON.stringify(user_data));
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
  console.log(rows);
  console.log(villainsRows);
  var user_data = [];
  var villain_data = [];
  for(var i=1; i<rows.length-1; i++){
    var user_d = rows[i].split(',');
    var villain_d = villainsRows.split(',');
    console.log(user_d);
    console.log(villain_d);
    var user = {};
    var villain = {};
    user["name"] = user_d[0];
    user["gamesPlayed"] = parseInt(user_d[1]);
    user["wins"] = parseInt(user_d[2]);
    user["losses"] = parseInt(user_d[3]);
    user["paper"] = parseInt(user_d[4]);
    user["rock"] = parseInt(user_d[5]);
    user["scissors"] = parseInt(user_d[6]);
    villain["name"] = user_d[0];
    villain["gamesPlayed"] = parseInt(user_d[1]);
    villain["wins"] = parseInt(user_d[2]);
    villain["losses"] = parseInt(user_d[3]);
    villain["paper"] = parseInt(user_d[4]);
    villain["rock"] = parseInt(user_d[5]);
    villain["scissors"] = parseInt(user_d[6]);
    user["password"] = user_d[7];

    //add the user to the array of users
    user_data.push(user);
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
