const mongoose = require('mongoose');

const goalSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    text: {
        type: String,
        required: [true, "please fill out!"]
    }
},
    {
        timestamps: true,
    });

module.exports = mongoose.model("Goal", goalSchema);