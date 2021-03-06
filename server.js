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
const cloudinary = require('cloudinary').v2;

require('dotenv').config();

// Imports all the mongoose schemas from the "schemas" folder
const User = require("./schemas/userSchema");
const userSession = require("./schemas/userSessionsSchema");
const workoutFormat = require("./schemas/workoutSchema");
const userStats = require("./schemas/statSchema")
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
  var usernameArg = !isEmpty(req.body.username) ? req.body.username : "";
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

  if (Validator.isEmpty(usernameArg)) {
    errors.userName = "Username field is required";
  }

  if (Validator.isEmpty(passwordArg)) {
    errors.password = "Password field is required";
  }
  
  if (!Validator.equals(passwordArg, password2Arg)) {
    errors.password2 = "Passwords do not match";
  }

  if (Validator.isEmpty(password2Arg)) {
    errors.password2 = "Confirm password field is required";
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
    username: req.body.username,
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
  sendVerificationEmail(newUser._id, newUser.firstName, newUser.email, emailVerificationToken.token);
  
  res.send("Please verify your email");
});

// -------------------------------------------------------------------------------------------------------------------------------------------------
// Verifies the email of the registered user
app.post("/api/emailVerification", async (req, res) => {

  const checkUser = await User.findOne({_id: ObjectId(req.body.userID)});
  if(!checkUser) return res.status(420).json({error: "Error at checking userID in server.js email verification"});

  const checkEmailToken = await emailToken.findOne({userID: req.body.userID, token: req.body.uniqueEmailToken});
  if(!checkEmailToken) return res.status(420).json({error: "emailToken does not exist"});

  // Changes isVerified classification for the user to true.
  checkUser.isVerified = true;
  await checkUser.save();

  // Deletes the email token from emailToken collection
  emailToken.deleteOne({userID: ObjectId(req.body.userID), token: req.body.uniqueEmailToken});

  // Creates a stat history for the new user
  const newStat = new userStats({
    userID: req.body.userID
  });

  await newStat.save();
  
  console.log(`${checkUser.email} is now verified`);

  res.status(200).json({
      status: "Successful",
      in: "/emailVerification/:userID/:uniqueEmailToken",
      message: `Successfully verified ${checkUser.email}`
  });
});

// ---------------------------------------------------------------------------------------------------------------------------------------------------
// Password Reset API that allows a user to reset their password
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

    sendPasswordResetEmail(checkUser._id, checkUser.firstName, checkUser.email, passwordResetToken.resetToken);

    res.send(`If ${checkUser.email} is in our system, password reset link sent to email`);

});

// ------------------------------------------------------------------------------------------------------------------------------------------------------------
// Takes in:
//      newPassword
app.post("/api/passwordReset", async (req, res) => {
    
    // Checks if the user exists
    const checkUser = await User.findOne({_id: req.params.userID});
    if(!checkUser) return res.status(420).json({status: "Failed", in: "/passwordReset/:userID/:passwordResetToken", message: "User does not exist"});

    // Checks if the password reset token exists
    const checkPasswordResetToken = await passwordReset.findOne({userID: ObjectId(req.body.userID), resetToken: req.body.passwordResetToken});
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
    await passwordReset.deleteOne({userID: req.body.userID, resetToken: req.body.passwordResetToken});

    console.log("Password successfully reset");

    res.status(200).json({
        status: "Successful",
        in: "/passwordReset/:userID/:passwordResetToken",
        message: "Password successfully reset"
    });
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

//userDetails API
app.post('/api/userDetails', async (req, res, next) => {

  //Incoming: userId, jwtToken
  //Outgoing: user, jwtToken

  const jwtToken = req.body.jwtToken;
  checkTokenStatus(res, jwtToken);

  User.findOne({
    _id: req.body.userId
  }).then((user) => {

    if (!user) {
      return res.status(404).json({
        error: "Unable to find user by ID."
      });
    }

    try
    {
      const token = require("./createJWT.js");
      newToken = token.createToken( user.firstName, user.lastName, user._id );
    }
    catch(e)
    {
      ret = {error:e.message};
    }

    return res.status(200).json({
      user: user,
      jwtToken: newToken
    });
  });
});

//addSession API
app.post('/api/addSession', async (req, res, next) => {

  //Incoming: userID, sessionName, jwtToken
  //Outgoing: error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = "";

  checkTokenStatus(res, jwtToken);

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
        sessionName: req.body.sessionName

      })

      newWorkoutSession.save();

      var refreshedToken = refreshToken(res, jwtToken);
      return res.status(200).json({error: error, sessionId: newWorkoutSession._id, jwtToken: refreshedToken});
    }   
  });
  }
  catch (e) 
  {
    console.log(e.message);
  }
});

//updateSession API
app.post('/api/updateSession', async (req, res, next) => {

  //Incoming: userID, sessionId, newName, jwtToken
  //Outgoing: error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';

  checkTokenStatus(res, jwtToken);

  try
  {
  userSession.updateMany({
    userID: ObjectId(req.body.userID),
    _id: ObjectId(req.body.sessionId)
  }, {
    sessionName: req.body.newName
  }).then((result) => {
  });
  }
  catch (e) 
  {
    error = e.toString();
  }

  var refreshedToken = refreshToken(res, jwtToken);
  return res.status(200).json({error: error, jwtToken: refreshedToken});
});

//displaySessions API
app.post('/api/displaySessions', async (req, res, next) => {

  //Incoming: userID, jwtToken
  //Outgoing: sessions[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var ret = [];
  var error = "";

  checkTokenStatus(res, jwtToken);

  try
  {
  userSession.find({
    userID: ObjectId(req.body.userID),
    sessionCompleted: true
  }).then((results) => {

    if (!results.length) {
      return res.status(404).json({
        error: "No sessions found for this user."
      });

    } else {
      for( var i=0; i<results.length; i++ )
      {
        if (ret.includes(results[i])) {
          continue;
        }
        ret.push( results[i] );
      }

      var refreshedToken = refreshToken(res, jwtToken);
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

  //Incoming: userID, sessionId, jwtToken
  //Outgoing: error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = "";

  checkTokenStatus(res, jwtToken);

  try
  {
  userSession.deleteOne({
    userID: ObjectId(req.body.userID),
    _id: ObjectId(req.body.sessionId)
  }).then((result) => {
  });
  }
  catch (e)
  {
    console.log(e.message);
  }

  var refreshedToken = refreshToken(res, jwtToken);
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

  checkTokenStatus(res, jwtToken);

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

      var refreshedToken = refreshToken(res, jwtToken);
      return res.status(200).json({results: ret, error: error, jwtToken: refreshedToken});
    }
  });
});

//updateWorkout API
app.post('/api/updateWorkout', async (req, res, next) => {

  //Incoming: workoutId, reps, weight, time, distance, sets, jwtToken
  //Outgoing: error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  checkTokenStatus(res, jwtToken);

  try
  {
    userSession.updateOne({
      'workouts._id': ObjectId(req.body.workoutId)
    },
    {
      '$set': {
      'workouts.$.weight': req.body.weight,
      'workouts.$.reps': req.body.reps,
      'workouts.$.time': req.body.time,
      'workouts.$.distance': req.body.distance,
      'workouts.$.sets': req.body.sets,
      }
      }).then((result) => {
      });
  }
  catch (e)
  {
    console.log(e.message);
  }

  var refreshedToken = refreshToken(res, jwtToken);
  return res.status(200).json({error: error, jwtToken: refreshedToken});
});

//addWorkout API
app.post('/api/addWorkout', async (req, res, next) => {

  //Incoming: userID, sessionId, workoutName, jwtToken
  //Outgoing: error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = "";

  checkTokenStatus(res, jwtToken);

  try {
  userSession.findOne({
    userID: ObjectId(req.body.userID),
    sessionId: req.body.sessionId,
  }).then((session) => {

    if (!session) {
      return res.status(404).json({
        error: "Session doesn't exist."
      });
    }

    var foundWorkout = null;

    // Search through existing workouts (not user-defined)
    workoutFormat.findOne({

      name: req.body.workoutName

    }).then((globalWorkout) => {

      if (!globalWorkout) {

        // If no workout is found by name, search through user's custom workouts
        foundWorkout = User.findOne({

          userID: ObjectId(req.body.userID),

          // name is a field without workouts array
          "workoutName": req.body.workoutName

        }).then((userWorkout) => {

          // Cannot find in global or user's workouts
          if (!userWorkout) {
            console.log("Did not find workout");

          // Workout was found in user's database
          } else {
            console.log("Found workout in user!");
          }
        });

      } else {

        // Workout was found in the global database
        foundWorkout = globalWorkout;
      }

      userSession.updateOne({
        _id: ObjectId(req.body.sessionId)
      },
      {
        $push: {
        workouts: {
        name: foundWorkout.name,
        weight: foundWorkout.hasWeight ? 0 : -1,
        reps: foundWorkout.hasReps ? 0 : -1,
        sets: 0,
        time: foundWorkout.hasTime ? 0 : -1,
        distance: foundWorkout.hasDistance ? 0 : -1
        }
        }
        }).then((result) => {
        });
    });

    var refreshedToken = refreshToken(res, jwtToken);
    return res.status(200).json({jwtToken: refreshedToken});
  });
  } catch (e) {
    console.log(e.message);
  }
});

//displaySessionWorkouts API
app.post('/api/displaySessionWorkouts', async (req, res, next) => {

  //Incoming: sessionId, jwtToken
  //Outgoing: workouts[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = "";
  var ret = [];

  checkTokenStatus(res, jwtToken);

  userSession.findOne({
    _id: ObjectId(req.body.sessionId)
  }).then((session) => {

    if (!session) {
      return res.status(404).json({
        error: "No sessions matched the description. Please try again."
      });

    } else {

      ret = session.workouts

      var refreshedToken = refreshToken(res, jwtToken);
      return res.status(200).json({workouts: ret, error: error, jwtToken: refreshedToken});
    }
  });
});

//deleteWorkout API
app.post('/api/deleteWorkout', async (req, res, next) => {

  //Incoming: workoutId, sessionId, jwtToken
  //Outgoing: error

  const jwtToken = req.body.jwtToken;
  var error = "";

  checkTokenStatus(res, jwtToken);

  try
  {
  userSession.findOneAndUpdate({
    _id: ObjectId(req.body.sessionId)
  }, {
    $pull: {
      workouts: {
        _id: ObjectId(req.body.workoutId)
      }
    }
  }).then((workout) => {
  });
  }
  catch (e)
  {
    console.log(e.message);
  }

  var refreshedToken = refreshToken(res, jwtToken);
  return res.status(200).json({error: error, jwtToken: refreshedToken});
});

//displayAllWorkouts API
app.post('/api/displayAllWorkouts', async (req, res, next) => {

  //Incoming: jwtToken
  //Outgoing: results[], error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';
  var ret = [];

  checkTokenStatus(res, jwtToken);

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

      var refreshedToken = refreshToken(res, jwtToken);
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

  checkTokenStatus(res, jwtToken);

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

      var refreshedToken = refreshToken(res, jwtToken);
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

  checkTokenStatus(res, jwtToken);

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

      var refreshedToken = refreshToken(res, jwtToken);
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

  checkTokenStatus(res, jwtToken);

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

      var refreshedToken = refreshToken(res, jwtToken);
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

  checkTokenStatus(res, jwtToken);

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

      var refreshedToken = refreshToken(res, jwtToken);
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

  checkTokenStatus(res, jwtToken);

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

      var refreshedToken = refreshToken(res, jwtToken);
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

  checkTokenStatus(res, jwtToken);

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

      var refreshedToken = refreshToken(res, jwtToken);
      return res.status(200).json({results: ret, error: error, jwtToken: refreshedToken});
    }
  });
});

//finishWorkout API
//If session is completed, also updates session
//Also updates userStats
app.post('/api/finishWorkout', async (req, res, next) => {

  //Incoming: sessionId, workoutId, weight, reps, sets, time, distance, jwtToken
  //Outgoing: sessionCompleted, error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';

  checkTokenStatus(res, jwtToken);

  try
  {
  userSession.findOneAndUpdate({
    'workouts._id': ObjectId(req.body.workoutId)
  }, {
    'workouts.$.isCompleted': true
  }, {
    new: true}).then((result) => {

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
    _id: ObjectId(req.body.sessionId),
    'workouts.isCompleted': false
    }).then((results) => {

      var sessionCompleted = false
      if(!results.length)
      {
        sessionCompleted = true
        userSession.findOneAndUpdate({
          _id: req.body.sessionId
        }, 
        [
          { 
            '$set':
            {
              'completedAt': '$updatedAt',
              'sessionCompleted': true
            }
          }
        ]).then((result) => {
        });
      }

      var refreshedToken = refreshToken(res, jwtToken);
      return res.status(200).json({sessionCompleted: sessionCompleted, error: error, jwtToken: refreshedToken});
    });
  });
  }
  catch (e)
  {
    console.log(e.message);
  }
});

//finishSession API
app.post('/api/finishSession', async (req, res, next) => {

  //Incoming: sessionId, jwtToken
  //Outgoing: error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';

  checkTokenStatus(res, jwtToken);

  try
  {
  userSession.findOneAndUpdate({
    _id: ObjectId(req.body.sessionId)
  },[
    { 
      '$set':
      {
        'completedAt': '$updatedAt',
        'sessionCompleted': true
      }
    }
  ]).then((result) => {

    if (!result) {
      return res.status(404).json({
        error: "Session not found."
      });
    } 

    var refreshedToken = refreshToken(res, jwtToken);
    return res.status(200).json({error: error, jwtToken: refreshedToken});

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
  userSession.find({
    userID: ObjectId(req.body.userID),
    sessionCompleted: true
  }).then((sessions) => {

    if (!sessions.length) {
      return res.status(404).json({
        error: "No user history found for this user."
      });

    } else {
      for( var i=0; i<sessions.length; i++ )
      {
        ret.push( sessions[i] );
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
	checkTokenStatus(res, jwtToken);

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
			var refreshedToken = refreshToken(res, jwtToken);

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

// getAllWorkoutDetails API
app.post('/api/getAllWorkoutDetails', async (req, res, next) => {

  //Incoming: sessionID, jwtToken
  //Outgoing: session, error, jwtToken

  const jwtToken = req.body.jwtToken;
  var error = '';

  checkTokenStatus(res, jwtToken);

  try
  {
    userSession.find({
      _id: ObjectId(req.body.sessionID)

    }).then((results) => {

      if (!results) {

        return res.status(404).json({
          "error": "No results found by session ID"
        });
      }

      var refreshedToken = refreshToken(res, jwtToken);

      console.log(results);

      return res.status(200).json({session: results, error: error, jwtToken: refreshedToken});
    });
  }
  catch (e)
  {
    console.log(e.message);
  }
});

function checkTokenStatus(res, jwtToken) {

  try {

		if(token.isExpired(jwtToken)) {
			var r = {error: "The JWT is no longer valid", jwtToken: ""};
			res.status(420).json(r);
			return;
		}

	} catch(error) {
		console.log(error.message);
		return res.status(420).json({error: error.message});
	}
}

function refreshToken(res, jwtToken) {

  // Creates a new JWT token
  var refreshedToken = null;

  try {
    // Gets a refreshed JWT token
    refreshedToken = token.refresh(jwtToken);
    
  } catch(error) {
    console.log(error.message);
    return res.status(420).json({error: error.message});
  }

  return refreshedToken;
}

// CLOUDINARY API
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
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
