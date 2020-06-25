var express = require('express');
var router = express.Router();
const Car = require('mongoose').model('Car');
const User = require('mongoose').model('User');
// const Feedback = require('mongoose').model('Feedback');
var Feedback =  require('../models/Feedback');

var auth = require('../config/auth');
var multer = require('multer');
var path = require('path');

router.get('/addCar', auth.isAdmin ,function(req, res, next) {
    res.render('admin/addCar');
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/carImages');
    },
    filename: function (req, file, cb) {
      cb(null,req.body.model + "_" + req.body.passingNumber + path.extname(file.originalname));
    }
  });
var upload = multer({ storage:storage});
 
router.post('/addCar', auth.isAdmin, upload.single('image'), function(req, res, next) {
    var newCar = {
        model: req.body.model,
        image:  req.file.filename,
        price:  req.body.price,
        year:  req.body.year,
        isRented: false,
        fuelType:  req.body.fuelType,
        carType:  req.body.carType,
        passingNumber:  req.body.passingNumber,
        capacity: req.body.capacity,
        transmission: req.body.transmission,
        creationDate: Date.now(),
        ownerID: currentUser._id
    };
    
    Car.create(newCar).then((obj)=>{
        res.redirect('/')
    })  
});

router.get('/ownedCar', auth.isAdmin ,function(req, res, next) {
    Car.find({}).where('ownerID').equals(currentUser._id).then(ownedCars => {
        res.render('admin/ownedCar', { ownedCars })
    })
});

router.get('/ownerList', auth.isSuperAdmin ,function(req, res, next) {
    User.find((err,docs) => {
        if(!err)    {
            Car.find().populate('ownerID').exec().then( function(docs, err) {
                console.log("jcndcn " + docs);
                if(!err) 
                    res.render('admin/ownerList', { list: docs });
                else
                    console.log(err)
            });
        }
        else{
            console.log(err)
        }
    })
});

router.post('/feedback', function(req, res, next) {
    var newFeedback = {
        name: req.body.name,
        email:  req.body.email,
        subject:  req.body.subject,
        message:  req.body.message
    };
    
    Feedback.create(newFeedback).then((obj)=>{
        res.redirect('/');
    })  
});

router.get('/viewFeedback' ,function(req, res, next) {
    Feedback.find({}).then(feedbackMessage => {
        console.log("messages" + feedbackMessage);
        res.render('admin/viewFeedback', { feedbackMessage: feedbackMessage })
    })
});

module.exports = router;