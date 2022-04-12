const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Validator = require('validator');
const isEmpty = require('is-empty');
var token = require('./createJWT.js');
const crypto = require('crypto');
const sendVerificationEmail = require('./emailUtils/email.js');
const sendPasswordResetEmail = require('./emailUtils/sendPasswordReset.js');
require('dotenv').config();

// Imports all the mongoose schemas from the "schemas" folder
const User = require("./schemas/userSchema");
const userSession = require("./schemas/userSessionsSchema");
const workoutFormat = require("./schemas/workoutSchema");
const userStats = require("./schemas/statSchema")
const userHistory = require("./schemas/historySchema")
const emailToken = require("./schemas/emailToken");
const passwordReset = require("./schemas/passwordResetToken");


// Planning on getting rid of metrics such as weight, height, and gender right now. 
//const {TESTUser, workoutMets} = require('./Mongo_Models');
//const {User, WorkoutMets} = require('./Mongo_Models');


const path = require('path');
const { ObjectId } = require('mongodb');
const { TokenExpiredError } = require('jsonwebtoken');
const { send } = require('process');

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




app.post('/api/register', async(req, res) => {

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
  }

  const checkUserEmail = await User.findOne({email: req.body.email});
  if(checkUserEmail) return res.status(420).json({error: "Email Already Exists"});

  const newUser = new User({
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
      newUser.save();
    });
  });


  // Creates an email verification token
  const emailVerificationToken = new emailToken({
	  userID: newUser._id,
	  token: crypto.randomBytes(32).toString('hex')
  });

  await emailVerificationToken.save();

  // Sends a verification email to verify the email
  sendVerificationEmail(newUser._id, newUser.email, emailVerificationToken.token);

  // DELETE WHEN DONE
  res.send("Please verify your email");

});

// -------------------------------------------------------------------------------------------------------------------------------------------------
// Verifies the email of the registered user
app.get("/emailVerification/:userID/:uniqueEmailToken", async (req, res) => {

  const checkUser = await User.findOne({_id: req.params.userID});
  if(!checkUser) return res.status(420).json({error: "Error at checking userID in server.js email verificaiton"});

  const checkEmailToken = await emailToken.findOne({userID: req.params.userID, token: req.params.uniqueEmailToken});
  if(!checkEmailToken) return res.status(420).json({error: "emailToken does not exist"});

  // Changes isVerified classification for the user to true.
  checkUser.isVerified = true;
  await checkUser.save();

  // Deletes the email token from emailToken collection
  await emailToken.deleteOne({userID: ObjectId(req.params.userID), token: req.params.uniqueEmailToken});

  // Creates a stat history for the new user
  const newStat = new userStats({
    userID: req.params.userID
  });

  await newStat.save();
  
  console.log(`${checkUser.email} is now verified`);

  // DELETE WHEN DONE, supposed to redirect to login page
  res.status(200).json({
      status: "Successful",
      in: "/emailVerification/:userID/:uniqueEmailToken",
      message: `Successfully verified ${checkUser.email}`
  });
});

// ---------------------------------------------------------------------------------------------------------------------------------------------------
// NOT DONE YET, STILL WORKING
// Takes in:
//      email
app.post("/api/requestPasswordReset", async(req, res) => {

    // Checks if a user with the given email exists
    const checkUser = await User.findOne({email: req.body.email});
    if(!checkUser) return res.status(420).json({status: "Failed", in: "/api/requestPasswordReset", msg: "Email does not exist"});

    // Creates a new password reset token
    const passwordResetToken = new passwordReset({
        userID: checkUser._id,
        resetToken: crypto.randomBytes(32).toString('hex')
    });

    // Adds the password reset token to the passwordresets collection in mongodb
    await passwordResetToken.save();

    console.log(passwordResetToken.resetToken);

    sendPasswordResetEmail(checkUser._id, checkUser.email, passwordResetToken.resetToken);

    res.send(`If ${checkUser.email} is in our system, password reset link sent to email`);

});

// ------------------------------------------------------------------------------------------------------------------------------------------------------------
// Takes in:
//      newPassword
app.post("/passwordReset/:userID/:passwordResetToken", async (req, res) => {
    
    // Checks if the user exists
    const checkUser = await User.findOne({_id: req.params.userID});
    if(!checkUser) return res.status(420).json({status: "Failed", in: "/passwordReset/:userID/:passwordResetToken", message: "User does not exist"});

    // Checks if the password reset token exists
    const checkPasswordResetToken = await passwordReset.findOne({userID: ObjectId(req.params.userID), resetToken: req.params.passwordResetToken});
    if(!checkPasswordResetToken) return res.status(420).json({status: "Failed", in: "/passwordReset/:userID/:passwordResetToken", message: "Password reset token does not exist"});

    // Hashes the new password and saves the user.
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
          if (err) throw err;
    
          checkUser.password = hash;
          checkUser.save();
        });
    });

    // Deletes the password reset token
    await passwordReset.deleteOne({userID: req.params.userID, resetToken: req.params.passwordResetToken});

    console.log("Password successfully reset");
    res.status(200).json({
        status: "Successful",
        in: "/passwordReset/:userID/:passwordResetToken",
        message: "Password successfully reset"
    });
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
  //Outgoing: acessToken, fn, ln, id, error

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

    if(user.isVerified == false) {
      return res.status(420).json({
        error: "Account is not verified, please check email for verification email"
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
    }   
  });
  }
  catch (e) 
  {
    error = e.toString();
  }
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

    if (!results.length) {
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

    if (!results.length) {
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
    }
  });
  }
  catch (e)
  {
    error = e.toString();
  }
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

    if (!results.length) {
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
    console.log(e.message);
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

    if (!results.length) {
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

    if (!results.length) {
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

    if (!results.length) {
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

    if (!results.length) {
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

    if (!results.length) {
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

    if (!results.length) {
      return res.status(404).json({
        error: "No workout found for workout type!"
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

    if (!results.length) {
      return res.status(404).json({
        error: "No workout found for equipment!"
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

//finishWorkout API
//Also updates userStats and userHistory
app.post('/api/finishWorkout', async (req, res, next) => {

  //Incoming: userID, sessionID, sessionName, exerciseName, weight, reps, sets, time, distance
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
  userSession.findOneAndUpdate({
    _id: ObjectId(req.body.sessionID)
  }, {
    isCompleted: true
  }, {
    new: true}).then((result) => {

    //Create new user history entry
    const newUserHistory = new userHistory({
      userID: req.body.userID,
      sessionName: req.body.sessionName,
      workoutName: req.body.exerciseName,
      weight: req.body.weight,
      reps: req.body.reps,
      sets: req.body.sets,
      distance: req.body.distance,
      time: req.body.time,
      completedAt: result.updatedAt
    });
    newUserHistory.save();

    //Update Stats
    var totalWeight = (req.body.weight != -1) ? req.body.weight : 0;
    var totalReps = (req.body.reps != -1) ? req.body.reps : 0;
    var totalSets = (req.body.sets != -1) ? req.body.sets : 0;
    var totalDistance = (req.body.distance != -1) ? req.body.distance : 0;
    var totalTime = (req.body.time != -1) ? req.body.time : 0;

    userStats.findOneAndUpdate({
      userID: ObjectId(req.body.userID)
    }, {
      $inc : {
        totalWeight: totalWeight,
        totalReps: totalReps,
        totalSets: totalSets,
        totalDistance: totalDistance,
        totalTime: totalTime
      }
    }).then((stats) => {
    });

    //Check to see if session is finished
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

//displayUserHistory API
app.post('/api/displayUserHistory', async (req, res, next) => {

  //Incoming: userID, jwtToken
  //Outgoing: userHistory[], error, jwtToken

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
  userHistory.find({
    userID: ObjectId(req.body.userID),
  }).then((results) => {

    if (!results.length) {
      return res.status(404).json({
        error: "No user history found for this user."
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        if (ret.includes(results[i])) {
          continue;
        }
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
      return res.status(200).json({userHistory: ret, error: error, jwtToken: refreshedToken});
    }
  });
  }
  catch (e) 
  {
    console.log(e.message);
  }
});

// -----------------------------------------------------------------------------------------------------------------------------------
// JSON Params:
//		jwtToken: A given Java Web Token (JWT) passed onto the json.
//		userID: A userID passed on to identify which user we will be displaying the stats of.
// Returns:
//		Returns a json of the user's stats, and empty error message, and a refreshed JWT token.
//
app.post('/api/displayUserStats', async (req, res, next) => {
	
	//Incoming: userID, jwtToken
	//Outgoing: userStats, error, jwtToken

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
			if (!result.length) {
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
				userStats: result,
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
