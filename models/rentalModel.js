const mongoose = require("mongoose");
mongoose.Schema.Types.Boolean.convertToFalse.add('off');
mongoose.Schema.Types.Boolean.convertToTrue.add('on');
const rentalSchema = new mongoose.Schema({
    headline: {
        type: String,
        require: true,
        unique: true
    },
    numSleeps: {
        type: Number,
        require: true,
        min: 0,
        max: 100
    },
    numBedrooms: {
        type: Number,
        require: true,
        min: 0,
        max: 100
    },
    numBathrooms: {
        type: Number,
        require: true,
        min: 0,
        max: 100
    },
    pricePerNight: {
        type: Number,
        require: true,
        min: 0.01,
        get: v => parseFloat(v).toFixed(2),
        set: v => parseFloat(v).toFixed(2)
    },
    city: {
        type: String,
        require: true
    },
    province: {
        type: String,
        require: true
    },
    imageUrl: {
        type: String,
        require: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0.0,
        max: 5.0,
        get: v => parseFloat(v).toFixed(1),
        set: v => parseFloat(v).toFixed(1)
    },
    reviews: {
        type: Number,
        default: 0,
        min: 0
    },
    featuredRental: {
        type: Boolean,
        require: true
    }
});

const rentalModel = mongoose.model("rentals", rentalSchema);

module.exports = rentalModel;