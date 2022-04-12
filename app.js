if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const override = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const MongoStore = require('connect-mongo');

const campgroundRoutes = require('./router/campgrounds');
const reviewRoutes = require('./router/reviews');
const userRoutes = require('./router/users');

const expressError = require('./utils/expressError');
const mongoose = require('mongoose');

const db_URL = process.env.db_URL;
const PORT = process.env.PORT || 3000;
mongoose.connect(db_URL,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => {
        console.log('We are Connected to Database');
    })
    .catch(err => {
        console.log("Error!!");
        console.log(err);
    });

const app = express();
app.engine('ejs', ejsMate);

const store = MongoStore.create({
    mongoUrl: db_URL,
    secret: 'Topsecret',
    touchAfter: 24 * 60 * 60
});

store.on('error', function (e) {
    console.log('Session store Error');
})
const sessionConfig = {
    store,
    secret: 'Topsecret',
    resave: false,
    saveUninitialized: true
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(override('_method'));
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home');
})
app.use('/', userRoutes);
app.use('/spots', campgroundRoutes);
app.use('/spots/:id/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404));
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!!!";
    res.status(statusCode).render('errors', { err });
})
app.listen(PORT, () => {
    console.log('Server Started!');
})
