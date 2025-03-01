const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    tag_id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: [true, 'Tag title is required'],
        trim: true,
        unique: true, 
    },

    icon: {
        type: String,
        required: [true, ' A tag has to include icon.'],
    },
    description: {
        type: String,
        required: [
            true,
            'A tag has to include brief descption.',
        ],
        maxlength: [
            128,
            'A maximum length of brief discription is 128 characters.',
        ],
        minlength: [
            10,
            'A minmimum length of brief discription is 10 characters',
        ],
    },
    categories: {
        type: [mongoose.Schema.Types.ObjectId], // Reference to the Job model
        ref: 'Category',
        default: [],
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
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to update the `updatedAt` field automatically
tagSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
