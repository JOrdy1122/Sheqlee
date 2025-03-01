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
            type: String, 
            required: [true, 'Animation URL is required'],
        },
        createdAt: {
            type: Date,
            default: Date.now, 
        },
        updatedAt: {
            type: Date,
            default: Date.now, 
        },
    },

); 
module.exports = mongoose.model('Hero', heroSchema);
