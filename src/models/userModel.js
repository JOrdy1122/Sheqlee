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
        enum: ['admin', 'sales', 'super admin'], 
        default: 'admin', // Default role
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required!'],
        validate: {
            validator: function (v) {
                return /^[0-9]{10,15}$/.test(v); 
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
        select: false, 
    },
    passwordConfirm: {
        type: String,
        validate: {
            validator: function (el) {
                return el === this.password;
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
        default: Date.now, 
    },
    passwordResetCode: {
        type: String, 
        select: false, 
    },
    passwordResetCodeExpires: {
        type: Date, 
        select: false, 
    },
    isPasswordSet: {
        type: Boolean,
        default: false, 
    },
});

// Middleware to hash password before saving to the database
userSchema.pre('save', async function (next) {
    
    if (!this.isModified('password')) return next();

    // Hash the password with a salt of 12 rounds
    this.password = await bcrypt.hash(this.password, 12);

    // Remove passwordConfirm field after hashing (not stored in DB)
    this.passwordConfirm = undefined;

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
