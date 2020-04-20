const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId

const carSchema = new mongoose.Schema({
    model: { type: mongoose.Schema.Types.String, required: true },
    image: { type: mongoose.Schema.Types.String, required: true },
    price: { type: Number, required: true },
    year: { type: Number, required: true },
    fuelType: { type: mongoose.Schema.Types.String, required: true},
    carType: { type: mongoose.Schema.Types.String, required: true},
    capacity: { type: mongoose.Schema.Types.String, required: true},
    transmission: { type: mongoose.Schema.Types.String, required: true},
    passingNumber: { type: mongoose.Schema.Types.String, required: true},
    isRented: {type: Boolean, required: true, default: false},
    creationDate: {type:  Date, required:true},
    ownerID: { type: ObjectId, ref: 'User'}
})

const Car = mongoose.model('Car', carSchema);

module.exports = Car;