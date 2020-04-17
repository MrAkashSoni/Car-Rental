var Cars = require('../models/Car');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/car-rental_repo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var car = new Cars({
    model: 'Hyundai Xcent',
    image: 'images/merc.jpeg',
    price: 2200,
    year: 2018,
    isRented: false,
    fuelType: 'Petrol',
    carType: 'Sedan',
    passingNumber: 'GJ21BC8020',
    creationDate: Date.now()
})

var done = 0;

car.save(function(err, result) {
    done = 1;
    if (done === 1 ){
        mongoose.disconnect();
    }
});