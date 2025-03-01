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
        enum: ['Freelancer', 'Company', 'User'], 
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'modelName', 
    },
    modelName: {
        type: String,
        required: true,
        enum: ['Freelancer', 'Company', 'User'], 
    },
});

//  Fix: Map `role` to the correct Mongoose model names
const roleModelMap = {
    Freelancer: 'Freelancer',
    Company: 'Company',
    User: 'User',
};

//  Auto-populate the referenced user 
userIndexSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'userId',
        model: roleModelMap[this.role], 
    });
    next();
});

//  Ensure virtuals are included in responses
userIndexSchema.set('toObject', { virtuals: true });
userIndexSchema.set('toJSON', { virtuals: true });

const UserIndex = mongoose.model(
    'UserIndex',
    userIndexSchema
);
module.exports = UserIndex;
