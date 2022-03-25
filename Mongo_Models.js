const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Creates a schematic for a new user being entered into the database
const newUser = new Schema({
    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    /*
    userID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    */

    email: {
        type: String,
        required: true
    },  
}, {timestamps: true}, {collection: 'users'});


// Used in the workoutMetrics to hold the entire workouts schema
const workoutExcercises = new Schema({
    benchpress: {
        max: Number,
        presses: [Number]
    },

    deadlift: {
        max: Number,
        presses: [Number]
    },

    Squat: {
        max: Number,
        presses: [Number]
    }
});

// Creates the workoutmetrics schema for mongodb
const workoutMetric = new Schema({

    // Keeps track of whos workoutmetrics this is
    userID: {
        type: String,
        required: true
    },

    gender: {
        type: Number, // 1 for Male, 0 for Female
        required: false
    },

    weight: {
        type: Number, 
        required: false
    },  

    workouts: workoutExcercises,    // See workoutExcercises above for schema
    caloriesBurned: Number
}, {timestamps: true}, {collection: 'workoutmetrics'});

// Creates models for both schemas
const User = mongoose.model('users', newUser);
const workoutMets = mongoose.model('workoutmetrics', workoutMetric);

// Exports both modules
module.exports = {User, workoutMets};

