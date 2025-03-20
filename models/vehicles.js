const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Vehicle', vehicleSchema);