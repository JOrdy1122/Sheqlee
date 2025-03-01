const mongoose = require('mongoose');

const deletionRequestSchema = new mongoose.Schema({
    account_Id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'role', 
    },
    role: {
        type: String,
        required: true,
        enum: ['Freelancer', 'Company'], 
    },
    reason: {
        type: String,
        required: true,
        maxlength: 128, 
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
