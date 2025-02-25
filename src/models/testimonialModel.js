const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
    {
        logo: {
            type: String,
            required: [true, 'Logo is required'], // URL for the company's logo
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
        },
        testimony: {
            type: String,
            required: [true, 'Testimony is required'],
        },
        companyRep: {
            type: String,
            required: [
                true,
                'Company representative name is required',
            ],
        },
        position: {
            type: String,
            required: [true, 'Position is required'], // Position of the representative
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

module.exports = mongoose.model(
    'Testimonial',
    testimonialSchema
);
