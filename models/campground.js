const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;


const opts = { toJSON: { virtuals: true } };
const campGroundSchema = new Schema({
    title: String,
    image: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);
campGroundSchema.virtual('properties').get(function () {
    return {
        id: this._id,
        title: this.title
    }
});

campGroundSchema.post('findOneAndDelete', async function (data) {
    if (data) {
        await Review.deleteMany({
            _id: {
                $in: data.reviews
            }
        })
    }
})
module.exports = mongoose.model('Campground', campGroundSchema);