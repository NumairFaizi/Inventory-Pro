const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please enter a Username!"],
        unique: [true, "Username already exists"], // Ensures only one admin with this name
        trim: true
    },
   
    password: {
        type: String,
        required: [true, "Please enter the password."],
    },
}, {
    timestamps: true, // Automatically manages createdAt and updatedAt
});

module.exports = mongoose.model("User", userSchema);