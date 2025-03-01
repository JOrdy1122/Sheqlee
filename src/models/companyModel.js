const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const companySchema = new mongoose.Schema({
    company_id: {
        type: String,
        required: true,
        unique: true,
    },
    companyName: {
        type: String,
        required: function () {
            return !this.isOAuth; // ❌ Required ONLY for non-OAuth users
        },
        trim: true,
    },
    domain: {
        type: String,
        required: function () {
            return !this.isOAuth;
        },
        trim: true,
    },
    fullName: {
        type: String,
        required: function () {
            return !this.isOAuth;
        },
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        select: false,
        required: function () {
            return !this.isOAuth;
        },
        minlength: [
            6,
            'Password must be at least 6 characters',
        ],
    },
    passwordConfirm: {
        type: String,
        required: function () {
            return !this.isOAuth;
        },
        validate: {
            validator: function (el) {
                return this.isOAuth || el === this.password; // Skip check if OAuth
            },
            message: 'Passwords do not match!',
        },
    },
    isOAuth: {
        type: Boolean,
        default: false, // ✅ Indicates if the user signed up with Google OAuth
    },
    logo: {
        type: String,
        trim: true,
    },
    subscribers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Freelancer',
            default: 0,
        },
    ],
    status: {
        type: String,
        required: function () {
            return !this.isOAuth;
        },
        enum: ['active', 'inactive','pending'],
        default: 'active',
    },
    description: {
        type: String,
        required: function () {
            return !this.isOAuth && this.isUpdating;
        },
        trim: true,
    },
    companySize: {
        type: String,
        required: function () {
            return !this.isOAuth && this.isUpdating;
        },
        trim: true,
    },
    hqLocation: {
        type: String,
        required: function () {
            return !this.isOAuth && this.isUpdating;
        },
        trim: true,
    },
    registeredAt: {
        type: Date,
        default: Date.now,
    },
});

// Automatically Detect Updates
companySchema.pre('save', function (next) {
    this.isUpdating = !this.isNew;
    next();
});

// Hash password if it's not OAuth
companySchema.pre('save', async function (next) {
    if (!this.isOAuth && this.isModified('password')) {
        this.password = await bcrypt.hash(
            this.password,
            12
        );
        this.passwordConfirm = undefined;
    }
    next();
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
