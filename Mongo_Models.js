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

    email: {
        type: String,
        required: true
    },  

    isVerified: Boolean
    
}, {timestamps: true}, {collection: 'users'});

// Contains the schema for the current workouts in the applications program.
const WorkoutExcercises = new Schema({
    
    benchpress: {
        hasData: {
            type: Boolean,
            default: false
        },

        currentWeight: {
            type: Number,
            min: 0,
            default: 0
        },

        currentReps: {
            type: Number,
            min: 0,
            default: 0
        },

        currentSets: {
            type: Number,
            min: 0,
            default: 0
        },

        currentDuration: {
            type: Number,
            min: 0,
            default: 0
        }
    },

    deadlift: {
        hasData: {
            type: Boolean,
            default: false
        },

        currentWeight: {
            type: Number,
            min: 0,
            default: 0
        },

        currentReps: {
            type: Number,
            min: 0,
            default: 0
        },

        currentSets: {
            type: Number,
            min: 0,
            default: 0
        },

        currentDuration: {
            type: Number,
            min: 0,
            default: 0
        }
    },

    squat: {
        hasData: {
            type: Boolean,
            default: false
        },

        currentWeight: {
            type: Number,
            min: 0,
            default: 0
        },

        currentReps: {
            type: Number,
            min: 0,
            default: 0
        },

        currentSets: {
            type: Number,
            min: 0,
            default: 0
        },

        currentDuration: {
            type: Number,
            min: 0,
            default: 0
        }
    }
});

// Creates the workoutmetrics schema for mongodb
const WorkoutData = new Schema({

    // Keeps track of whos workoutmetrics this is
    userID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },

    workouts: WorkoutExcercises,    // See workoutExcercises above for schema

}, {timestamps: true}, {collection: 'workoutmetrics'});

// Creates models for both schemas
const User = mongoose.model('users', newUser);
const workoutMets = mongoose.model('workoutmetrics', WorkoutData);

// Exports both modules
module.exports = {User, workoutMets};

