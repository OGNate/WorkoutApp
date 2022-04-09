const { Double } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userStats = new Schema({

    userID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },

    totalWeight: {
        type: Number,
        default: 0,
        required: true
    },

    totalReps: {
        type: Number,
        default: 0,
        required: true
    },

    totalSets: {
        type: Number,
        default: 0,
        required: true
    },

    totalDistance: {
        type: Number,
        default: 0,
        required: true,
    },

    totalTime: {
        type: Number,
        default: 0,
        required: true,
    }

}, {timestamps: true}, {collection: "userStats"});

const _userStats = mongoose.model("userStats", userStats);
module.exports = _userStats;
