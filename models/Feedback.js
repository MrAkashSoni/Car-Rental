const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId

const feedbackSchema = new mongoose.Schema({
    name: { type: mongoose.Schema.Types.String },
    email: { type: mongoose.Schema.Types.String },
    subject: { type: mongoose.Schema.Types.String },
    message: { type: mongoose.Schema.Types.String }
})

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;