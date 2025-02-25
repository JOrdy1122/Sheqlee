const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category_id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: [true, 'Category title is required'],
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [
            500,
            'Description must not exceed 500 characters',
        ],
    },
    icon: {
        type: String, // URL of the uploaded image
        required: [true, 'Category icon is required'],
        validate: {
            validator: function (v) {
                return /^(https?:\/\/.*|\.\/.*|\.{2}\/.*)\.(jpeg|jpg|png|gif|webp|svg)$/.test(
                    v
                );
            },
            message:
                'Please provide a valid image URL (jpeg, jpg, png, svg, gif, or webp)',
        },
    },
    tags: {
        type: [mongoose.Schema.Types.ObjectId], // Reference to the Job model
        ref: 'Tag',
        default: [], // Default to an empty array
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
    },
    action: {
        type: String,
        enum: ['active', 'inactive'],
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
categorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// categorySchema.pre('save', async function (next) {
//     const doc = this;
//     if (!doc.isNew) return next(); // Skip if it's not a new document

//     try {
//         const counter = await Counter.findByIdAndUpdate(
//             { _id: 'jobId' }, // Counter name
//             { $inc: { seq: 1 } }, // Increment sequence
//             { new: true, upsert: true } // Create if not exists
//         );

//         doc._id = `JID${String(counter.seq).padStart(4, '0')}`; // Format as JID0001
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
