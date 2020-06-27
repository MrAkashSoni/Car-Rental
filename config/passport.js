var passport = require('passport');
var User =  require('../models/User');
var LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
var rn = require('random-number');
var nodemailer = require('nodemailer');
var session = require('express-session');
const jwt = require('jsonwebtoken');
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
        req.session.userToken = token;  
        return done(null, user, {token: token});
    });
}));