var passport = require('passport');
var User =  require('../models/User');
var LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
var rn = require('random-number');
var nodemailer = require('nodemailer');
var session = require('express-session');
const jwt = require('jsonwebtoken');
// const store = require('local-storage-pro')
// const SafeStorage =  require('safer-web-storage')
// const WebStorageES6 = require('web-storage-es6');

// const localStorage = require('node-localstorage');
// var localStorage = require('web-storage')().localStorage;
// localStorage.set('boo', 5);
var gen = rn.generator({
    min:  0,
    max:  99999999,
    integer: true
  })
let randNum = gen(); 

passport.serializeUser(function (user, done) {
    done(null, user.id);
});
 
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
}); 

passport.use(
    new GoogleStrategy({
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/user/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
       
        console.log("profile : " + profile);

        User.findOne({googleID: profile.id}).then((currentUser) => {
            if(currentUser){
                // console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                new User({
                    email: profile.emails[0].value,
                    password: null,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    googleID: profile.id
                }).save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    })
);

passport.use('local.register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    User.findOne({'email': email}, function (err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {message: 'Email is already in use.'});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.firstName = req.body.firstName;
        newUser.lastName = req.body.lastName;
        if(req.body.isAdmin){
            newUser.isAdmin = true;
        }
        newUser.save(function(err, result) {
           if (err) {
               return done(err);
           }
           return done(null, newUser);
        });
     });
}));


passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    User.findOne({'email': email}, function (err, user) {
       
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'No user found.'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Wrong password.'});
        }
        const token = jwt.sign(
            {
                email : email
            },
            keys.jwt.key, 
            {
                expiresIn: "1h"
            }
        );
        // console.log("Passport 115");
        
 
// const safeLocalStorage = SafeStorage.createSafeLocalStorage()
// const safeSessionStorage = SafeStorage.createSafeSessionStorage()
 
// safeLocalStorage.getItem('apples')
// safeSessionStorage.seItem('pineapples', 20)
        // store.setItem('name', 'Murat')
//         var localStorage = new WebStorageES6('Local');
//         var sessionStorage = new WebStorageES6('Session');
//         var customGlobalStorage = new WebStorageES6('Global', 'custom');
// // Sets 'var1' to 'value1'
// localStorage.put('var1', 'value1');
// // Gets 'var1'
// localStorage.get('var1');
// console.log("Passport 124")

        // var localStorage = require('web-storage')({
        //     parse: function() {return 'idk';}
        //   }).localStorage;
         
        // localStorage.set('foo', 5);
        // window.localStorage.foo;//equals 'idk'
        // req.session.userToken = token;
        // console.log("token" + req.session.userToken);

        // var season = localStorage.setItem( req.session.userToken);
        // $.parseJSON(season);
     
        // if (typeof localStorage === "undefined" || localStorage === null) {
        // var LocalStorage = require('node-localstorage').LocalStorage;
        // localStorage = new LocalStorage('./scratch');
        // }
        // localStorage.setItem('myFirstKey', token);
        // console.log(localStorage.getItem('myFirstKey'));
        // var t = token.toString();
        // localStorage.setItem("token", JSON.stringify(t));
        // document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
      
        return done(null, user, {token: token});
    });
}));