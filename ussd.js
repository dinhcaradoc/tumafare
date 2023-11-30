const UssdMenu = require('ussd-builder');
const vehicle = require("./vehicles")

let menu = new UssdMenu();

menu.startState({
    run: () => {
        menu.con(`Welcome to TumaFare \n\n Enter the vehicle fleet number:
        \n1. Continue`);
    },
    next: {
        '1': 'inputAmount'
    }
});

menu.state('inputAmount', {
    run: () => {
        menu.con(`Enter the amount`);
    },
    next: {
        '*\\d+': 'confirmInput'
    }
});

menu.state('confirmInput', {
    run: () => {
        let amnt = menu.val;
        menu.con(`You are about to pay ${amnt} to TumaFare Inc. Please confirm:
        \n1. Confirm
        \n2. Cancel`)
    },
    next: {
        '1': 'confirmPay',
        '2': 'cancelPay'
    }
});

menu.state('confirmPay', {
    run: () => {
        
        menu.end(`Thank you for using Tuma Fare service. Enter your MPesa pin when prompted.`)
    }
});

menu.state('cancelPay', {
    run: () => {
        let amnt = menu.val;
        menu.end(`You have cancelled the transaction. Thank you for using Tuma Fare.`)
    }
});

exports.initUssd = (req, res) => {
    menu.run(req.body, ussdResult => {
        res.send(ussdResult);
    });
};