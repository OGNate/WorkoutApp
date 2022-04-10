const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    userID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },

    token: {
        type: String,
        required: true,
    }
}, {timestamps: true}, {collection: "emailTokens"});

const _tokenSchema = mongoose.model("emailTokens", tokenSchema);
module.exports = _tokenSchema;