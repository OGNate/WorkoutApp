const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const {
  User,
  workoutMets
} = require('./Mongo_Models');

// Allows us to access the .env file
require("dotenv").config();

const path = require('path');
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


//Register API
app.post('/api/register', (req, res) => {

  User.findOne({
    email: req.body.email
  }).then((user) => {

    if (user) {

      return res.status(400).json({
        email: "Email already exists"
      })

    } else {

      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      })

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {

          if (err) throw err;

          newUser.password = hash;

          newUser
            .save()
            .then(user => res.status(200).json(user))
            .catch(err => console.log(err));
        });
      });
    }
  })
})

// DELETE WHEN DONE
// Shows how to find a user by their object ID
app.post('/api/test', async (req, res, next) => {
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

//Login API
app.post('/api/login', async (req, res, next) => {

  User.findOne({
    email: req.body.email
  }).then((user) => {

    if (!user) {
      return res.status(404).json({ error: "No account found by email" });
    }

    const password = req.body.password;

    bcrypt.compare(password, user.password).then(isMatch => {

      if (isMatch) {

        const payload = {
          id: user.id,
          name: user.name
        };

        return res.status(200).json({ success: true });

      } else {

        return res.status(400).json({
          error: "Invalid email or password"
        });
      }
    });
  });
});

//addBodyMetrics API
app.post('/api/addBodyMetrics', async (req, res, next) => {

  User.findById({
    _id: ObjectId(req.body._id)
}).then((user) => {

  if (!user) {
    return res.status(404).json({ error: "User does not exist. Re-check User ID" });
  }

  else {

    const newBodyMetrics = new workoutMets({
      userID: ObjectId(req.body._id).toString(),
      gender: req.body.gender,
      weight: req.body.weight,
      height_feet: req.body.height_feet,
      height_inches: req.body.height_inches,
      age: req.body.age,
    })
  
    newBodyMetrics.save();
    return res.status(200).json(newBodyMetrics);
  }
});
});

//updateBodyMetrics API
app.post('/api/updateBodyMetrics', async (req, res, next) => {
  //Accepts user id, gender, weight, height in feet, height in inches, and age
  //Returns newly created workoutMetrics document
  
    var newMetrics = {$set: req};
    workoutMets.updateOne({
      userID: ObjectId(req.body._id)
  }, newMetrics).then((workoutmets) => {
  
    if (!workoutmets) {
      return res.status(404).json({ error: "User's metrics do not exist. Re-check User ID." });
    }
  
    else {
      console.log("Update successful.");
      return res.status(200).json({msg: "Metrics Successfully Updated."});
    }
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
