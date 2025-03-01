const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true, 
        },
        content: {
            type: String,
            required: true, 
        },
        iteration: {
            type: String,
            required: true,
            trim: true, // E.g., "1st", "2nd", "3rd"
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true,
        },
        updatedOn: {
            type: Date,
            default: Date.now, 
        },
    },
);

module.exports = mongoose.model('Page', pageSchema);
