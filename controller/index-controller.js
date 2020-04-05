var express = require('express');
var router = express.Router();
var car = require('../models/Car');
var auth = require('../config/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
    let page = Number(req.query.page)
    if(Object.keys(req.query).length === 0){
        page = 0
    }
    console.log(req.query)
    let prevPage = page - 1
    let nextPage = page + 1
    car.find({}).where('isRented').equals(false).sort({ year: -1 }).skip(page * 5).limit(5).then(cars => {

    if (prevPage < 0) prevPage = 0

    let pageObj = {
        prevPage: prevPage,
        nextPage: nextPage
    }
      res.render('cars/index', { title:"Car Rental", cars, pageObj })
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