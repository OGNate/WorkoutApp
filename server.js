const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Validator = require('validator');
const isEmpty = require('is-empty');
var token = require('./createJWT.js');
const sgMail = require('@sendgrid/mail')
const crypto = require('crypto');
const sendEmail = require("./email");
require("dotenv").config();

// Imports all the mongoose schemas from the "schemas" folder
const User = require("./schemas/userSchema");
const userSession = require("./schemas/userSessionsSchema");
const workoutFormat = require("./schemas/workoutSchema");
const userStats = require("./schemas/statSchema");
const userHistory = require("./schemas/historySchema");
const emailToken = require("./schemas/emailToken");


// Planning on getting rid of metrics such as weight, height, and gender right now. 
//const {TESTUser, workoutMets} = require('./Mongo_Models');
//const {User, WorkoutMets} = require('./Mongo_Models');


// Sets the Send Grid API KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const path = require('path');
const { ObjectId } = require('mongodb');
const { TokenExpiredError } = require('jsonwebtoken');

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
app.post('/api/register', async (req, res) => {

  //Incoming: firstName, lastName, email, password, password2
  //Outgoing: errors

  let errors = {};

  var firstNameArg = !isEmpty(req.body.firstName) ? req.body.firstName : "";
  var lastNameArg = !isEmpty(req.body.lastName) ? req.body.lastName : "";
  var emailArg = !isEmpty(req.body.email) ? req.body.email : "";
  var passwordArg = !isEmpty(req.body.password) ? req.body.password : "";
  var password2Arg = !isEmpty(req.body.password2) ? req.body.password2 : "";

  if (Validator.isEmpty(firstNameArg)) {
    errors.firstName = "First name field is required";
  }

  if (Validator.isEmpty(lastNameArg)) {
    errors.lastName = "Last name field is required";
  }

  if (Validator.isEmpty(emailArg)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(emailArg)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(passwordArg)) {
    errors.password = "Password field is required";
  }

  if (Validator.isEmpty(password2Arg)) {
    errors.password = "Confirm password field is required";
  }

  if (!Validator.equals(passwordArg, password2Arg)) {
    errors.password2 = "Passwords do not match";
  }

  if (!Validator.isLength(passwordArg, { min: 8 })) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json(errors);

  } else {

      const user = await User.findOne({email: req.body.email});
      if(user) return res.status(420).json({email: "Email already exists"});

      const newUser = await new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        isVerified: false,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {

          if (err) throw err;

          newUser.password = hash;
          
          newUser
            .save()
            //.then(user => /*res.status(200).json(user) console.log("Hashed password"))
            //.catch(err => console.log(err));

          
        });
      });
    /*
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
          isVerified: false,
        });

        // Hashes the password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {

            if (err) throw err;

            newUser.password = hash;
            
            newUser
              .save()
              .then(user => /*res.status(200).json(user) console.log("Hashed password"))
              .catch(err => console.log(err));

            
          });
        });

        */

        try {
          // Creates an 
          const _emailToken = await new emailToken({
            userID: newUser._id,
            token: crypto.randomBytes(32).toString("hex")
          }).save()

          const message = `${process.env.BASE_URL}/user/verify/${newUser._id}/${_emailToken.token}`;
          console.log(message);
          sendEmail(newUser.email, "Verify Email", message);

          res.send("Email sent to your account, please verify");
        }
        catch(error) {
          return res.status(420).send("Error occured HERE");
        }

        // Create a new initialized stats page for the new user
        const newStat = new userStats({
			    userID: newUser._id
		    });

        newStat.save();
        return res.status(200).json({msg: "Works with register"});
      }
});

app.get("/user/verify/:id/:token", async (req, res) => {
  try {
      // FInds the user
      const user = await User.findOne({_id: req.params.id});
      if(!user) {
        console.log("invalid link");
        return res.status(420).send("invalid link");
      }  

      const token = await emailToken.findOne({userID: user._id, token: req.params.token});
      if(!token) {
        console.log("Invalid Link");
        return res.status(420).send("Invalid Link");
      } 

      await User.updateOne({_id: user._id, isVerified: true});
      await emailToken.findByIdAndRemove(token._id);
      
      console.log("Email Verified Successfully");
      res.status(200).send("Email Verified Successfully");
  } catch (error) {
      console.log("Error occured in /verify/:id/:token");
      res.status(404).send("Error occured in /verify/:id/:token");
  }
});


// TESTING ONLY, DELETE WHEN DONE
// Used to insert all our excercises into the database for easy recall later
app.post('/Test', async (req, res, next) => {

	const newWorkout = new workoutFormat({
		name: req.body.name,
		bodyPart: req.body.bodyPart,
		equipment: req.body.equipment,
		workoutType: req.body.workoutType,
		hasReps: req.body.hasReps,
		hasWeight: req.body.hasWeight,
		hasTime: req.body.hasTime,
		hasDistance: req.body.hasDistance
	});

	newUserHistory.save();
	return res.status(200).json({msg: "Successfully added user history to database"});
});


//login API
app.post('/api/login', async (req, res, next) => {

  //Incoming: email, password
  //Outgoing: jwtToken, error

  let errors = {}

  var emailArg = !isEmpty(req.body.email) ? req.body.email : "";
  var passwordArg = !isEmpty(req.body.password) ? req.body.password : "";

  if (Validator.isEmpty(emailArg)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(emailArg)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(passwordArg)) {
    errors.password = "Password field is required";
  }

  if (!isEmpty(errors)) {
    return res.status(400).json(errors);
  }

  User.findOne({
    email: req.body.email
  }).then((user) => {

    if (!user) {

      return res.status(404).json({
        error: "No account belongs to that email."
      });
    }

    const password = req.body.password;

    bcrypt.compare(password, user.password).then(isMatch => {

      if (isMatch) {

        try
        {
          const token = require("./createJWT.js");
          ret = token.createToken( user.firstName, user.lastName, user._id );
        }
        catch(e)
        {
          ret = {error:e.message};
        }

        const payload = {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName
        };

        return res.status(200).json({ret});

      } else {

        return res.status(400).json({
          error: "Invalid password."
        });
      }
    });
  });
});

//addSession API
app.post('/api/addSession', async (req, res, next) => {

  //Incoming: userID, sessionName, jwtToken
  //Outgoing: error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = "";

  try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
  try
  {
  userSession.findOne({
    userID: ObjectId(req.body.userID),
    sessionName: req.body.sessionName
  }).then((session) => {

    if (session) {
      return res.status(404).json({
        error: "Session name already exists. Try another one."
      });
    } else {
      const newWorkoutSession = new userSession({
        userID: ObjectId(req.body.userID),
        sessionName: req.body.sessionName,
        isEmpty: true
      })
      newWorkoutSession.save();
    }   
  });
  }
  catch (e) 
  {
    error = e.toString();
  }

  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
  return res.status(200).json({error: error, jwtToken: refreshedToken});
});

//updateSession API
app.post('/api/updateSession', async (req, res, next) => {

  //Incoming: userID, oldName, newName, jwtToken
  //Outgoing: error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  try
  {
  userSession.updateMany({
    userID: ObjectId(req.body.userID),
    sessionName: req.body.oldName
  }, {
    sessionName: req.body.newName
  }).then((result) => {
  });
  }
  catch (e) 
  {
    error = e.toString();
  }

  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
  return res.status(200).json({error: error, jwtToken: refreshedToken});
});

//displaySessions API
app.post('/api/displaySessions', async (req, res, next) => {

  //Incoming: userID, jwtToken
  //Outgoing: sessions[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var ret = [];
  var error = "";

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  try
  {
  userSession.find({
    userID: ObjectId(req.body.userID),
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No sessions found for this user."
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        if (ret.includes(results[i].sessionName)) {
          continue;
        }
        ret.push( results[i].sessionName );
      }

      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      return res.status(200).json({sessions: ret, error: error, jwtToken: refreshedToken});
    }
  });
  }
  catch (e) 
  {
    console.log(e.message);
  }
});

//deleteSession API
app.post('/api/deleteSession', async (req, res, next) => {

  //Incoming: userID, sessionName, jwtToken
  //Outgoing: error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = "";

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  userSession.findOne({
    userID: ObjectId(req.body.userID),
    sessionName: req.body.sessionName
  }).then((session) => {

    if (!session) {
      return res.status(404).json({
        error: "Session does not exist."
      });
  }
  });

  try
  {
  userSession.deleteMany({
    userID: ObjectId(req.body.userID),
    sessionName: req.body.sessionName
  }).then((result) => {
  });
  }
  catch (e)
  {
    error = e.toString();
  }

  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
  return res.status(200).json({error: error, jwtToken: refreshedToken});
});

//searchWorkout API
app.post('/api/searchWorkout', async (req, res, next) => {

  //Incoming: query, jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];
  var _search = req.body.query.trim();

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  workoutFormat.find({
    name: { $regex: _search + '.*', $options: 'i' }
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No workouts matched the description. Please try again."
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        ret.push( results[i] );
      }

      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      return res.status(200).json({results: ret, error: error, jwtToken: refreshedToken});
    }
  });
});

//updateWorkout API
app.post('/api/updateWorkout', async (req, res, next) => {

  //Incoming: sessionID, exerciseName, reps, weight, time, distance, sets, bodyPart, jwtToken
  //Outgoing: error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  try
  {
  userSession.updateOne({
    _id: ObjectId(req.body.sessionID)
  }, {
    exerciseName: req.body.exerciseName,
    reps: req.body.reps,
    weight: req.body.weight,
    time: req.body.time,
    distance: req.body.distance,
    bodyPart: req.body.bodyPart,
    sets: req.body.sets,
  }).then((result) => {
  });
  }
  catch (e)
  {
    error = e.toString();
  }

  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
  return res.status(200).json({error: error, jwtToken: refreshedToken});
});

//addWorkout API
app.post('/api/addWorkout', async (req, res, next) => {

  //Incoming: userID, sessionName, exerciseName, reps, weight, time, distance, sets, bodyPart, jwtToken
  //Outgoing: error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = "";

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  try
  {
  userSession.findOne({
    userID: ObjectId(req.body.userID),
    sessionName: req.body.sessionName,
  }).then((session) => {

    if (!session) {
      return res.status(404).json({
        error: "Session doesn't exist."
      });
    } 

    else {
      userSession.deleteMany({
        userID: ObjectId(req.body.userID),
        sessionName: req.body.sessionName,
        isEmpty: true
      }).then((result) => {
      });

      const newWorkoutSession = new userSession({
        userID: ObjectId(req.body.userID),
        sessionName: req.body.sessionName,
        exerciseName: req.body.exerciseName,
        reps: req.body.reps,
        weight: req.body.weight,
        time: req.body.time,
        distance: req.body.distance,
        sets: req.body.sets,
        bodyPart: req.body.bodyPart,
        isEmpty: false
      });
      newWorkoutSession.save();
    }
  });
  }
  catch (e)
  {
    error = e.toString();
  }

  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
  return res.status(200).json({error: error, jwtToken: refreshedToken});
});

//displaySessionWorkouts API
app.post('/api/displaySessionWorkouts', async (req, res, next) => {

  //Incoming: userID, sessionName, jwtToken
  //Outgoing: workouts[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = "";
  var ret = [];

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  userSession.find({
    userID: ObjectId(req.body.userID),
    sessionName: req.body.sessionName
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No sessions matched the description. Please try again."
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        ret.push( results[i] );
      }

      if (ret[0].isEmpty == true) {
        return res.status(200).json({
          error: "The session is empty."
        })
      }

      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      return res.status(200).json({workouts: ret, error: error, jwtToken: refreshedToken});
    }
  });
});

//deleteWorkout API
app.post('/api/deleteWorkout', async (req, res, next) => {

  //Incoming: sessionID, sessionName, userID
  //Outgoing: error

  const jwtToken = req.body.jwtToken;
  var error = "";

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  try
  {
  userSession.findOneAndDelete({
    _id: ObjectId(req.body.sessionID)
  }).then((session) => {

    if (!session) {
      return res.status(404).json({
        error: "Session does not exist."
      });
  }

  userSession.findOne({
    userID: ObjectId(req.body.userID),
    sessionName: req.body.sessionName
  }).then((session) => {

    if(!session) {
      const newWorkoutSession = new userSession({
        userID: ObjectId(req.body.userID),
        sessionName: req.body.sessionName,
        isEmpty: true
      });
      newWorkoutSession.save();
    }
  });
  });
  }
  catch (e)
  {
    error = e.toString();
  }

  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
  return res.status(200).json({error: error, jwtToken: refreshedToken});
});

//displayAllWorkouts API
app.post('/api/displayAllWorkouts', async (req, res, next) => {

  //Incoming: jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  workoutFormat.find({}).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "Workout database is empty!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        ret.push( results[i] );
      }

      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      return res.status(200).json({results: ret, error: error, jwtToken: refreshedToken});
    }
  });
});

//displayAllBodyParts API
app.post('/api/displayAllBodyParts', async (req, res, next) => {

  //Incoming: jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  workoutFormat.find({}).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "Workout database is empty!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        for( var j=0; j<results[i].bodyPart.length; j++)
        {
          if (ret.includes(results[i].bodyPart[j]))
          {
            continue;
          }
          ret.push( results[i].bodyPart[j] );
        }
      }
      return res.status(200).json({results: ret, error: error, jwtToken: refreshedToken});
    }
  });

  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
});

//displayAllWorkoutTypes API
app.post('/api/displayAllWorkoutTypes', async (req, res, next) => {

  //Incoming: jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  workoutFormat.find({}).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "Workout database is empty!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        if (ret.includes(results[i].workoutType))
        {
          continue;
        }
        ret.push( results[i].workoutType );
      }
      return res.status(200).json({results: ret, error: error, jwtToken: refreshedToken});
    }
  });

  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
});

//displayAllEquipment API
app.post('/api/displayAllEquipment', async (req, res, next) => {

  //Incoming: jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  workoutFormat.find({}).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "Workout database is empty!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        for( var j=0; j<results[i].equipment.length; j++)
        {
          if (ret.includes(results[i].equipment[j]))
          {
            continue;
          }
          ret.push( results[i].equipment[j] );
        }
      }

      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      return res.status(200).json({results: ret, error: error, jwtToken: refreshedToken});
    }
  });
});

//searchByBodyPart API
app.post('/api/searchByBodyPart', async (req, res, next) => {

  //Incoming: bodyPart, jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  workoutFormat.find({
    bodyPart: req.body.bodyPart
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No workout found for body part!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        ret.push( results[i] );
      }

      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      return res.status(200).json({results: ret, error: error, jwtToken: refreshedToken});
    }
  });
});

//searchByWorkoutType API
app.post('/api/searchByWorkoutType', async (req, res, next) => {

  //Incoming: workoutType, jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  workoutFormat.find({
    workoutType: req.body.workoutType
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No workout found for body part!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        ret.push( results[i] );
      }

      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      return res.status(200).json({results: ret, error: error, jwtToken: refreshedToken});
    }
  });
});

//searchByEquipment API
app.post('/api/searchByEquipment', async (req, res, next) => {

  //Incoming: equipment, jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  workoutFormat.find({
    equipment: req.body.equipment
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No workout found for body part!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        ret.push( results[i] );
      }

      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      return res.status(200).json({results: ret, error: error, jwtToken: refreshedToken});
    }
  });
});

//finishWorkoutAndUpdateHistory API
app.post('/api/finishWorkoutAndUpdateHistory', async (req, res, next) => {

  //Incoming: userID, sessionID, sessionName
  //Outgoing: sessionCompleted, error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';

  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  try
  {
  userSession.updateOne({
    _id: ObjectId(req.body.sessionID)
  }, {
    isCompleted: true
  }).then((result) => {

    userStats.updateOne({
      userId: req.body.userID
    }, {
      
    }).then((update_result) => {
      
    });

    userSession.find({
      userID: ObjectId(req.body.userID),
      sessionName: req.body.sessionName
    }).then((results) => {

      var sessionCompleted = true;
      for (var i=0; i<results.length; i++)
      {
        if(results[i].isCompleted == false)
        {
          sessionCompleted = false;
          break;
        }
      }

      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      return res.status(200).json({sessionCompleted: sessionCompleted, error: error, jwtToken: refreshedToken});
    });
  });
  }
  catch (e)
  {
    console.log(e.message);
  }
});

//displayAllBodyParts API
app.post('/api/displayAllBodyParts', async (req, res, next) => {

  //Incoming: jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  /*
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
  */

  workoutFormat.find({}).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "Workout database is empty!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        for( var j=0; j<results[i].bodyPart.length; j++)
        {
          if (ret.includes(results[i].bodyPart[j]))
          {
            continue;
          }
          ret.push( results[i].bodyPart[j] );
        }
      }
      return res.status(200).json({results: ret, error: error/*, jwtToken: refreshedToken*/});
    }
  });

  /*
  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
  */
  //return res.status(200).json({results: ret, error: error, jwtToken: refreshedToken});
});

//displayAllWorkoutTypes API
app.post('/api/displayAllWorkoutTypes', async (req, res, next) => {

  //Incoming: jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  /*
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
  */

  workoutFormat.find({}).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "Workout database is empty!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        if (ret.includes(results[i].workoutType))
        {
          continue;
        }
        ret.push( results[i].workoutType );
      }
      return res.status(200).json({results: ret, error: error/*, jwtToken: refreshedToken*/});
    }
  });

  /*
  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
  */
  //return res.status(200).json({results: ret, error: error/*, jwtToken: refreshedToken*/});
});

//displayAllEquipment API
app.post('/api/displayAllEquipment', async (req, res, next) => {

  //Incoming: jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  /*
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
  */

  workoutFormat.find({}).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "Workout database is empty!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        for( var j=0; j<results[i].equipment.length; j++)
        {
          if (ret.includes(results[i].equipment[j]))
          {
            continue;
          }
          ret.push( results[i].equipment[j] );
        }
      }

      /*
      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      */
      return res.status(200).json({results: ret, error: error/*, jwtToken: refreshedToken*/});
    }
  });
});

//searchByBodyPart API
app.post('/api/searchByBodyPart', async (req, res, next) => {

  //Incoming: bodyPart, jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  /*
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
  */

  workoutFormat.find({
    bodyPart: req.body.bodyPart
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No workout found for body part!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        ret.push( results[i] );
      }

      /*
      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      */
      return res.status(200).json({results: ret, error: error/*, jwtToken: refreshedToken*/});
    }
  });
});

//searchByWorkoutType API
app.post('/api/searchByWorkoutType', async (req, res, next) => {

  //Incoming: workoutType, jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  /*
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
  */

  workoutFormat.find({
    workoutType: req.body.workoutType
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No workout found for body part!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        ret.push( results[i] );
      }

      /*
      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      */
      return res.status(200).json({results: ret, error: error/*, jwtToken: refreshedToken*/});
    }
  });
});

//searchByEquipment API
app.post('/api/searchByEquipment', async (req, res, next) => {

  //Incoming: equipment, jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  /*
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
  */

  workoutFormat.find({
    equipment: req.body.equipment
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No workout found for body part!"
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        ret.push( results[i] );
      }

      /*
      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
      */
      return res.status(200).json({results: ret, error: error/*, jwtToken: refreshedToken*/});
    }
  });
});

// -----------------------------------------------------------------------------------------------------------------------------------
// JSON Params:
//		jwtToken: A given Java Web Token (JWT) passed onto the json.
//		userID: A userID passed on to identify which user we will be displaying the stats of.
// Returns:
//		Returns a json of the user's stats, and empty error message, and a refreshed JWT token.
//
app.post('/api/displayUserStats', async (req, res, next) => {
	const jwtToken = req.body.jwtToken;
	var ret = [];
	var error = "";
	
	// Checks to see if the given Java Web Token is expired, if so it returns an error message and exits.
	try {
		if(token.isExpired(jwtToken)) {
			var r = {error: "The JWT is no longer valid", jwtToken: ""};
			res.status(420).json(r);
			return;
		}
	} 
	catch(error) {
		console.log(error.message);
		return res.status(420).json({error: error.message});
	}

	try {

		// Finds the stats for the given userID
		userStats.find({userID: ObjectId(req.body.userID)}).then((result) => {
			
			// If there are no stats in with the given userID, return a error message
			if (!result) {
				return res.status(420).json({error: "Stats for given user do not exist, check userID again"});
			}

			// If there are more than one user with the same userID, an error will be thrown.
			if (result.length != 1) {
				return res.status(420).json({error: "Multiple users with the same userID"});
			}

			// Creates a new JWT token
			var refreshedToken = null;

			try {

				// Gets a refreshed JWT token
				refreshedToken = token.refresh(jwtToken);
			}
			catch(error) {
				console.log(error.message);
				return res.status(420).json({error: error.message});
			}

			// Returns a 200 status (meaning everything works). Returns a json of the users stats, the error message (should be nothing), and the refreshed JWT token.
			return res.status(200).json({
				userStat: result,
				error: error,
				jwtToken: refreshedToken
			});
		});
	}
	catch(error) {
		console.log(error.message);
		return res.status(420).json({error: error.message});
	}
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
