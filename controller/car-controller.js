var express = require('express');
var router = express.Router();
var User =  require('../models/User');
var Car =  require('../models/Car');
var RentedCarInfo =  require('../models/RentedCarInfo');
var multer = require('multer');
var path = require('path');
var auth = require('../config/auth');

router.get('/carDetails/:id', function(req, res, next) {
    let id = req.params.id
    Car.findById(id).then(foundCar => {
        res.render('cars/carDetails', { foundCar })
    })
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'C:/Users/akash/Desktop/projects/car-rental/public/images/licenceImages');
    },
    filename: function (req, file, cb) {
      cb(null,req.user._id + path.extname(file.originalname));
    }
  });
var upload = multer({ storage:storage});

router.post('/carDetails',auth.isLoggedIn, upload.single('licence'), function(req, res, next) {
    let id = req.body.carId
    let userId = req.user._id   
    let RentedCarInfoObj = {}   

    var stripe = require('stripe')
    ('sk_test_rTV467jvdYEGQ6lxtZLKzllQ00B0Qa1VWs');

    stripe.charges.create(
    {
        amount: 2000,
        currency: 'inr',
        source: req.body.stripeToken,
        description: 'Test Charge',
    },
    function(err, charge) {
        if (err){
            console.log(err.message);
            return res.render('cars/carDetails');
        }
        Car.findById(id).then(foundCar => {
            User.findById(userId).then(user => {
                user.rentedCars.push(foundCar._id)
                user.save().then(()=>{
                    foundCar.isRented = true
                    foundCar.save().then(()=>{
                        RentedCarInfoObj={
                            car: foundCar._id,
                            user: userId,
                            date: req.body.dateOfRental,
                            days: req.body.daysOfRental,
                            licence: req.file.filename,
                            paymentID : charge.id
                        }
                        console.log(RentedCarInfoObj)
                        RentedCarInfo.create(RentedCarInfoObj).then(()=>{
                            res.redirect('/')
                        })
                    })
                })
            })
        })
    });
});

router.get('/editPrice/:id', auth.isLoggedIn, auth.isAdmin ,function(req, res, next) {
    let id = req.params.id
    Car.findById(id).then(cartoUpdate => {
        res.render('cars/editDetail', { cartoUpdate })
    })
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'C:/Users/akash/Desktop/projects/car-rental/public/images/carImages');
    },
    filename: function (req, file, cb) {
      cb(null,req.body.model+"_"+Date.now() + path.extname(file.originalname));
    }
  });
  var upload = multer({ storage:storage});

router.post('/editPrice', auth.isLoggedIn, upload.single('image'), auth.isAdmin, function(req, res, next) {
    Car.findByIdAndUpdate({
        _id: req.body._id
    }, req.body, {new: true}, (err, doc) => {
        if (!err) {
            console.log('updated');
            res.redirect('/admin/ownedCar');
        }
    })
});

router.get('/withdrawCar/:id', auth.isLoggedIn, auth.isAdmin ,function(req, res, next) {
    Car.findByIdAndRemove( req.params.id, (err, doc) => {
        if (!err) {
            console.log('Deleted');
            res.redirect('/admin/ownedCar');
        }
        else {
            console.log('Error to Delete');
        }
    });
});

module.exports = router; 