const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Define the Freelancer Schema
const freeLancerSchema = new mongoose.Schema({
    freelancer_id: {
        type: String,
        required: [
            true,
            'A custom freelancer_id is required!',
        ],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'A user must have an email!'],
        unique: true,
        lowercase: true,
        validate: [
            validator.isEmail,
            'Please provide a valid email address!',
        ],
    },
    password: {
        type: String,
        minlength: [
            8,
            'Password must be at least 8 characters',
        ],
        required: function () {
            return !this.isOAuth; // Required only if NOT OAuth user
        },
        select: false, // Hide password in queries
    },
    passwordConfirm: {
        type: String,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords do not match!',
        },
        required: function () {
            return !this.isOAuth; // Required only if NOT OAuth user
        },
    },

    title: {
        type: String,
        required: function () {
            return this.isUpdating ? true : false;
        },
    },
    image: {
        type: String, 
        trim: true,
    },
    skill: {
        name: {
            type: String,
            required: function () {
                return this.isUpdating ? true : false;
            },
            trim: true,
        },
        level: {
            type: String,
            enum: [
                'intern',
                'junior',
                'intermediate',
                'senior',
                'expert',
            ],
        },
    },
    profileLinks: {
        type: Map,
        of: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || validator.isURL(v);
                },
                message: 'Please provide a valid URL!',
            },
        },
    },
    selfIntro: {
        type: String,
        trim: true,
    },
    cvFile: {
        type: String, 
        trim: true,
    },
    subscribedCompanies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            default: [],
        },
    ],
    subscribedCategories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: [],
        }, // References Category IDs
    ],
    subscribedTags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag',
            default: [],
        }, // References Tag IDs
    ],
    appliedJobs: {
        type: [mongoose.Schema.Types.ObjectId], // Reference to the Job model
        ref: 'Job',
        default: [], // Default to an empty array
    },
    favorites: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Job',
        default: [],
    },
    status: {
        type: String,
        enum: ['active', 'deleted', 'pending'],
        default: 'active',
    },
    action: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    isOAuth: {
        type: Boolean,
        default: false, // Defaults to false for email/password users
    },

    passwordResetCode: {
        type: String, // The verification code sent to the user via email
        select: false, // Do not return in queries
    },
    passwordResetCodeExpires: {
        type: Date, // Expiry date for the password reset code
        select: false, // Do not return in queries
    },
    registeredAt: {
        type: Date,
        default: Date.now, // Automatically set to current date
    },
});

freeLancerSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isOAuth)
        return next(); 
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

// Pre-save Middleware to Set `isUpdating` Automatically
freeLancerSchema.pre('save', function (next) {
    this.isUpdating = !this.isNew; 
    next();
});

freeLancerSchema.methods.createPasswordResetCode =
    function () {
        const resetCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString(); 

        this.passwordResetCode = crypto
            .createHash('sha256')
            .update(resetCode)
            .digest('hex'); 

        this.passwordResetCodeExpires =
            Date.now() + 10 * 60 * 1000; // Expires in 10 min

        return resetCode; // Send plain code to freelancer
    };

// Create the Freelancer Model
const FreeLancer = mongoose.model(
    'Freelancer',
    freeLancerSchema
);

module.exports = FreeLancer;
