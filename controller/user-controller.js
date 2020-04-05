var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var passport = require('passport');
var auth = require('../config/auth');
var User =  require('../models/User');
var bcrypt = require('bcrypt-nodejs');
var rn = require('random-number');
const keys = require('../config/keys');
var gen = rn.generator({
    min:  0,
    max:  99999999,
    integer: true
  })
let randNum = gen(); 

router.get('/changePassword', auth.isLoggedIn, function(req, res, next) {    
    res.render('user/changePassword');
});

router.post('/changePassword', auth.isLoggedIn,  function(req, res, next) {  
    var id = req.user._id;
    var pass= req.body.curPassword;
    var newPass = req.body.newPassword;
    
    User.findOne({_id : id}, function(err,doc){
        if(err) throw err;
        if(doc) {
           
            if(curHashPass = bcrypt.compareSync(pass, doc.password)) {
                User.updateOne( { _id: id }, { $set: {password: bcrypt.hashSync(newPass, bcrypt.genSaltSync(5), null) } }, function(err,req, res) {
                    if (err) 
                    res.render('user/changePassword',{errMsg : "Error in updating password " + err});
                    else {
                        console.log("Password Updated"); 
                        delete req.session;  
                    }                 
                });
                req.logout();
                res.redirect('/');
            }             
            else{
                res.render('user/changePassword',{errMsg : "Current Password Doesn't Match"});
            }      
        }
    });
});

router.get('/verifyEmail', auth.notLoggedIn, function(req, res, next) {    
    res.render('user/verifyEmail');
});

router.post('/verifyEmail', auth.notLoggedIn, function(req, res, next) {   
    
     var mailOptions, host, link;
        var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: keys.gmail.id,
                pass: keys.gmail.password
            }
        });

        host = req.get('host');
        link = "http://" + req.get('host') + "/user/forgotPassword/" + randNum;
        User.findOne({email : req.body.regEmail}, function(err,doc){
            if(err) throw err;
            if(doc) {
                req.session.userEmail = req.body.regEmail;
                mailOptions = {
                    to : req.body.regEmail,
                    subject : "Reset Password",
                    html : "Hello,<br> Please Click on the link to reset your Password.<br><a href="+link+">Click here to reset</a>"
                }
                console.log(mailOptions);
                smtpTransport.sendMail(mailOptions, function(error, response){
                if(error) {
                    console.log(error);
                    res.send(error);
                }
                else {
                    res.render('user/verifyEmail', {errMsg: "Check Your Mail" });
                    console.log("Message sent: " + response.message);
                }
            });  
        }
        else{
            res.render('user/verifyEmail', {errMsg: "User isn't Registered" });
        }
    });
});

router.get('/forgotPassword/:id', function(req, res, next) { 
    res.render('user/forgotPassword', {id: req.params.id});
});

router.post('/forgotPassword', function(req, res, next) { 
    if(req.body.randID == randNum) {
        User.updateOne( { email: req.session.userEmail }, { $set: {password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(5), null) } }, function(err,req, res) {
            if (err) 
                res.render('user/forgotPassword',{errMsg : "Error in resetting password " + err});
            else {
                console.log("Password Reset"); 
                delete req.session;  
            }                 
        });
        req.logout();
        res.redirect('/');
    }   
    else {
        console.log("Invalid Link")
    }
});

router.get('/profile/:id', auth.isLoggedIn, function(req, res, next) {
    let userID = req.params.id;
    User.findById(userID).then(loggedInUser => {
        res.render('user/profile', { loggedInUser})
    })
});

router.post('/editProfile', auth.isLoggedIn, function(req, res, next) {
    User.findByIdAndUpdate({ _id: req.body._id}, req.body, {new: true}, (err, doc) => {
        if (!err) {
            console.log('updated');
            res.redirect('user/profile');
        }
    })
});

router.get('/logout', auth.isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', auth.notLoggedIn, function(req, res, next) {
    next();
});

 router.get('/subAdmin-registration', auth.notLoggedIn, function(req, res, next) {
    res.render('user/registration', { isAdmin: true });
});

router.get('/registration', auth.notLoggedIn, function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/registration', { messages: messages, hasError: messages.length > 0})
  });

router.post('/registration', auth.notLoggedIn, passport.authenticate('local.registration', {
    successRedirect: '/',
    failureRedirect: '/user/registration',
    failureFlash: true
}));
  
router.get('/login', auth.notLoggedIn, function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/login', { messages: messages, hasError: messages.length > 0 })
});

router.post('/login', auth.notLoggedIn, passport.authenticate('local.login', {
    successRedirect: '/',
    failureRedirect: '/user/login',
    failureFlash: true
}));

router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/');
});

module.exports = router;