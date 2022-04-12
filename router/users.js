const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const expressError = require('../utils/expressError');

router.get('/register', (req, res) => {
    res.render('users/register');
})
router.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const result = await User.register(user, password);
        req.login(result, err => {
            if (err) return next(err);
            req.flash('success', `Welcome to Yelpcamp, ${username}`);
            res.redirect('/spots');
        })

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}))
router.get('/login', (req, res) => {
    res.render('users/login')
})
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success', 'Successfully Logged Out!');
    res.redirect('/spots');
})
const config = {
    failureFlash: true,
    failureRedirect: '/login'
}
router.post('/login', passport.authenticate('local', config), (req, res) => {
    req.flash('success', `Welcome back! ${req.body.username}`);
    res.redirect('/spots');
})
module.exports = router;