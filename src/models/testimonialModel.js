const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
    {
        logo: {
            type: String,
            required: [true, 'Logo is required'], 
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
            required: [true, 'Position is required'], 
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

module.exports = mongoose.model(
    'Testimonial',
    testimonialSchema
);
