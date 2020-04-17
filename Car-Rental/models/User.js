const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId
var bcrypt = require('bcrypt-nodejs');

const userSchema = new mongoose.Schema({
    googleID : { type: mongoose.Schema.Types.String },
    email: { type: mongoose.Schema.Types.String, unique: true },
    password: { type: mongoose.Schema.Types.String },
    firstName: { type: mongoose.Schema.Types.String },
    lastName: { type: mongoose.Schema.Types.String },
    roles: [{ type: mongoose.Schema.Types.String }],
    isAdmin: {type: Boolean, default: false},
    isSuperAdmin: {type: Boolean, default: false},
    rentedCars:[{type: ObjectId, ref: 'Car'}]
});

userSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;