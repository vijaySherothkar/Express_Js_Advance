const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "please fill out name!"]
        },
        email: {
            type: String,
            required: [true, "please fill out email!"],
            unique: true
        },
        phoneNumber: {
            type: Number,
            required: [true, "please fill out Phone no!"]
        },
        password: {
            type: String,
            required: [true, "please fill out password!"]
        },
        userType: {
            type: String,
            required: [true, "user type was empty"]
        },
        verificationCode: {
            type: Number,
        },
        verificationCodeExpiry: {
            type: Number
        },
        isVerified: { type: Boolean, default: false }, // Add this field to track the verification status
        profileImage: { type: String, default: null },
    },
    {
        timestamps: true,
    });

module.exports = mongoose.model("User", userSchema);