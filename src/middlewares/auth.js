const jwt = require('jsonwebtoken');
const UserIndex = require('../models/userIndexModel');

const protect = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const token =
            req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'Token is missing!',
            });
        }

        // Verify the token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach user info to the request object
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(401).json({
            status: 'fail',
            message: 'Invalid or expired token.',
        });
    }
};

// Role-based authorization middleware
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message:
                    'You do not have permission to perform this action.',
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };
