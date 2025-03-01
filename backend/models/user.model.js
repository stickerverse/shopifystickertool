const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // From Firebase Auth
    email: { type: String, required: true, unique: true }, // From Firebase Auth
    // Add any other user-specific data you need (e.g., name, profile picture URL)
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);