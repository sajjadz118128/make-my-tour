const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const catchAsync = require('../utils/catchAsync');


router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body);
    review.author = req.user;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Added a Review');

    res.redirect(`/spots/${camp._id}`);
}))
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully Deleted the Review');
    res.redirect(`/spots/${id}`);
}))

module.exports = router;