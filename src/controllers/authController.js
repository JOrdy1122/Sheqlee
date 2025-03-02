const bcrypt = require('bcryptjs');
const Freelancer = require('./../models/freelancerModel');
const Company = require('../models/companyModel');
const Counter = require('../models/counterModel');
const getNextId = require('../utils/getNextId');
const jwt = require('jsonwebtoken');
const UserIndex = require('../models/userIndexModel');
const mongoose = require('mongoose');
const AccountService = require('./../services/accountServices');
const DeletionRequest = require('./../models/deletionRequestModel');
const logger = require('../utils/logger');

exports.requestDeletion = async (req, res) => {
    try {
        const { reason } = req.body;
        const { userId, role } = req.user; // Extract user details from middleware

        if (!reason) {
            return res.status(400).json({
                status: 'fail',
                message: 'Reason for deletion is required!',
            });
        }

        // ✅ Cancel any existing deletion request before submitting a new one
        await AccountService.cancelDeletionRequest(userId);

        // 🔥 Create a new deletion request
        const deletionRequest =
            await AccountService.requestDeletion(
                userId,
                role,
                reason
            );

        res.status(200).json({
            status: 'success',
            message:
                'Deletion request submitted successfully. Your account will be deleted after 30 days unless you log in.',
            data: deletionRequest,
        });
    } catch (err) {
        console.error(
            'Error submitting deletion request:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error submitting deletion request.',
        });
    }
};

exports.handleGoogleCallback = async (req, res) => {
    try {
        console.log('Google OAuth successful!');

        // Determine the role from the request URL
        let role;
        if (
            req.originalUrl.includes(
                '/freelancer/auth/google/callback'
            )
        ) {
            role = 'Freelancer';
        } else if (
            req.originalUrl.includes(
                '/company/auth/google/callback'
            )
        ) {
            role = 'Company';
        } else {
            console.error(
                'Invalid OAuth callback route!'
            );
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid OAuth callback route!',
            });
        }

        // Generate JWT Token with the correct role
        const token = jwt.sign(
            { userId: req.user._id, role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        console.log('JWT Token Generated:', token);

        res.json({
            status: 'success',
            message: 'Google OAuth successful!',
            token,
        });
    } catch (err) {
        console.error(
            'Error handling Google OAuth callback:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Google OAuth failed.',
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Checking email:', email);

        // Step 1: Find the user in the UserIndex
        const userIndex = await UserIndex.findOne({
            email: email.toLowerCase(),
        });

        if (!userIndex) {
            console.log(' No user found in UserIndex!');
            return res.status(404).json({
                status: 'fail',
                message: 'User not found.',
            });
        }
        // Step 2: Determine the correct model name
        const modelName =
            userIndex.role === 'Freelancer'
                ? 'Freelancer'
                : userIndex.role === 'Company'
                  ? 'Company'
                  : userIndex.role === 'User'
                    ? 'User'
                    : null;

        if (!modelName) {
            console.log('Invalid user role!');
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid user role.',
            });
        }

        // Step 3: Populate user details using correct model
        const userDetails = await mongoose
            .model(modelName)
            .findById(userIndex.userId)
            .select('+password'); // Force Mongoose to return the password

        if (!userDetails) {
            console.log(
                'User details missing in database!'
            );
            return res.status(404).json({
                status: 'fail',
                message: 'User details not found.',
            });
        }
        // Step 4: Check if action is inactive → Block login
        if (userDetails.action === 'inactive') {
            console.log(
                'Login blocked: Freelancer is inactive!'
            );
            return res.status(403).json({
                status: 'fail',
                message:
                    'Your account is inactive. Contact support for assistance.',
            });
        }
        // Check for pending deletion request
        const deletionRequest =
            await DeletionRequest.findOne({
                account_Id: userDetails._id,
            });
        if (deletionRequest) {
            await DeletionRequest.deleteOne({
                account_Id: userDetails._id,
            }); // Cancel deletion
            user.status = 'active'; // Restore status
            await userDetails.save();
        }

        // Step 4: Validate the password
        console.log('Checking password...');
        const isPasswordCorrect = await bcrypt.compare(
            password,
            userDetails.password
        );

        if (!isPasswordCorrect) {
            console.log(' Incorrect password attempt!');
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect password.',
            });
        }

        // Step 5: Generate JWT token
        console.log('Generating token...');
        const token = jwt.sign(
            {
                userId: userDetails._id,
                role: userIndex.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Step 6: Return success response
        console.log(' Login successful!');
        res.status(200).json({
            status: 'success',
            message: 'Logged in successfully!',
            role: userIndex.role,
            token,
        });
    } catch (err) {
        console.error(' Error during login:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error logging in.',
        });
    }
};

exports.signupCompany = async (req, res) => {
    try {
        const {
            companyName,
            domain,
            fullName,
            email,
            password,
            passwordConfirm,
        } = req.body;

        // Validate required fields
        if (
            !companyName ||
            !domain ||
            !fullName ||
            !email ||
            !password ||
            !passwordConfirm
        ) {
            return res.status(400).json({
                status: 'fail',
                message:
                    'All required fields (companyName, domain, fullName, email, password, passwordConfirm) must be provided!',
            });
        }

        // Check if email already exists
        const existingCompany = await Company.findOne({
            email,
        });
        if (existingCompany) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email already in use!',
            });
        }

        // Check if passwords match
        if (password !== passwordConfirm) {
            return res.status(400).json({
                status: 'fail',
                message: 'Passwords do not match!',
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        // Generate the next company_id
        let nextCompanyId;
        try {
            nextCompanyId = await getNextId(
                'company',
                'CID'
            );
        } catch (err) {
            return res.status(500).json({
                status: 'fail',
                message: 'Error generating Company ID.',
            });
        }
        req.body.company_id = nextCompanyId;

        // Create the new company record
        const newCompany = await Company.create(req.body);

        // Increment the counter only after successful creation
        try {
            await Counter.findOneAndUpdate(
                { name: 'company' },
                { $inc: { value: 1 } },
                { upsert: true, new: true }
            );
        } catch (err) {
            return res.status(500).json({
                status: 'fail',
                message:
                    'Error incrementing Company id in Counter table',
            });
        }

        // After creating the company, create an entry in UserIndex
        await UserIndex.create({
            email: newCompany.email,
            role: 'Company', 
            modelName: 'Company', 
            userId: newCompany._id,
        });

        // Generate JWT token for company
        const token = jwt.sign(
            {
                userId: newCompany._id,
                role: 'Company',
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Respond with success
        res.status(201).json({
            status: 'success',
            token
        });
    } catch (err) {
        console.error('Error during company signup:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error signing up company.',
        });
    }
};

exports.signupFreelancer = async (req, res) => {
    try {
        const { name, email, password, passwordConfirm } =
            req.body;

        // Validate required fields
        if (
            !name ||
            !email ||
            !password ||
            !passwordConfirm
        ) {
            return res.status(400).json({
                status: 'fail',
                message:
                    'All required fields (name, email, password, passwordConfirm) must be provided!',
            });
        }

        // Check if files are uploaded
        const files = req.files || {}; // Prevent undefined error
        const image = files.image
            ? files.image[0].path
            : null;
        const cvFile = files.cvFile
            ? files.cvFile[0].path
            : null;

        // Check if email already exists
        const existingFreelancer = await Freelancer.findOne(
            { email }
        );
        if (existingFreelancer) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email already in use!',
            });
        }

        // Check if passwords match
        if (password !== passwordConfirm) {
            return res.status(400).json({
                status: 'fail',
                message: 'Passwords do not match!',
            });
        }
        // Generate the next freelancer_id
        let nextFreelancerId;
        try {
            nextFreelancerId = await getNextId(
                'freelancer',
                'FLID'
            );
        } catch (err) {
            return res.status(500).json({
                status: 'fail',
                message: 'Error generating Freelancer ID.',
            });
        }
        req.body.freelancer_id = nextFreelancerId;

        // Create new freelancer record
        const newFreelancer = await Freelancer.create(
            req.body
        );

        try {
            // Increment Counter ONLY AFTER successful creation
            const updateResult =
                await Counter.findOneAndUpdate(
                    { name: 'freelancer' },
                    { $inc: { value: 1 } },
                    { upsert: true, new: true }
                );
        } catch (err) {
            return res.status(500).json({
                status: 'fail',
                message:
                    'Error incrementing freelancer id in Counter table',
            });
        }

        // After creating the freelancer, create an entry in UserIndex
        await UserIndex.create({
            email: newFreelancer.email,
            role: 'Freelancer', 
            modelName: 'Freelancer', 
            userId: newFreelancer._id,
        });

        // Generate JWT token for freelancer
        const token = jwt.sign(
            {
                userId: newFreelancer._id,
                role: 'Freelancer',
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Respond with success
        res.status(201).json({
            status: 'success',
            token
        });
    } catch (err) {
        console.error(
            'Error during freelancer signup:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error signing up freelancer.',
        });
    }
};
