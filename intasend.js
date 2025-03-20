const IntaSend = require('intasend-node');
const Payment = require('./models/payments');
const smsService = require('./sendsms');
require('dotenv').config();

let intasend = new IntaSend(
  process.env.INTA_PUB_KEY,
  process.env.INTA_SEC_KEY,
  true, // Test ? Set true for test environment
);

let pendingPayments = {}; //This object temporarily stores information on pending payments 

exports.intaSTKPush = async (payInfo) => {
  console.log(payInfo, "kiu")
  let collection = intasend.collection();

  try {
    const response = await collection.mpesaStkPush({
      amount: payInfo.amount,
      phone_number: payInfo.phone,
      api_ref: 'test',
    });
    console.log(`STK Push Resp: ${JSON.stringify(response)}`);

    pendingPayments[response.invoice.invoice_id] = {
      fleet: payInfo.fleet, // Store fleet number
      paymentInfo: payInfo // Store payment information
    };
    console.log("Pending: ", pendingPayments)

    return response; // Return the response received from the API
  } catch (err) {
    console.error(`STK Push Resp error:`, `${JSON.stringify(err)}`);
    throw err;
  }
};

// Function to save payment data
const savePaymentData = async (paymentData) => {
  try {
    const payment = new Payment(paymentData);
    await payment.save();
    console.log('Payment information saved successfully');
  } catch (error) {
    console.error('Error saving payment information:', error);
    throw error;
  }
};

// Handle Webhook
exports.handleCB = async (req, res) => {
  const challenge = req.body.challenge;
  console.log(challenge, "jhgufy");

  // Validate the challenge
  if (challenge) {
    res.status(200).send({ challenge: challenge });
    const event = req.body;
    console.log('Webhook Event:', event);

    // Handle different event types
    if (event.state === 'COMPLETE') {
      // Handle successful payment
      const invoiceId = event.invoice_id;
      const mpesaReference = event.mpesa_reference;

      console.log('Payment Successful:', event.mpesa_reference);
      // Retrieve pending payment information
      const pendingPayment = pendingPayments[invoiceId];

      if (pendingPayment) {
        const { fleet, paymentInfo } = pendingPayment;
        const smsMsg = `Greetings Commuter. CONFIRMED. SH.${paymentInfo.amount} fare paid to ${fleet}. MPESA REF: ${mpesaReference}. Thank you for using TumaFare Service. `
        const msgOptions = {
          to: paymentInfo.phone,
          message: smsMsg,
        };

        console.log(msgOptions);

        await smsService.sendSMS(msgOptions);
        // Save payment information to the database after successful payment
        await savePaymentData({
          phoneNumber: paymentInfo.phone,
          amount: paymentInfo.amount,
          fleetNumber: fleet,
          mpesaref: mpesaReference,
        });

        // Remove the pending payment from the list
        delete pendingPayments[invoiceId];
      } else {
        console.error('Pending payment not found for invoice:', invoiceId);
      }
    } else if (event.state === 'FAILED') {
      // Handle failed payment
      console.log('Payment Failed:', event.failed_reason);
    }
    // res.status(200).send('Event received');
  }


};