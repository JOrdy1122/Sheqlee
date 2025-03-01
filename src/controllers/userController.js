const Users = require('./../models/userModel');
const Counter = require('../models/counterModel'); // Counter model for managing custom IDs
const getNextId = require('../utils/getNextId'); // Utility function for generating custom IDs
const logger = require('../utils/logger'); // Import logger

exports.createUser = async (req, res) => {
    try {
        const { name, email, userRole, phoneNumber } =
            req.body;

        // Validate required fields
        if (!name || !email || !userRole || !phoneNumber) {
            return res.status(400).json({
                status: 'fail',
                message:
                    'All required fields (name, email, userRole, phoneNumber) must be provided!',
            });
        }

        // Check if the email already exists
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email already in use!',
            });
        }

        // Generate the next user_id
        const nextUserId = await getNextId('users', 'UID');

        //setting the custtom id for the user_id
        req.body.user_id = nextUserId;

        // Create the new user
        const newUser = await Users.create(req.body);

        // Increment the counter only after successful creation
        await Counter.findOneAndUpdate(
            { name: 'users' },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );

        // Respond with success
        res.status(201).json({
            status: 'success',
            data: {
                user: newUser,
            },
        });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error creating user.',
        });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        let query = Users.find();

        const apiFeatures = new ApiFeatures(
            query,
            req.query
        )
            .filter()
            .search(['name', 'email']) // 🔹 Allow searching by name or email
            .paginate(); // 🔹 Uses default limit (7 per page)

        const users = await apiFeatures.query;

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users },
        });
    } catch (err) {
        console.error('💥 Error fetching users:', err);
        res.status(500).json({
            status: 'fail',
            message: `Error fetching users: ${err.message}`,
        });
    }
};

exports.getUser = async (req, res) => {
    const user = await Users.findById(req.params.id);
    if (!user) console.log('User Could not been found!');

    console.log(user);

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
};
exports.updateUser = async (req, res) => {
    const updatedUsers = await Users.findByIdAndUpdate(
        req.params.id
    );
    if (!updatedUsers) {
        return res.status(404).json({
            status: 'Fail',
            message: 'User/Admin Not Found!',
        });
    }
    res.status(200).json({
        status: 'success',
        data: {
            updatedUsers,
        },
    });
};

exports.deleteUser = async (req, res, next) => {
    try {
        const adminId = req.user.id; // Assuming the authenticated admin is stored in req.user
        const userIdToDelete = req.params.id;

        const user =
            await Users.findByIdAndDelete(userIdToDelete);

        if (!user) {
            logger.warn(
                `⚠️ Admin ${adminId} attempted to delete non-existent user ${userIdToDelete}`
            );
            return next(
                new AppError(
                    'No document found with that ID.',
                    404
                )
            );
        }

        logger.info(
            `🗑️ Admin ${adminId} deleted user ${userIdToDelete}`
        );

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        logger.error(
            `❌ Error deleting user: ${error.message}`
        );
        console.log('Eror Deleting an admin', error);
        next(error);
    }
};
