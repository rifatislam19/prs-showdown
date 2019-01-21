var express = require('express');
var fs = require('fs');
var favicon = require('serve-favicon');

var app = express();
app.use(express.static('public'));
app.set('views', __dirname + '/views');//assigns views folder
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/logo.png'));//favicon logo access

var port = process.env.PORT || 8000;
app.listen(port);

var count = 0;//strategy component for specific villain Gato

app.get('/', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('index', {message:false, message2:false});
});//just accessing home without error messages

var userArrayToObject = function (userArray) {
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

var villainArrayToObject = function (villain_d) {
  var villain = {};//initiates object that will be villain
  villain["name"] = villain_d[0];
  villain["gamesPlayed"] = parseInt(villain_d[1]);
  villain["wins"] = parseInt(villain_d[2]);
  villain["losses"] = parseInt(villain_d[3]);
  villain["paper"] = parseInt(villain_d[4]);
  villain["rock"] = parseInt(villain_d[5]);
  villain["scissors"] = parseInt(villain_d[6]);
  villain["strategy"] = villain_d[7];
  //adds object attributes dependent on index in array
  return villain;//returns object as output
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
    var user = userArrayToObject(rows[i].split(','));//converts stringified user object to array of stringified values
    user_info.push(user);//adds user to list
  }

  if(user_data["name"]==""||user_data["password"]==""){//does not allow either empty username or empty password
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render('index', {message:false, message2:true});//links back to same page with error message
  }else{
    var newUserInfo = true;//boolean which tells if new or current user
    for(i=0;i<user_info.length;i++){
      if(user_info[i]["name"]==user_data["name"]){
        response.status(200);
        response.setHeader('Content-Type', 'text/html')
        if(user_info[i]["password"]==user_data["password"]){
          var villains_file=fs.readFileSync('data/villains.csv','utf8');
          var villainsRows = villains_file.split('\n');
          var villain_data = [];
          for(var i=1; i<villainsRows.length-1; i++){
            var villain_d = villainsRows[i].split(',');
            var villain = villainArrayToObject(villain_d);
            villain_data.push(villain);
          }
          response.render('game', {user:user_data,villain:villain_data,message3:false});//begins name with already existent user
        } else {
          response.render('index', {message:true, message2:false});//links back to index page with wrong password error message
        }
        newUserInfo = false;//in the event of loop breaking error, does not allow new user with incorrect information to be added
      }
    }

    if (newUserInfo) {
      var new_user = {
        name: user_data["name"],
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        paper: 0,
        rock: 0,
        scissors: 0,
        password: user_data["password"]
      }//given that new username was inputted, new user object created
      user_info.push(new_user);//new user object added to list of users
      var new_user_data = "name,gamesPlayed,wins,losses,paper,rock,scissors,password\n";
      for(i=0; i<user_info.length; i++){
        new_user_data += user_info[i]["name"] + ",";
        new_user_data += user_info[i]["gamesPlayed"] + ",";
        new_user_data += user_info[i]["wins"] + ",";
        new_user_data += user_info[i]["losses"] + ",";
        new_user_data += user_info[i]["paper"] + ",";
        new_user_data += user_info[i]["rock"] + ",";
        new_user_data += user_info[i]["scissors"] + ",";
        new_user_data += user_info[i]["password"];
        new_user_data += "\n";
      }
      fs.writeFileSync('data/users.csv', new_user_data,'utf8');
      //converts user information back into a string and writes it to csv file
      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      var villains_file=fs.readFileSync('data/villains.csv','utf8');
      var villainsRows = villains_file.split('\n');
      var villain_data = [];
      for(var i=1; i<villainsRows.length-1; i++){
        var villain_d = villainsRows[i].split(',');
        var villain = villainArrayToObject(villain_d);
        villain_data.push(villain);
      }
      response.render('game', {user:user_data,villain:villain_data, message3:false});//links to game page with appropriate villain information
    }
  }
});

app.get('/:user/results', function(request, response){
  var user_data={
      name: request.params.user,
      weapon: request.query.weapon,
      villain_choice: request.query.villain_choice
  };//object of relevant user information from parameters

    var users_file=fs.readFileSync('data/users.csv','utf8');//converts users csv to a string
    var rows = users_file.split('\n');//generates array of stringified user objects
    var user_info = [];//array which will hold objectified users
    for(var i=1; i<rows.length-1; i++){//indexing does not include header or whitespace at the end
      var user = userArrayToObject(rows[i].split(','));//converts stringified user object to array of stringified values
      user_info.push(user);//adds user to list
    }
    var villains_file=fs.readFileSync('data/villains.csv','utf8');
    var villainsRows = villains_file.split('\n');
    var villain_data = [];
    for(var i=1; i<villainsRows.length-1; i++){
      var villain_d = villainsRows[i].split(',');
      var villain = villainArrayToObject(villain_d);
      villain_data.push(villain);
    }//creates array of villains

    var ai_throw = 0;//variable that serves as placeholder for randomly chosen throws
    var villain_throw = "";

    if (user_data.villain_choice=="Boss"){ villain_throw = "rock"; }//Boss always throws rock because it's a firm choice
    else if (user_data.villain_choice=="Spock"){ villain_throw = "scissors"; }//Spock always throws scissors because it looks cool
    else if (user_data.villain_choice=="Regal"){ villain_throw = "paper"; }//Regal always throws paper because they're writing up deals
    else if (user_data.villain_choice=="Mickey"){ villain_throw = user_data.weapon; }//Mickey always throws the user's weapon because he's a trickster
    else if (user_data.villain_choice=="Magician"){
      if(user_data.weapon=="paper"){ villain_throw = "scissors"; }
      else if(user_data.weapon=="rock"){ villain_throw = "paper"; }
      else if(user_data.weapon=="scissors"){ villain_throw = "rock"; }
      //Magician always wins because he reads minds
    } else if (user_data.villain_choice=="Bones"){
      if(user_data.weapon=="scissors"){ villain_throw = "paper"; }
      else if(user_data.weapon=="paper"){ villain_throw = "rock"; }
      else if(user_data.weapon=="rock"){ villain_throw = "scissors"; }
      //Bones always loses because they're barely a hand, let alone a funcitioning user
    } else if (user_data.villain_choice=="Pixie"){
      ai_throw = Math.floor(Math.random()*3)+1;
      if(ai_throw==1){ villain_throw = "paper"; }
      else if(ai_throw==2){ villain_throw = "rock"; }
      else if(ai_throw==3){ villain_throw = "scissors"; }
      //randomly chooses a throw with 33/33/33 probability because pixelation seems the most computerized (ie random)
    } else if (user_data.villain_choice=="Harry"){
      ai_throw = Math.floor(Math.random()*2)+1;
      if(ai_throw==1){ villain_throw = "paper"; }
      else if(ai_throw==2){ villain_throw = "rock"; }
      //Harry doesn't have scissors because if he did he would have bothered to cut his hair
    } else if (user_data.villain_choice=="Mr"){
      user_data.villain_choice = "Mr Modern";
      ai_throw = Math.floor(Math.random()*2)+1;
      if(ai_throw==1){ villain_throw = "scissors"; }
      else if(ai_throw==2){ villain_throw = "rock"; }
      //Mr Modern is paperless in a modern world
    } else if (user_data.villain_choice=="Manny"){
      ai_throw = Math.floor(Math.random()*2)+1;
      if(ai_throw==1){ villain_throw = "paper"; }
      else if(ai_throw==2){ villain_throw = "scissors"; }
      //Manny doesn't use rocks to keep the prestine nails in one piece
    } else if (user_data.villain_choice=="Comic"){
      user_data.villain_choice="Comic Hans";
      var d = new Date();
      var n = d.toLocaleTimeString();
      ai_throw = parseInt(n.substring(6,8));
      if(ai_throw%3==0){ villain_throw = "paper"; }
      else if(ai_throw%3==1){ villain_throw = "rock"; }
      else if(ai_throw%3==2){ villain_throw = "scissors"; }
      //Seems like a write that would hold a watch well, takes input based on the seconds value of the time of day
    } else if (user_data.villain_choice=="Gato"){
      if(count%15<=5){ ai_throw = 1; }
      else if(count%15<=10&&count%15>5){ ai_throw = 2; }
      else if(count%15<=15&&count%15>10){ ai_throw = 3; }
      count++;//updates Gato's count of when to pounce and change strategies
      if(ai_throw==1){ villain_throw = "paper"; }
      else if(ai_throw==2){ villain_throw = "rock"; }
      else if(ai_throw==3){ villain_throw = "scissors"; }
      //lulls individual user into a false sense of security (note ignores log on and log offs, only restarts when window is reopened)
    }
    var type = "";
    if(user_data.weapon==villain_throw){
      type="tie";
      //user tied their game
    }
    else if((user_data.weapon=="paper"&&villain_throw=="rock")||(user_data.weapon=="scissors"&&villain_throw=="paper")||(user_data.weapon=="rock"&&villain_throw=="scissors")){
      type="win";
      //user won their game
      for(i=0;i<user_info.length;i++){
        if(user_info[i]["name"]==user_data.name){
          user_info[i]["wins"]++;
          }
      }
      //adds a win tally for user
      for(i=0;i<villain_data.length;i++){
        if(villain_data[i]["name"]==user_data.villain_choice){
          villain_data[i]["losses"]++;
        }
      }
      //adds a loss tally for villain
    }
    else if ((user_data.weapon=="rock"&&villain_throw=="paper")||(user_data.weapon=="paper"&&villain_throw=="scissors")||(user_data.weapon=="scissors"&&villain_throw=="rock")){
      type="loss";
      //user lost their game
      for(i=0;i<user_info.length;i++){
        if(user_info[i]["name"]==user_data.name){
          user_info[i]["losses"]++;
        }
      }
      //adds a loss tally for user
      for(i=0;i<villain_data.length;i++){
        if(villain_data[i]["name"]==user_data.villain_choice){
          villain_data[i]["wins"]++;
        }
      }
      //adds a win tally for villain
    }
    if(user_data.weapon!="blank"&&user_data.villain_choice!="blank"){
      for(i=0;i<user_info.length;i++){
        if(user_info[i]["name"]==user_data.name){
          user_info[i]["gamesPlayed"]++;
          user_data.password = user_info[i]["password"];//first time in loop where password can be taken from csv for linking back to page
          if(user_data.weapon=="paper"){ user_info[i]["paper"]++; }
          if(user_data.weapon=="rock"){ user_info[i]["rock"]++; }
          if(user_data.weapon=="scissors"){ user_info[i]["scissors"]++; }
        }
        //updates choice and games played attributes for users
      }
      for(i=0;i<villain_data.length;i++){
        if(villain_data[i]["name"]==user_data.villain_choice){
          villain_data[i]["gamesPlayed"]++;
          if(villain_throw=="paper"){ villain_data[i]["paper"]++; }
          if(villain_throw=="rock"){ villain_data[i]["rock"]++; }
          if(villain_throw=="scissors"){ villain_data[i]["scissors"]++; }
        }
        //updates choice and games played attributes for users
      }
    }
    var new_user_data = "name,gamesPlayed,wins,losses,paper,rock,scissors,password\n";
    for(i=0; i<user_info.length; i++){
      new_user_data += user_info[i]["name"] + ",";
      new_user_data += user_info[i]["gamesPlayed"] + ",";
      new_user_data += user_info[i]["wins"] + ",";
      new_user_data += user_info[i]["losses"] + ",";
      new_user_data += user_info[i]["paper"] + ",";
      new_user_data += user_info[i]["rock"] + ",";
      new_user_data += user_info[i]["scissors"] + ",";
      new_user_data += user_info[i]["password"];
      new_user_data += "\n";
    }
    fs.writeFileSync('data/users.csv', new_user_data,'utf8');
    //rewrites new user information to csv file
    var new_villain_data = "name,gamesPlayed,wins,losses,paper,rock,scissors,strategy\n";
    for(i=0; i<villain_data.length; i++){
      new_villain_data += villain_data[i]["name"] + ",";
      new_villain_data += villain_data[i]["gamesPlayed"] + ",";
      new_villain_data += villain_data[i]["wins"] + ",";
      new_villain_data += villain_data[i]["losses"] + ",";
      new_villain_data += villain_data[i]["paper"] + ",";
      new_villain_data += villain_data[i]["rock"] + ",";
      new_villain_data += villain_data[i]["scissors"] + ",";
      new_villain_data += villain_data[i]["strategy"];
      new_villain_data += "\n";
    }
    fs.writeFileSync('data/villains.csv', new_villain_data,'utf8');
    //rewrites new villain information to csv file
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render('results', {user:user_data,user_info:user_info,villain_data:villain_data,villain_throw:villain_throw, type:type});

});

app.get('/rules', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('rules');
});//simple linking, no parameters

app.get('/stats', function(request, response){
  var users_file=fs.readFileSync('data/users.csv','utf8');
  var villains_file=fs.readFileSync('data/villains.csv','utf8');
  var rows = users_file.split('\n');
  var villainsRows = villains_file.split('\n');
  var user_data = [];
  var villain_data = [];
  for(var i=1; i<rows.length-1; i++){
    var user_d = rows[i].split(',');
    var user = userArrayToObject(user_d);
    user_data.push(user);//add the user to the array of users

  }
  for(var i=1; i<villainsRows.length-1; i++){
    var villain_d = villainsRows[i].split(',');
    var villain = villainArrayToObject(villain_d);
    villain_data.push(villain);//adds the villain to the array of villains
  }
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('stats', {user:user_data, villain:villain_data});//links to stats page with query parameters
});
app.get('/about', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render('about');
});//simple linking, no parameters
