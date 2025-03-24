const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    noOfDownloadedPdf: {
        type: Number,
        default: 0
    },
    premium: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // This will add createdAt and updatedAt fields automatically
});

const EzUser = mongoose.model('EzUser', userSchema);

module.exports = EzUser; 