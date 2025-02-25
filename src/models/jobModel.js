const mongoose = require('mongoose');

// Job Schema
const jobSchema = new mongoose.Schema({
    job_id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference to the Category model
        required: [true, 'Job category is required'],
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', // Reference to the Company model
        required: true, // Every job must belong to a company
        default: [],
    },
    jobType: {
        type: String,
        required: [true, 'Job type is required'],
        enum: [
            'Contract',
            'Part-time',
            'Full-time',
            'Per diem',
            'Temporary',
        ], // Example values
    },
    skillLevel: {
        type: String,
        required: [true, 'Skill level is required'],
        enum: [
            'Intern',
            'Junior',
            'Intermediate',
            'Senior',
            'Expert',
        ], // Example values
    },
    salary: {
        amount: {
            type: Number,
            required: [true, 'Salary amount is required'],
            validate: {
                validator: function (v) {
                    return v >= 0; // Ensures the salary is not negative
                },
                message:
                    'Salary must be greater than or equal to 0',
            },
        },
        currency: {
            type: String,
            required: [true, 'Currency is required'],
            enum: ['USD', 'Birr', 'EUR', 'GBP'], // Extend as needed
        },
        rate: {
            type: String,
            required: [true, 'Salary rate is required'],
            enum: ['hour', 'day', 'week', 'month', 'year'], // Example values
        },
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        maxlength: [
            128,
            'Short description cannot exceed 128 characters',
        ],
        trim: true,
    },
    requirements: {
        type: String,
        required: [true, 'Requirements are required'],
        trim: true,
    },
    longDescription: {
        type: String,
        trim: true,
    },
    howToApply: {
        type: String,
        trim: true,
    },
    skills: {
        type: [String], // Array of strings for skill names
        required: [true, 'Skills are required'],
        validate: {
            validator: function (v) {
                return v.length > 0; // Ensure at least one skill is provided
            },
            message: 'At least one skill is required',
        },
    },
    applyLink: {
        type: String,
        required: [true, 'Apply link is required'],
        validate: {
            validator: function (v) {
                return /^(https?:\/\/|mailto:)/.test(v); // Ensure it's a URL or email
            },
            message:
                'Please provide a valid URL or email for the apply link',
        },
    },
    hideCompanyName: {
        type: Boolean,
        default: false, // Default is to show the company name
    },
    appliedFreelancers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Freelancer',
        default: [],
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active',
    },
    action: {
        type: String,
        enum: ['active', 'deactivated'],
        default: 'active',
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation date
    },
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
