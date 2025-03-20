require('dotenv').config();

const credentials = {
    apiKey: process.env.AT_APP_APIKEY,
    username: process.env.AT_APP_USERNAME
}
const AfricasTalking = require('africastalking')(credentials);


exports.sendSMS = async (options) => {

    const response = await AfricasTalking.SMS.send({
        to: options.to,
        message: options.message,
    }).catch((err) => {
        console.log(err)
    })

    return response



};