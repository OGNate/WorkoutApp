const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSessions = new Schema({

    // The user that started the workout
    userID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },

    sessionName: {
        type: String,
            minlength: 3,
            maxlength: 50,
            required: true,
            trim: true
    },

    workouts: [{
            
        name: {
            type: String
        },

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
    
        distance: {
            type: Number,
            default: -1
        },

        isCompleted: {
            type: Boolean,
            default: false,
            required: true
        }
    }],

    completedAt: {
        type: Date
    },

    sessionCompleted: {
        type: Boolean,
        default: false
    }

}, {timestamps: true}, {collection: "userSessions"});

const userSession = mongoose.model("userSessions", userSessions);
module.exports = userSession;
