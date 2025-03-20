const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const connectDb = require('./config/db')
const ussd = require('./ussd');
const intaCB = require('./intasend');

require('dotenv').config()

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to the database
connectDb()
  .then(() => console.log('Successfully connected to the database'))
  .catch(err => console.error('There was an error connecting to MongoDB:', err));

app.get('/', (req, res) => {
    res.send("GET Request Called")
})

app.post('/intaResponse', intaCB.handleCB);

// app.get('/tokenCheck', mpesa.generateToken)
app.post('/ussd', ussd.initUssd);

const port = 3004;
app.listen(port, () => {
    console.log(`Server started on port: ${port}`)
})