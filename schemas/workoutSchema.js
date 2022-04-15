const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workoutsFormat = new Schema({

    workoutID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },

    name: {
        type: String,
        required: false,
    },

    bodyPart: {
        type: [String],
        required: false,
    },

    equipment: {
        type: [String],
        required: false,
    },
    
    workoutType: {
        type: String,
        required: false
    },

    hasReps: {
        type: Boolean,
        default: false
    },

    hasWeight: {
        type: Boolean,
        default: false
    },
    
    hasTime: {
        type: Boolean,
        default: false
    },

    hasDistance: {
        type: Boolean,
        default: false
    },


}, {timestamps: true}, {collection: "workoutFormats"});

const workoutFormat = mongoose.model("workoutFormats", workoutsFormat);
module.exports = workoutFormat;
