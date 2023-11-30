const mongoose = require("mongoose");

const paymentInfo = new mongoose.Schema({
    phoneNumber: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    fleetNumber: {
        type: String,
        required: true
    },
    sacco: {
        type: String,
        required: false
    }
})
