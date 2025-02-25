const mongoose = require('mongoose');

const deletionRequestSchema = new mongoose.Schema({
    account_Id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'role', // Dynamic reference to either Freelancer or Client model
        // not quite clear though so understand this one first
    },
    role: {
        type: String,
        required: true,
        enum: ['Freelancer', 'Company'], // Role of the requester
    },
    reason: {
        type: String,
        required: true,
        maxlength: 128, // Limit the reason length
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    scheduledDeletionDate: {
        type: Date,
        required: true,
    },
});

const DeletionRequest = mongoose.model(
    'DeletionRequest',
    deletionRequestSchema
);

module.exports = DeletionRequest;
