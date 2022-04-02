const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSessions = new Schema({

    // Takes in the objectID of the user
    userID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },

    // Ties the workouts to a single session using this ID
    sessionID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },

    // The name for the session
    sessionName: {
        type: String,
        required: true,
    },

    excerciseID: Number,

    weight: {
        type: Number,
        default: -1
    },

    reps: {
        type: Number,
        default: -1
    },

    sets: {
        type: Number,
        default: -1
    },

    time: {
        type: Number,
        default: -1
    },

    duration: {
        type: Number,
        default: -1
    },

    isCompleted: {
        type: Boolean,
        default: false
    }

}, {timestamps: true}, {collection: "userSessions"});

const userSession = mongoose.model("userSessions", userSessions);
module.exports = userSession;
