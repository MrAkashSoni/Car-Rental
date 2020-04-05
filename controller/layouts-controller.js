var express = require('express');
var router = express.Router();

router.get('/about', function(req, res, next) {
    res.render('layouts/about');
});


router.get('/contact', function(req, res, next) {
    res.render('layouts/contact');
});

module.exports = router;