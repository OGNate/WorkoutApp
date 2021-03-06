const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const replySchema = new Schema({

  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },

  replyBody: {
    type: String,
    trim: true,
  },

  upvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
  ],

  downvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
  ],

  pointsCount: {
    type: Number,
    default: 1,
  }
}, {timestamps: true});

const commentSchema = new mongoose.Schema({
  commentedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  commentBody: {
    type: String,
    trim: true,
  },
  replies: [replySchema],
  upvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
  ],
  downvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
  ],
  pointsCount: {
    type: Number,
    default: 1,
  }
}, {timestamps: true});

const postSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },

  textSubmission: {
    type: String,
    trim: true,
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  upvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

  downvotedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

  pointsCount: {
    type: Number,
    default: 1,
  },

  comments: [commentSchema],

  commentCount: {
    type: Number,
    default: 0,
  }
}, {timestamps: true});

module.exports = mongoose.model('posts', postSchema);