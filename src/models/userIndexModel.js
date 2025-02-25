// const mongoose = require('mongoose');

// const userIndexSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     role: {
//         type: String,
//         enum: ['Freelancer', 'Company', 'User'],
//         required: true,
//     },
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         refPath: 'role', // Dynamic reference based on the role field
//     },
// });

// // Virtual for dynamically fetching the related user (Freelancer or Company)
// userIndexSchema.virtual('userDetails', {
//     ref: (doc) => doc.role, // Reference based on role
//     localField: 'userId',
//     foreignField: '_id',
//     justOne: true, // Only one related user per UserIndex
// });

// // Ensure virtuals are included in JSON output
// userIndexSchema.set('toObject', { virtuals: true });
// userIndexSchema.set('toJSON', { virtuals: true });

// const UserIndex = mongoose.model(
//     'UserIndex',
//     userIndexSchema
// );

// module.exports = UserIndex;
const mongoose = require('mongoose');

require('../models/freelancerModel');
require('../models/companyModel');
require('../models/userModel');

const userIndexSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['Freelancer', 'Company', 'User'], // ✅ Ensure correct case
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'modelName', // ✅ New field to store correct model
    },
    modelName: {
        type: String,
        required: true,
        enum: ['Freelancer', 'Company', 'User'], // ✅ Ensure correct case
    },
});

// ✅ Fix: Map `role` to the correct Mongoose model names
const roleModelMap = {
    Freelancer: 'Freelancer',
    Company: 'Company',
    User: 'User',
};

// ✅ Auto-populate the referenced user (Freelancer, Company, or User)
userIndexSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'userId',
        model: roleModelMap[this.role], // Use correct model mapping
    });
    next();
});

// ✅ Ensure virtuals are included in responses
userIndexSchema.set('toObject', { virtuals: true });
userIndexSchema.set('toJSON', { virtuals: true });

const UserIndex = mongoose.model(
    'UserIndex',
    userIndexSchema
);
module.exports = UserIndex;
