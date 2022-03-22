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


app.get('/add-User', (req, res) => {
    /*
    const user = new User({
        userID: "777",
        gender: 1,
        weight: 145,
        workouts: {
            benchpress: {
                max: 400
            }
        }
    });
    */
    try {
        const work = new workoutMets({
            userID: "7000",
            gender: 1,
            weight: 145,
            workouts: {
                benchpress: {
                    max: 400,
                    presses: [123, 455, 788]
                }
            }
        });

        work.save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
    } catch(e) {
        console.log(e.message);
    }


})

app.post('/api/login', async (req, res, next) => 
{
  // incoming: login, password
  // outgoing: id, firstName, lastName, error

  var error = '';

  const { login, password } = req.body;

  var id = -1;
  var fn = '';
  var ln = '';

  if( login.toLowerCase() == 'rickl' && password == 'COP4331' )
  {
    id = 1;
    fn = 'Rick';
    ln = 'Leinecker';
  }
  else
  {
    error = 'Invalid user name/password';
  }

  var ret = { id:id, firstName:fn, lastName:ln, error:error};
  res.status(200).json(ret);
});

