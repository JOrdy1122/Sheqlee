const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Hero title is required'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        animation: {
            type: String, // URL or file path for animation JSON
            required: [true, 'Animation URL is required'],
        },
        createdAt: {
            type: Date,
            default: Date.now, // Auto-set timestamp for record creation
        },
        updatedAt: {
            type: Date,
            default: Date.now, // Auto-set timestamp for record update
        },
    },
    { timestamps: true }
); // Automatically adds `createdAt` and `updatedAt`

module.exports = mongoose.model('Hero', heroSchema);
