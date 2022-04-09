const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userWorkoutHistory = new Schema({

    userID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },

    sessionName: {
        type: String,
        required: true
    },

    workoutName: {
        type: String,
        required: true,
    },

    weight: {
        type: Number,
        default: 0,
        required: false
    },

    reps: {
        type: Number,
        default: 0,
        required: false,
    },

    sets: {
        type: Number,
        default: 0,
        required: false,
    },

    distance: {
        type: Number,
        default: 0,
        required: false,
    },

    time: {
        type: Number,
        default: 0,
        required: false
    },

    completedAt: {
        type: Date,
        immutable: false,
        default: () => Date.now(),
        required: false,
    }

}, {timestamps: true}, {collection: "userHistory"});

const _userHistory = mongoose.model("userHistory", userWorkoutHistory);
module.exports = _userHistory;