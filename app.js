var mysql = require('mysql');
var bodyParser = require('body-parser');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'bonjour3',
  database : 'mysql'
});

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

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

server.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

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

          //console.log(req.user);

          var buf = rows[0].password;

          var todec = buf + rows[0].lastfour;

          //console.log(req.session.savedletters);

          var dec = decrypt(todec, key);

          // if the user is found but the password is wrong
          if (!(dec == password))
              return done(null, false, req.session.messages = ['Oops!']); // create the loginMessage and save it to session as flashdata

          // all is well, return successful user
          return done(null, rows[0]);     
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
        var user = [];
        connection.query("select * from users where email = '"+username+"'", function(err,rows){
          var savedletters;

          if (err)
            return done(err);
          if (rows.length) {
            return done(null, false, req.session.messages('signupMessage', 'That email is already taken.'));
          } else {

            var newUserMysql = new Object();

            var buf = password;
            
            var enc = encrypt(buf, key);

            newUserMysql.email = username;

            var passstring = enc.substring(0, enc.length - 5);
            savedletters = enc.substring(enc.length - 5, enc.length - 1);

            newUserMysql.password = savedletters; // use the generateHash function in our user model

            //onsole.log(passstring);

            var insertQuery = "INSERT INTO users ( email, password, lastfour ) values ('" + username +"','"+ passstring +"','"+ savedletters +"')";

            connection.query(insertQuery,function(err,rows){
              //console.log(rows.insertId);
              //console.log(newUserMysql.id);
              newUserMysql.id = rows.insertId;

              req.login(newUserMysql, function(err) {
                if (err) { return next(err); }
              });

              console.log(req.user);

              return done(null, newUserMysql);
            });
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
app.use(cookieParser());
app.use(bodyParser());
app.use(session({ secret: 'keyboard cat', cookie: { secure: true }}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  //connection.connect();
  done(null, user.email);
  //connection.end();
});

passport.deserializeUser(function(err, email, done) {
  console.log(email + " &*&*&*&*&*&*&*&*&*&*&*&");
  //function(id, function(err, user) {
  //connection.connect();
  connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows) {
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

app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('/login', function(req, res) {
    res.render('partials/login.html');
});

app.get('/logout', function(req, res){
  req.logout();
  console.log(req.user);
  res.redirect('/login');
});

app.get('/signup', function(req, res) {
  res.render('partials/signup.html');
});

app.post('/signup', passport.authenticate('local-signup', { successRedirect: '/users',
                                                            failureRedirect: '/login',
                                                            failureFlash : true }));

  /*function(req, res) {
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

app.get('/users', function(req, res){
  res.render('partials/profile.html');
  //console.log(req.body);
});

app.post('/login', passport.authenticate('local-login', { failureRedirect: '/login'}),

    /*function(req, res, next) {
      if (sess.views) {
        sess.views++
        res.setHeader('Content-Type', 'text/html')
        res.write('<p>views: ' + sess.views + '</p>')
        res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>')
        res.end()
      } else {
        sess.views = 1
        res.end('welcome to the session demo. refresh!')
      }*/
      function(req, res) {
       //console.log(req.user);

        if (req.body.remember) {  
          req.session.cookie.maxAge = 1000 * 60 * 3;
        } else {
          req.session.cookie.expires = false;
        }
        res.redirect('/users');
      }
);
var pf = require('policyfile').createServer();

pf.listen(10843, function(){
  console.log("policy file started");
});
//io.configure(function(){
io.set('transports', ['websocket','xhr-polling','flashsocket']);
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

io.sockets.on('connection', function (socket) {

  socket.on('message', function (data) {
    //USER
    var usernameflash = {};

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
        port: 3000,
        path: '/users',
        method: 'GET'
      }

      //The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'

      var callback = function(response) {

        response.send(usernameflash);

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

  socket.on('turnon', function(){
    connection.connect();
  });

  socket.on('turnoff', function(){
    connection.end();
  });
});

// Expose app
exports = module.exports = app;