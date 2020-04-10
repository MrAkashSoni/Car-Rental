var express = require('express');
var router = express.Router();
var User =  require('../models/User');
var Car =  require('../models/Car');
var RentedCarInfo =  require('../models/RentedCarInfo');
var multer = require('multer');
var path = require('path');
var auth = require('../config/auth');

router.get('/allCars', function(req, res, next) {
    let page = Number(req.query.page)
    if(Object.keys(req.query).length === 0){
        page = 0
    }
    console.log(req.query)
    let prevPage = page - 1
    let nextPage = page + 1
    Car.find({}).where('isRented').equals(false).sort({ year: -1 }).skip(page * 5).limit(5).then(cars => {

    if (prevPage < 0) prevPage = 0

    let pageObj = {
        prevPage: prevPage,
        nextPage: nextPage
    }
      res.render('cars/allCars', { title:"Car Rental", cars, pageObj })
  })
});

router.get('/carDetails/:id', function(req, res, next) {
    let id = req.params.id
    Car.findById(id).then(foundCar => {
        res.render('cars/carDetails', { foundCar })
    })
});

router.get('/bookingDetails/:id',auth.isLoggedIn, function(req, res, next) {
    let carId = req.params.id
    // var carId = req.body.carId;
    console.log("39" + carId);
    res.render('cars/bookingDetails', {carId});
});

router.post('/bookingDetails',auth.isLoggedIn, function(req, res, next) {
    let id = req.body.carId;
    let userId = req.user._id;   
    var date = req.body.dateOfRental;
    var days = req.body.daysOfRental;
    var rentAmount = 0;
    Car.findById(id).then(doc => {
        rentAmount = doc.price * days;
        res.render('cars/paymentDetails', {id, userId,date, days, rentAmount });
    })
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/licenceImages');
    },
    filename: function (req, file, cb) {
      cb(null,req.user._id + path.extname(file.originalname));
    }
  });
var upload = multer({ storage:storage});

router.post('/paymentDetails',auth.isLoggedIn, upload.single('licence'),  function(req, res, next) {
    let id = req.body.id;
    let userId = req.user._id;   
    var date = req.body.date;
    var days = req.body.days;
    let RentedCarInfoObj = {}   

    var stripe = require('stripe')
    ('sk_test_rTV467jvdYEGQ6lxtZLKzllQ00B0Qa1VWs');

    stripe.charges.create(
    {
        amount: req.body.rentAmount,
        currency: 'inr',
        source: req.body.stripeToken,
        description: 'Test Charge',
    },
    function(err, charge) {
        if (err){
            console.log(err.message);
            return res.render('cars/paymentDetails');
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
                            date: date,
                            days: days,
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
      cb(null, 'public/images/carImages');
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