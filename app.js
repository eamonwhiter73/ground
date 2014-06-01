var express = require('express');
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var mysql = require('mysql');
var bodyParser = require('body-parser');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var methodOverride = require('method-override');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'bonjour3',
  database : 'mysql'
});
//var io = require('socket.io').listen(server);
/*var socket = require('socket.io')({
  'transports': ['websocket','xhr-polling','flashsocket'],
  'flash policy port': 10843
});*/

//var io = socket(server);

var crypto = require('crypto');
 
var AESCrypt = {};
 
AESCrypt.decrypt = function(cryptkey, iv, encryptdata) {
    var decipher = crypto.createDecipheriv('aes-256-cbc', cryptkey, iv);
    var x = decipher.update(encryptdata);
    x += decipher.final()
    return x;
}

AESCrypt.encrypt = function(cryptkey, iv, cleardata) {
    var encipher = crypto.createCipheriv('aes-256-cbc', cryptkey, iv);
    var x = encipher.update(cleardata);
    x += encipher.final()
    return x;
}

function encrypt(data, key) {
    if (data === null)
        return null
    else if (typeof data === 'undefined')
        return undefined;
    else if (data === '')
        return '';

    var iv = crypto.randomBytes(16);

    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    var encrypted = [cipher.update(data)];
    encrypted.push(cipher.final());

    return Buffer.concat([iv, Buffer.concat(encrypted)]).toString('base64');
}

function decrypt(cipher, key) {
    if (cipher === null)
        return null
    else if (typeof cipher == 'undefined')
        return undefined;
    else if (cipher === '')
        return '';

    var cipher = new Buffer(cipher, 'base64');
    var iv = cipher.slice(0, 16);
    var ciphertext = cipher.slice(16);

    var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    var decrypted = [decipher.update(ciphertext)];
    decrypted.push(decipher.final());

    return Buffer.concat(decrypted).toString('utf8');
}
 
var key = crypto.createHash('sha256').update('Nixnogen').digest();
    //iv = 'a2xhcgAAAAAAAAAA';

app.use(express.static(__dirname + '/app'));
app.engine('html', require('ejs').renderFile);

passport.use('local-login',
      new LocalStrategy({
        username: 'username',
        password: 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
      }, 
      function(req, username, password, done) {
        //connection.connect();

        //var userpw = req.user.password;

        connection.query("select * from users where email = '"+username+"'", function(err,rows){

          if (err)
            return done(err);
          
          if (!rows.length) {
            return done(null, false, req.session.messages = ['Oops!']); // req.session.messages is the way to set flashdata using connect-flash
          } 

          var user = rows[0];
          //console.log(req.user);

          var buf = user.password;

          var todec = buf + user.lastfour;

          //console.log(req.session.savedletters);

          var dec = decrypt(todec, key);

          // if the user is found but the password is wrong
          if (!(dec == password)) {
              return done(null, false); // create the loginMessage and save it to session as flashdata
              console.log("something didnt work");
          }

          // all is well, return successful use
          var newUser = {username: user.email, password: user.password}
          
          req.login(newUser, function(err) {
            if (err) { return next(err); }
          });

          console.log(req.user);

          return done(null, newUser);     
        });

          /*if(err) {
            return done(err);
          }

          //var passwordforsafe2 = shasum.digest('hex');
          

          

          //console.log(shasum.digest("hex"));

          //console.log(shasum);

          var passwordforsafe2 = shasum.digest('hex');

          console.log(passwordforsafe2 + " " + "back to it");

          user = rows;

          console.log(user[0].password)
          //shasum.update(password);

          var y = user[0].password;
          console.log(shasum.digest('hex'));
          //console.log(y);
          //console.log(userforstore.password);
          var pw = shasum.digest('hex');

          if(pw == y) {
            console.log("made it here");
            return done(null, user[0]);
          }
          else {
            console.log("you fucked up");
            //console.log(userforstorepw);
            return done(null, false, { message: 'Incorrect info.' });
          }
        });*/
        //connection.end();
      }
  ));

passport.use('local-signup',
      new LocalStrategy({
        username: 'username',
        password: 'password',
        passReqToCallback : true
      }, 
      function(req, username, password, done) {

        //connection.connect();
        //var user = [];
        connection.query("select * from users where username = '"+username+"'", function(err,rows){
          var savedletters;

          if (err)
            return done(err);
          if (rows.length) {
            return done(null, false, req.session.messages = ['Taken!']);
          } else {

            var newUserMysql = {};

            var buf = password;
            
            var enc = encrypt(buf, key);

            newUserMysql.username = username;

            var passstring = enc.substring(0, enc.length - 5);
            savedletters = enc.substring(enc.length - 5, enc.length - 1);

            newUserMysql.password = savedletters; // use the generateHash function in our user model

            //console.log(passstring);

            var insertQuery = "INSERT INTO users ( username, password, lastfour ) values ('" + username +"','"+ passstring +"','"+ savedletters +"')";

            connection.query(insertQuery, function(err,rows2){
              //console.log(rows.insertId);
              //console.log(newUserMysql.id);
              //newUserMysql.id = rows2.insertId;
              return done(null, newUserMysql);
            });

            req.login(newUserMysql, function(err) {
              if (err) { return err; }
            })

            //console.log(req.user);

            //console.log(req.user);
          }; 
        });

          /*if(err) {
            return done(err);
          }

          //var passwordforsafe2 = shasum.digest('hex');
          

          

          //console.log(shasum.digest("hex"));

          //console.log(shasum);

          var passwordforsafe2 = shasum.digest('hex');

          console.log(passwordforsafe2 + " " + "back to it");

          user = rows;

          console.log(user[0].password)
          //shasum.update(password);

          var y = user[0].password;
          console.log(shasum.digest('hex'));
          //console.log(y);
          //console.log(userforstore.password);
          var pw = shasum.digest('hex');

          if(pw == y) {
            console.log("made it here");
            return done(null, user[0]);
          }
          else {
            console.log("you fucked up");
            //console.log(userforstorepw);
            return done(null, false, { message: 'Incorrect info.' });
          }*/
        //connection.end();
      }
  ));

app.use(compress());

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({secret: "my secret"}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  //connection.connect();
  done(null, user.username);
  //connection.end();
});

passport.deserializeUser(function(err, username, done) {
  console.log(username + " &*&*&*&*&*&*&*&*&*&*&*&");
  //function(id, function(err, user) {
  //connection.connect();
  connection.query('SELECT * FROM users WHERE username = ?', [username], function(err, rows) {
    //for(var x = 0; x < rows.length; x++) {
      //users[x] = rows[x];
      //if(users[x].email == email) {
        return done(err, rows[0]);
      //}
    //}
  });
//});
  //connection.end();
});

app.get('/partials/:filename', 
  function(req, res){
    var filename = req.params.filename;
    if(!filename) return;  // might want to change this
    res.render("partials/" + filename );
  }
);

var session = require('./server/controllers/session');
var auth = require('./server/config/auth');

app.post('/auth/users', passport.authenticate('local-signup', { failureRedirect: '/login'}), function (req, res){
   console.log(req.user);
   res.redirect('/profile');
});

app.post('/auth/session', function (req, res, next) {passport.authenticate('local-login', function(err, user, info) {
    var error = err || info;
    if (error) { return res.json(400, error); }
    req.logIn(user, function(err) {
      if (err) { return res.send(err); }
      res.json(req.user.user_info);
    });
    //console.log(req.user);
  })(req, res, next);
});

app.delete('/auth/session', session.logout);

app.get('*', function(req, res) {
    if(req.user) {
      //console.log(req.user);
    }

    res.render('index.html');
});

//var path = require('path');
  
//app.get('/auth/session', auth.ensureAuthenticated, session.session);

/*app.get('/login', function(req, res) {
    res.render('partials/login.html');
});

app.get('/logout', function(req, res){
  req.logout();
  //console.log(req.user);
  res.redirect('/login');
});

app.get('/signup', function(req, res) {
  res.render('partials/signup.html');
});

app.post('/signup', passport.authenticate('local-signup', { 
                                                            failureRedirect: '/login',
                                                            failureFlash : true }), function(req, res) {
  //console.log(req.user);
  res.redirect('/users');
});

  function(req, res) {
    //res.render('partials/signup.html');
      if(err) {
        console.log(err);
      }
      var userforstore = req.body;
      //console.log(userforstore.password + " " + "in signup");
      var pw = shasum.update(userforstore.password).digest('hex');
      userforstore.password = pw;

      //console.log(userforstorepw + " " + "initial creation");

      connection.query('INSERT INTO users SET ?', userforstore, function(err) {
        console.log(userforstore);
        if(err) {
          console.log(err);
        }
      });
      //req.session.loggedIn = true;
      res.render('index.html');
  }
);*/

/*function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

app.get('/users', ensureAuthenticated, function(req, res){
  console.log(req.user.password);
  res.render('partials/profile.html');
});

app.post('/login', passport.authenticate('local-login', { failureRedirect: '/login'}),

    function(req, res, next) {
      if (sess.views) {
        sess.views++
        res.setHeader('Content-Type', 'text/html')
        res.write('<p>views: ' + sess.views + '</p>')
        res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>')
        res.end()
      } else {
        sess.views = 1
        res.end('welcome to the session demo. refresh!')
      }
      function(req, res) {
       //console.log(req.user);

       //console.log(req.user);
       res.redirect('/users');
      }
);*/

//var pf = require('policyfile').createServer();

/*pf.listen(10843, function(){
  console.log("policy file started");
});*/

//io.configure(function() {
  //io.set('log level', 1);
//});

/*var me = function(req, res) {
  res.json(req.user || null);
};*/

/*var show = function (req, res, next) {
  connection.query("select * from users where username = '"+usernameflash+"'", function(err,rows){
    var username = rows;
  });

  var passwordforsafe = shasum.digest('hex');

  if(passwordforsafe == usernameflash.password) {
      res.send(username[0]);
      console.log("passwords are the same");
  }
  else {

      console.log("incorrect info");
  }
};*/

server.listen(8000, function(){
  console.log("started");
});

io.configure(function() {
  io.set('transports', ['websocket','xhr-polling','flashsocket']);
  io.set('flash policy port', 10843);
  io.set('log level', 0);
});

io.sockets.on('connection', function (socket) {

  socket.on('message', function (data) {
    //USER
    var usernameflash = {};
    var scoreforsend;

    console.log(data);

    console.log(typeof data);
    if(typeof data == "string") {
      console.log("inside string method");
      user = data.split(' ');
      console.log(user);
      usernameflash.password = user[1];
      usernameflash.username = user[0];

      console.log(usernameflash);

      var options = {
        host: 'localhost',
        port: 8000,
        path: '/users',
        method: 'GET'
      }

      var callback = function(response) {

        console.log(usernameflash);

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
          console.log(usernameflash);
        });
      }

      http.request(options, callback).end();
    }
    else if(typeof data === "number") {
      scoreforsend = data;
      console.log("Transfered:" + " " + scoreforsend);
      //socket.emit('scoreforsend', scoreforsend);
      console.log("something else happened...");
    }
  });

  socket.on('disconnect', function(){
    console.log("disconnected");
  })

  socket.on('turnon', function(){
    connection.connect();
  });

  socket.on('turnoff', function(){
    connection.end();
  });
});

// Expose app
exports = module.exports = app;