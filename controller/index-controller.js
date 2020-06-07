var express = require('express');
var router = express.Router();
var Car = require('../models/Car');
var auth = require('../config/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("token 8 " + req.session.userToken);
    console.log(Date.now());
    Car.find({}).where('isRented').equals(false).limit(6).then(cars => {
        res.render('layouts/index', { title:"Car Rental", cars, token: req.session.userToken })
      })
});

router.get('/searchingModel', function(req, res, next) {
    let searchingModel = req.query.model.toLowerCase()
    let searchedCars = []
        
    car.find({}).then(allCars => {
        for (let car of allCars) {
            car.model = car.model.toLowerCase()
            let model = car.model.split(/\s+/)
            if (model.indexOf(searchingModel) >= 0) {
                //capitalize model of car
                car.newModel = car.model.replace(/\b\w/g, function(l){ return l.toUpperCase() })
                searchedCars.push(car)
            }
        }
        res.render('cars/index', { searchedCars })
    })
});

module.exports = router;