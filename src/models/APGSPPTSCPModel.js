const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true, // Titles like "About", "Pricing","privacy" etc., should be unique
        },
        content: {
            type: String,
            required: true, // The formatted text for the page
        },
        iteration: {
            type: String,
            required: true,
            trim: true, // E.g., "1st", "2nd", "3rd"
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true,
        },
        updatedOn: {
            type: Date,
            default: Date.now, // Auto-update to the current date on each save
        },
    },
    {
        timestamps: true, // Automatically include createdAt and updatedAt fields
    }
);

module.exports = mongoose.model('Page', pageSchema);
