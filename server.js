const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Validator = require('validator');
const isEmpty = require('is-empty');

// Imports all the mongoose schemas from the "schemas" folder
const User = require("./schemas/userSchema");
const userSession = require("./schemas/userSessionsSchema");
const workoutFormat = require("./schemas/workoutSchema");


// Planning on getting rid of metrics such as weight, height, and gender right now. 
//const {TESTUser, workoutMets} = require('./Mongo_Models');
//const {User, WorkoutMets} = require('./Mongo_Models');


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


//Register API
app.post('/api/register', (req, res) => {

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
  }
})

// DELETE WHEN DONE
// Shows how to find a user by their object ID
app.post('/api/test', async (req, res, next) => {
  /*
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
	*/

  User.findById({

    _id: ObjectId(req.body._id)

  }).then((user) => {

    if (!user) {

      console.log("User does not exist");

      return res.status(300).json({
        msg: "_id not found"
      });
    }

    workoutMets.findOne({

      userID: ObjectId(req.body._id)

    }).then((workout) => {

      if (workout) {

        console.log("Workouts have already been initialized for this user");
        
        return res.status(300).json({
          msg: "Workouts have already been initialized for this user"
        });
      }

      const newWorkoutData = new workoutMets({

        userID: ObjectId(req.body._id),

        workouts: {
          benchpress: {
            currentWeight: 200
          }
        }
      });

      newWorkoutData.save();
      return res.status(200).json({
        msg: "Works fine"
      });
    });
  });
});

// TESTING ONLY, DELETE WHEN DONE
// Used to insert all our excercises into the database for easy recall later
app.post('/Test', async (req, res, next) => {

	const newWorkout = new workoutFormat({
		excerciseID: req.body.excerciseID,
		name: req.body.name,
		bodyPart: req.body.bodyPart,
		equipment: req.body.equipment,
		workoutType: req.body.workoutType,
		hasReps: req.body.hasReps,
		hasWeight: req.body.hasWeight,
		hasSets: req.body.hasSets,
		hasTime: req.body.hasTime,
		hasDistance: req.body.hasDistance
	});

	newWorkout.save();
	return res.status(200).json({msg: "Successfully added workoutformat to database"});
});


//login API
app.post('/api/login', async (req, res, next) => {

  errors = {};

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
        error: "No account found by email"
      });
    }

    const password = req.body.password;

    bcrypt.compare(password, user.password).then(isMatch => {

      if (isMatch) {

        const payload = {
          id: user.id,
          name: user.name
        };

        return res.status(200).json({
          success: true
        });

      } else {

        return res.status(400).json({
          error: "Invalid password"
        });
      }
    });
  });
});

//addSession API
app.post('/api/addSession', async (req, res, next) => {

  //Incoming: userID, sessionName 
  //Outgoing: error
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
      });

      newWorkoutSession.save();
      return res.status(200).json(newWorkoutSession);
    }
  });
});

//updateSession API
app.post('/api/updateSession', async (req, res, next) => {
  //Incoming: userID, oldName, newName
  //Outgoing: result

  var error = '';
  userSession.updateMany({
    userID: ObjectId(req.body.userID),
    sessionName: req.body.oldName
  }, {
    sessionName: req.body.newName
  }).then((result) => {
    return res.status(200).json(result);
  });
});

//displaySessions API
app.post('/api/displaySessions', async (req, res, next) => {

  //Incoming: userID
  //Outgoing: sessions[], error

  userSession.find({
    userID: ObjectId(req.body.userID),
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No sessions found for this user."
      });

    } else {
      var ret = [];
      for( var i=0; i<results.length; i++ )
      {
        if (ret.includes(results[i].sessionName)) {
          continue;
        }
        ret.push( results[i].sessionName );
      }

      return res.status(200).json({sessions: ret, error: ""});
    }

  });
});

//deleteSession API
app.post('/api/deleteSession', async (req, res, next) => {

  //Incoming: userID, sessionName 
  //Outgoing: error
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

  userSession.deleteMany({
    userID: ObjectId(req.body.userID),
    sessionName: req.body.sessionName
  }).then((result) => {

    return res.status(200).json(result);

  });
});

//searchWorkout API
app.post('/api/searchWorkout', async (req, res, next) => {

  //Incoming: query
  //Outgoing: results[], error

  var error = '';
  var _search = req.body.query.trim();
  workoutFormat.find({
    name: { $regex: _search + '.*', $options: 'r' }
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No workouts matched the description. Please try again."
      });

    } else {
      var ret = [];
      for( var i=0; i<results.length; i++ )
      {
        ret.push( results[i].name );
      }
      return res.status(200).json({results: ret, error: error});
    }

  });
});

//updateWorkout API
app.post('/api/updateWorkout', async (req, res, next) => {
  //Incoming: sessionID, exerciseName, reps, weight, time, distance, sets
  //Outgoing: error

  var error = '';
  userSession.updateOne({
    _id: ObjectId(req.body.sessionID)
  }, {
    exerciseName: req.body.exerciseName,
    reps: req.body.reps,
    weight: req.body.weight,
    time: req.body.time,
    distance: req.body.distance,
    sets: req.body.sets,
  }).then((result) => {
    return res.status(200).json(result);
  });
});

//selectWorkout API
app.post('/api/selectWorkout', async (req, res, next) => {
  //Incoming: exerciseName
  //Outgoing: hasReps, hasWeight, hasTime, hasDistance

  var error = '';
  workoutFormat.findOne({
    name: req.body.exerciseName
  }).then((workout) => {

    if (!workout) {
      return res.status(404).json({
        error: "No workouts matched the description. Please try again."
      });
    }

    else {
      return res.status(200).json({
        hasReps: workout.hasReps,
        hasWeight: workout.hasWeight,
        hasTime: workout.hasTime,
        hasDistance: workout.hasDistance
      });
    }
  });
});

//addWorkout API
app.post('/api/addWorkout', async (req, res, next) => {
  //Incoming: userID, sessionName, exerciseName, reps, weight, time, distance, sets
  //Outgoing: error

  var error = "";

  //const { userId, card, jwtToken } = req.body;

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
        isEmpty: false
      });

      newWorkoutSession.save();
      return res.status(200).json(newWorkoutSession);
    }
  });
});

//displayWorkouts API
app.post('/api/displayWorkouts', async (req, res, next) => {

  //Incoming: userID, sessionName
  //Outgoing: workouts[], error

  userSession.find({
    userID: ObjectId(req.body.userID),
    sessionName: req.body.sessionName
  }).then((results) => {

    if (!results) {
      return res.status(404).json({
        error: "No sessions matched the description. Please try again."
      });

    } else {
      var ret = [];
      for( var i=0; i<results.length; i++ )
      {
        ret.push( results[i] );
      }

      if (ret[0].isEmpty == true) {
        return res.status(200).json({
          error: "The session is empty."
        })
      }

      return res.status(200).json({workouts: ret, error: ""});
    }

  });
});

//deleteWorkout API
app.post('/api/deleteWorkout', async (req, res, next) => {

  //Incoming: sessionID, sessionName, userID
  //Outgoing: error

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

  return res.status(200).json({error: ""});
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
