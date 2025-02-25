const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// // Define the Company Schema
// const companySchema = new mongoose.Schema({
//     company_id: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     companyName: {
//         type: String,
//         required: [true, 'Company name is required'],
//         trim: true,
//     },
//     domain: {
//         type: String,
//         required: [true, 'Domain is required'],
//         trim: true,
//     },
//     fullName: {
//         type: String,
//         required: [true, 'Full name is required'],
//         trim: true,
//     },
//     email: {
//         type: String,
//         required: [true, 'Email is required'],
//         unique: true,
//         lowercase: true,
//         trim: true,
//         validate: {
//             validator: validator.isEmail, // Using the built-in isEmail method
//             message: (props) =>
//                 `${props.value} is not a valid email address!`,
//         },
//     },
//     password: {
//         type: String,
//         required: [true, 'Password is required'],
//         minlength: [
//             6,
//             'Password must be at least 6 characters',
//         ],
//     },
//     passwordConfirm: {
//         type: String,
//         required: [true, 'Please confirm your password!'],
//         validate: {
//             validator: function (el) {
//                 return el === this.password;
//             },
//             message: 'Passwords do not match!',
//         },
//     },
//     logo: {
//         type: String,
//         trim: true,
//     },
//     subscribers: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Freelancer',
//             default: 0,
//         },
//     ],
//     status: {
//         type: String,
//         required: [true, 'Status is required'],
//         enum: ['active', 'inactive'], // Example status options
//         default: 'active',
//     },
//     // Optional Fields (for updates)
//     description: {
//         type: String,
//         required: function () {
//             return this.isUpdating ? true : false; // Required only during updates
//         },
//         trim: true,
//     },
//     companySize: {
//         type: String, // Example: "Small", "Medium", "Large"
//         required: function () {
//             return this.isUpdating ? true : false; // Required only during updates
//         },
//         trim: true,
//     },
//     hqLocation: {
//         type: String,
//         required: function () {
//             return this.isUpdating ? true : false; // Required only during updates
//         },
//         trim: true,
//     },
//     registeredAt: {
//         type: Date,
//         default: Date.now, // Automatically set to current date
//     },
// });

// //Automatically Detect Updates
// companySchema.pre('save', function (next) {
//     this.isUpdating = !this.isNew; // Set isUpdating to true if the document is not new
//     next();
// });

// companySchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next(); // Skip if password is not modified
//     this.password = await bcrypt.hash(this.password, 12);

//     // console.log('Hashed password: ', this.password); // Log hashed password to check

//     this.passwordConfirm = undefined;
//     next();
// });

// // // Middleware to Prevent Modification of `registeredAt`
// // companySchema.pre('save', function (next) {
// //   if (!this.isNew && this.isModified('registeredAt')) {
// //     return next(new Error('The registeredAt field cannot be modified.'));
// //   }
// //   next();
// // });

// // Create the Company Model
// const Company = mongoose.model('Company', companySchema);

// module.exports = Company;

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
        enum: ['active', 'inactive'],
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
