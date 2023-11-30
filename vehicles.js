const mongoose = require('mongoose');

const vehicle = new mongoose.Schema({
    fleetNumber: {
        type: String,
        required: true
    },
    sacco: {
        type: String,
        required: false
    },
    numberPlate: {
        type: String,
        required: false
    }
})