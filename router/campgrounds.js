const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const token = process.env.token;
const geocoder = mbxGeocoding({ accessToken: token });
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();
    const camp = new Campground(req.body);
    camp.geometry = geoData.body.features[0].geometry;
    camp.author = req.user;
    console.log(camp);
    await camp.save();
    req.flash('success', 'Successfully, made a new Tourist Spot!');
    res.redirect(`/spots/${camp._id}`);
}))
router.get('/new', isLoggedIn, (req, res) => {
    console.log(req.user);
    res.render('campgrounds/new')
})
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that spot!');
        return res.redirect('/spots');
    }
    res.render('campgrounds/show', { campground });
}))
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that spot!');
        return res.redirect('/spots');
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();
    req.body.geometry = geoData.body.features[0].geometry;
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success', 'Successfully Updated the Spot');
    res.redirect(`/spots/${campground._id}`);
}))
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully Deleted the spot');
    res.redirect('/spots');
}))

module.exports = router;