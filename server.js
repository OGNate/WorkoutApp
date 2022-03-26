const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const {
  User,
  workoutMets
} = require('./Mongo_Models');

// Allows us to access the .env file
require("dotenv").config();

const path = require('path');
const { ObjectId } = require('mongodb');
const PORT = process.env.PORT || 5000;

const app = express();

app.set('port', PORT);

app.use(cors());
app.use(bodyParser.json());

const mongodb_URI = process.env.MONGODB_URI;

mongoose.connect(mongodb_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch((err) => console.log(err));

// Server static assets if in production
if (process.env.NODE_ENV === 'production') {

  // Set static folder
  app.use(express.static('frontend/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

app.post('/api/register', (req, res) => {

  User.findOne({
    email: req.body.email
  }).then((user) => {

    if (user) {

      return res.status(400).json({
        email: "email already exist"
      })

    } else {

      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      })

      newUser.save()
      return res.status(200).json({
        msg: newUser
      })
    }
  })
})

// DELETE WHEN DONE
// Shows how to find a user by their object ID
app.post('/Test', async (req, res, next) => {
    User.findById({
        _id: ObjectId(req.body._id)
    }).then((user) => {

        if (user) {
            console.log("Found User");
            return res.status(200).json({
                msg: user
            });
        }

        console.log("invalid User");
        return res.status(404).json({
            msg: "Invalid User"
        });
    });
});


// Login API
app.post('/api/login', async (req, res, next) => {

  User.findOne({
    email: req.body.email,
    password: req.body.password
  }).then((user) => {

    if (user)
      return res.status(200).json({
        message: "Valid"
      });

    return res.status(400).json({
      error: "Invalid Credentials"
    });
  });
});

app.use((req, res, next) => {

  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );

  next();
});

app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});