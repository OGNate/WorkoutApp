const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Creates a schematic for a new user being entered into the database
const newUser = new Schema({

    username: {
        type: String,
        minlength: 3,
        maxlength: 20,
        required: true,
        trim: true,
    },

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

    goal: {
        type: String,
        default: "",
        required: false
    },

    avatar: {
        exists: {
            type: Boolean,
            default: 'false',
        },
        imageLink: {
            type: String,
            trim: true,
            default: 'null',
        },
        imageId: {
            type: String,
            trim: true,
            default: 'null',
        },
    },

    karmaPoints: {
        postKarma: {
          type: Number,
          default: 0,
        },
        commentKarma: {
          type: Number,
          default: 0,
        },
      },
      posts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post',
        },
      ],
      subscribedSubs: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subreddit',
        },
      ],
      totalComments: {
        type: Number,
        default: 0,
    },

    isVerified: {
        type: Boolean,
        default: false,
        required: true,
    }
    
}, {timestamps: true}, {collection: 'users'});

const User = mongoose.model('users', newUser);
module.exports = User;