const mongoose = require('mongoose');

// Job Schema
const jobSchema = new mongoose.Schema({
    job_id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Job category is required'],
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', 
        required: [true, 'Job company is required'] 
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
        ], 
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
        ], 
    },
    salary: {
        amount: {
            type: Number,
            required: [true, 'Salary amount is required'],
            validate: {
                validator: function (v) {
                    return v >= 0; 
                },
                message:
                    'Salary must be greater than or equal to 0',
            },
        },
        currency: {
            type: String,
            required: [true, 'Currency is required'],
            enum: ['USD', 'Birr', 'EUR', 'GBP','$','€','£','Br'], 
        },
        rate: {
            type: String,
            required: [true, 'Salary rate is required'],
            enum: ['hr', 'wk', 'mo'], 
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
         type: [mongoose.Schema.Types.ObjectId],
        ref: 'Tag',
    },
    applyLink: {
        type: String,
        required: [true, 'Apply link is required'],
        validate: {
            validator: function (v) {
                return /^(https?:\/\/|mailto:)/.test(v); 
            },
            message:
                'Please provide a valid URL or email for the apply link',
        },
    },
    hideCompanyName: {
        type: Boolean,
        default: false, 
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
        default: Date.now, 
    },
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
