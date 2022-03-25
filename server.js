const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const {User, workoutMets} = require('./Mongo_Models');

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

//Register API
app.post('/api/register', (req, res) => {

    User.findOne({ email: req.body.email }).then((user) =>{
        if(user){
            // if email alread exist throw error
            return res.status(400).json({ email: "email already exist"})
        }
        else{
            const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
            })
            newUser.save()
            return res.status(200).json({msg: newUser})
        }
    })
})

// Login API
app.post('/api/login', async (req, res, next) => 
{
 
    User.findOne({email: req.body.email, password: req.body.password}).then((user) => {
        if (user) {
            console.log("Valid");
            return res.status(200).json({message: "Valid"});
        }
        
        return res.status(400).json({error: "Invalid Credentials"}); 
    });
});
