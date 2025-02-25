const mongoose = require('mongoose');
const validator = require('validator');

const feedbackSchema = new mongoose.Schema({
    feedback_id: {
        type: String,
        required: [
            true,
            'A custom feedback_id is required!',
        ],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required for feedback'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'A user must have an email!'],
        unique: true,
        lowercase: true,
        validate: [
            validator.isEmail,
            'Please provide a valid email address!',
        ],
    },
    message: {
        type: String,
        required: [
            true,
            'A message is required for giving feedback!',
        ],
        maxlength: [
            512,
            'Message must be atleast less or equal to 512 characters!',
        ],
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Feedback = new mongoose.model(
    'Feedback',
    feedbackSchema
);

module.exports;
