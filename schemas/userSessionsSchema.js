const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSessions = new Schema({

    // The user that started the workout
    userID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },

    session: {

        // The name of the session (users can change)
        name: {
            type: String,
            minlength: 3,
            maxlength: 20,
            required: true,
            trim: true,
        },

        workouts : [{
            
            name: {
                type: String,
                required: true
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
            }
        }]
    },

    completedAt: {
        type: Date
    }

}, {timestamps: true}, {collection: "userSessions"});

const userSession = mongoose.model("userSessions", userSessions);
module.exports = userSession;
