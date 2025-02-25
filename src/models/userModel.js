const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: [true, 'user id is required'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'A user must have a full name.'],
        trim: true,
    },
    email: {
        type: String,
        required: [
            true,
            'A user must have an email address.',
        ],
        unique: true,
        lowercase: true,
        validate: [
            validator.isEmail,
            'Please provide a valid email address.',
        ],
    },
    userRole: {
        type: String,
        required: [true, 'User role is required.'],
        enum: ['admin', 'sales', 'super admin'], // Allowed roles
        default: 'admin', // Default role
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required!'],
        validate: {
            validator: function (v) {
                return /^[0-9]{10,15}$/.test(v); // Basic validation for phone number
            },
            message: 'Please provide a valid phone number!',
        },
    },
    password: {
        type: String,
        minlength: [
            8,
            'Password must be at least 8 characters long.',
        ],
        select: false, // Do not return the password field by default in queries
    },
    passwordConfirm: {
        type: String,
        validate: {
            validator: function (el) {
                return el === this.password; // Only run this validation when password is provided
            },
            message: 'Passwords do not match!',
        },
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set creation date
    },
    passwordResetCode: {
        type: String, // The verification code sent to the user via email
        select: false, // Do not return in queries
    },
    passwordResetCodeExpires: {
        type: Date, // Expiry date for the password reset code
        select: false, // Do not return in queries
    },
    isPasswordSet: {
        type: Boolean,
        default: false, // Initially false until the user sets their password
    },
});

// Middleware to hash password before saving to the database
userSchema.pre('save', async function (next) {
    // If the password field hasn't been modified, skip this middleware
    if (!this.isModified('password')) return next();

    // Hash the password with a salt of 12 rounds
    this.password = await bcrypt.hash(this.password, 12);

    // Remove passwordConfirm field after hashing (not stored in DB)
    this.passwordConfirm = undefined;

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
