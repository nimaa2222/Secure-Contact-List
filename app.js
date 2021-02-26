var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var session = require('express-session');
var bcrypt = require("bcrypt");

var indexRouter = require('./routes/index');

const MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/database';

// reference to database
let db = null;

// reference to the "contacts" collection
contacts = null; 

// holds all the retrieved contacts from database for displaying contacts in /contacts
contact_list = null;

// holds contact information for contact that is going to be edited
contact_edit = null;

//setting up authentication (username/password)
var username = "cmps369";
var password = "finalproject";
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        password = hash;
    });
});

// First we'll connect to the database, and once we do, THEN we'll start up the web server.
// This way we can be sure we won't serve any requests without a valid connection to the database.

const startup = async () => {
  try{
    //creating a connection to the mongo database
    //creating a reference "contacts" to the collection
    const connection = await MongoClient.connect(url, { useUnifiedTopology: true });
    db = connection.db('database');
    contacts = await db.createCollection("contacts");

  } catch(ex)
  {
    console.error(ex);
  }
}

//uncomment this to create database and contacts collection
startup();

check_contact_methods = (req) => {
  
  var mail_method = false;
  var phone_method = false;
  var email_method = false;
  var any = false;

  var contact_methods = "";

  //checking the contact method checkboxes 
  if(req.body.mail == "Mail"){
    mail_method = true;
  }

  if(req.body.phone == "Phone"){
    phone_method = true;
  }

  if(req.body.email == "Email"){
    email_method = true;
  }

  if(req.body.any == "Any"){
    mail_method = true;
    phone_method = true;
    email_method = true;
    any = true;
  }

  if (any){
    contact_methods = "Any";
  }

  else
  {
    if (mail_method)
      contact_methods += "Mail";
    if (phone_method)
      contact_methods += " Phone";
    if (email_method)
      contact_methods += " Email";
  }
  
  return [mail_method, phone_method, email_method, any, contact_methods]
}

update_contact = async(req) => {

  //identify the updated contact method check boxes
  const [mail_method, phone_method, email_method, any, contact_methods] = check_contact_methods(req);

  //identify updated contact coordinates
  const x = parseFloat(req.body.Latitude);
  const y = parseFloat(req.body.Longitude);
  var coordinate = [x,y];

  //retrieve contact ID to look up in database
  const contact_id = req.body.Contact_ID;

  try{
    contacts.updateOne( {_id:ObjectID(contact_id)}, {'$set': {
      first_name: req.body.First, 
      last_name: req.body.Last, 
      street: req.body.Street, 
      city: req.body.City, 
      state: req.body.State, 
      zip: req.body.Zip, 
      phone: req.body.Phone, 
      email: req.body.Email, 
      prefix: req.body.Prefix, 
      contact_with_mail: mail_method,  
      contact_with_phone: phone_method, 
      contact_with_email: email_method, 
      any_preferance: any, 
      contact_methods: contact_methods, 
      coordinate: coordinate}});
  }
  catch(ex){
    console.error(ex);
  }  
}


add_contact = async(req) => {

  //identify the contact method boxes checked
  const [mail_method, phone_method, email_method, any, contact_methods] = check_contact_methods(req);

  //create coordinate array to store in database
  const x = parseFloat(req.body.Latitude);
  const y = parseFloat(req.body.Longitude);
  var coordinate = [x,y];
  
  try{
    //inserting contact infromation to database
    const result = await contacts.insertOne({
      first_name: req.body.First, 
      last_name: req.body.Last, 
      street: req.body.Street, 
      city: req.body.City, 
      state: req.body.State, 
      zip: req.body.Zip, 
      phone: req.body.Phone, 
      email: req.body.Email, 
      prefix: req.body.Prefix, 
      contact_with_mail: mail_method, 
      contact_with_phone: phone_method, 
      contact_with_email: email_method, 
      any_preferance: any, 
      contact_methods: contact_methods, 
      coordinate: coordinate});
  }
  catch(ex){
    console.error(ex);
  }
}


//retireves all the contacts from database
get_all_contacts = async() => {
  try{
    contact_list = await contacts.find().toArray();
  }catch(ex){
    console.error(ex);
  }
}

//retireves the contact info from database using contact id
get_contact_info = async(req) => {
  
  const url = req.url;

  //remove the "/update" part of the URL
  var contact_id = url.slice(7,req.url.length);
  
  try{
    contact_edit = await contacts.findOne({_id:ObjectID(contact_id)});
  }catch(ex){
    console.error(ex);
  }
}

//removes specified contact from database based on id
delete_contact = async(req) => {

  const url = req.url;
  
  //remove the "/delete" part of the URL
  var contact_id = url.slice(7,req.url.length-1);
  
  try{
    contact_delete = await contacts.deleteOne({_id:ObjectID(contact_id)});
  }catch(ex){
    console.error(ex);
  }
}


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride());
app.use(session({ secret: 'cmps369', resave: true, saveUninitialized: true}));
app.use(favicon(__dirname + '/public/images/favicon.ico'));


// Set up passport to help with user authentication (cmps369/finalproject)
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },

  function(user, pswd, done) {
      if ( user != username ) {
          console.log("Username mismatch");
          return done(null, false);
      }

      bcrypt.compare(pswd, password, function(err, isMatch) {
          if (err) return done(err);
          if ( !isMatch ) {
              console.log("Password mismatch");
          }
          else {
              console.log("username_password matched!");
          }
          done(null, isMatch);
      });
    }
));

passport.serializeUser(function(username, done) {
  // this is called when the user object associated with the session
  // needs to be turned into a string.  Since we are only storing the user
  // as a string - just return the username.
  done(null, username);
});

passport.deserializeUser(function(username, done) {
  // normally we would find the user in the database and
  // return an object representing the user (for example, an object
  // that also includes first and last name, email, etc)
  done(null, username);
});

// Posts to login will have username/password form data.
// passport will call the appropriate functions...
indexRouter.post('/login',
    passport.authenticate('local', { successRedirect: '/contacts',
                                     failureRedirect: '/login_fail'
                                  })
);

indexRouter.get('/login', function (req, res) {
  res.render('login', {});
});

indexRouter.get('/login_fail', function (req, res) {
  res.render('login_fail', {});
});

indexRouter.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;






