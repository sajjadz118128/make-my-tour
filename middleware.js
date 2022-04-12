const expressError = require('./utils/expressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be Logged in');
        return res.redirect('/login');
    }
    next();
}
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not own that Campground');
        return res.redirect(`/spots/${id}`);
    }
    next();
}
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not own that review');
        return res.redirect(`/spots/${id}`);
    }
    next();
}
module.exports.validateCampground = (req, res, next) => {
    let { path } = req;
    if (path === '/') path = path + 'new';
    else path = path + '/edit';
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        req.flash('error', msg);
        return res.redirect(`/spots${path}`);
    }
    next();
}
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressError(msg, 400);
    }
    next();
}