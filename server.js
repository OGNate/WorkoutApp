const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');

// Allows us to access the .env file
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Gets the mongodb_URI from our .env file and then connects using mongoose to it
const mongodb_URI = process.env.MONGODB_URI;
mongoose.connect(mongodb_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => app.listen(process.env.PORT))
    .catch((err) => console.log(err));


app.get('/add-User', (req, res) => {
    const user = new User({
        firstName: "Bob",
        lastName: "Tommy",
        dateOfBirth: "12/12/12"
    });

    user.save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
})
