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

    isVerified: {
        type: Boolean,
        default: false,
        required: true,
    }
    
}, {timestamps: true}, {collection: 'users'});

const User = mongoose.model('users', newUser);
module.exports = User;