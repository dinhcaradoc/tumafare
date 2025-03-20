const UssdMenu = require('ussd-builder');
// const vehicle = require('./models/vehicles');
const payments = require('./models/payments');
const STKPush = require('./intasend');
const redisClient = require('./config/redis'); // Import Redis configuration

const sessionPrefix = 'ussd_session_'; // Define session prefix

const menu = new UssdMenu();

// Function to get or create session
const getSession = async (sessionId) => {
  try {
    const sessionData = await redisClient.hGetAll(sessionPrefix + sessionId);
    if (!sessionData || Object.keys(sessionData).length === 0) {
      return {}; // Initialize session data if not found
    }
    return sessionData;
  } catch (err) {
    console.error('Error retrieving session data from Redis:', err);
    throw err;
  }
};

// Function to set session data
const setSession = async (sessionId, data) => {
  try {
    await redisClient.hSet(sessionPrefix + sessionId, data);
  } catch (err) {
    console.error('Error setting session data in Redis:', err);
    throw err;
  }
};

menu.startState({
  run: () => {
    menu.con('Welcome to TumaFare \n\nPlease enter the vehicle fleet number:');
  },
  next: {
    '*\\w': 'inputAmount'
  }
});

menu.state('inputAmount', {
  run: async () => {
    const fleet = menu.val;
    try {
      const session = await getSession(menu.args.sessionId);
      session.fleet_no = fleet;
      await setSession(menu.args.sessionId, session);
      menu.con('Enter the amount');
    } catch (err) {
      menu.end('Error saving session data');
    }
  },
  next: {
    '*\\d+': 'confirmInput'
  }
});

menu.state('confirmInput', {
  run: async () => {
    const amount = menu.val;
    try {
      const session = await getSession(menu.args.sessionId);
      session.amount = amount;
      await setSession(menu.args.sessionId, session);
      fleet = session.fleet_no
      menu.con(`You are about to pay ${amount} to TumaFare Inc. for your trip with ${fleet} Please confirm:
                \n1. Confirm` +
        `\n2. Cancel`);
    } catch (err) {
      menu.end('Error saving session data');
    }
  },
  next: {
    '1': 'confirmPay',
    '2': 'cancelPay'
  }
});

menu.state('confirmPay', {
  run: async () => {
    try {
      const session = await getSession(menu.args.sessionId);
      let fare = session.amount
      const payInfo = {
        phone: menu.args.phoneNumber.substring(1), // Get phone number from USSD args
        amount: fare, // Get amount from session data
        fleet: session.fleet_no
      };

      console.log('Payment Info:', payInfo);

      // Initiate M-Pesa STK push payment using the payment service
      const paymentResponse = await STKPush.intaSTKPush(payInfo);

      // Log payment response (optional. used here for error checking)
      console.log('Payment Response:', paymentResponse);

      // End the USSD session with a confirmation message
      menu.end(`Thank you for using Tuma Fare service. Enter your MPesa pin when prompted.`);
    } catch (err) {
      // Log and handle any errors
      console.error('Error confirming payment:', `${JSON.stringify(err)}`);
      // End the USSD session with an error message
      menu.end(`An error occurred. Please try again later.`);
    }
  }
});

menu.state('cancelPay', {
  run: () => {
    menu.end('You have cancelled the transaction. Thank you for using Tuma Fare.');
  }
});

exports.initUssd = async (req, res) => {
  const args = {
    phoneNumber: req.body.phoneNumber,
    sessionId: req.body.sessionId,
    serviceCode: req.body.serviceCode,
    Operator: req.body.networkCode || req.body.Operator,
    text: req.body.text
  };
  console.log(args);
  menu.run(args, ussdResult => {
    res.send(ussdResult);
  });
};
