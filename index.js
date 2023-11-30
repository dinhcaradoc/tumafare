const express = require("express");
const ussd = require('./ussd');

const app = express();

app.get('/', (req, res) => {
    res.send("GET Request Called")
})

app.post('/ussd', ussd.initUssd);

const port = 3004;
app.listen(port, () => {
    console.log(`Server started on port: ${port}`)
})