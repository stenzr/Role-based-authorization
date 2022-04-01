//require neccessary modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define the schema for user
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'normalUser',
        enum: ["normalUser", "adminUser", "subsUser"]
    },
    accessToken: {
        type: String
    }
});

// define a mongoose model with the schema
const User = mongoose.model('user', UserSchema);
module.exports = User;
