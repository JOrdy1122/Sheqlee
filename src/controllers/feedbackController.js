const Feedback = require('../models/feedbackModel');
const ApiFeatures = require('../utils/apiFeatures');
const getNextId = require('../utils/getNextId');
const Counter = require('../models/counterModel');
const ApiFeatures = require('../utils/apiFeatures');

// Get all feedback with filtering, search, and pagination
exports.getAllFeedback = async (req, res) => {
    try {
        let query = Feedback.find();

        // Apply API features 
        const apiFeatures = new ApiFeatures(
            query,
            req.query
        )
            .filter()
            .search(['message']) 
            .paginate(); 

        const feedbacks = await apiFeatures.query;

        res.status(200).json({
            status: 'success',
            results: feedbacks.length,
            data: { feedbacks },
        });
    } catch (err) {
        console.error('Error fetching feedback:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching feedback.',
        });
    }
};

// Get a single feedback by ID
exports.getFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(
            req.params.id
        );
        if (!feedback) {
            return res.status(404).json({
                status: 'fail',
                message: 'Feedback not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: { feedback },
        });
    } catch (err) {
        console.error('Error fetching feedback:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching feedback.',
        });
    }
};

// Create feedback with unique ID (FDID)
exports.createFeedback = async (req, res) => {
    try {
        // Generate the next ID without incrementing the counter yet
        let nextFeedbackId;
        try {
            nextFeedbackId = await getNextId(
                'feedback',
                'FDID'
            );
        } catch (errr) {
            return res.status(500).json({
                status: 'fail',
                message: 'Error generating Feedback Id',
            });
        }
        req.body.feedback_id = nextFeedbackId;

        // Create the feedback entry
        const newFeedback = await Feedback.create(req.body);

        // Increment the counter only after successful creation
        await Counter.findOneAndUpdate(
            { name: 'feedback' },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );

        res.status(201).json({
            status: 'success',
            data: { feedback: newFeedback },
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: `Error creating feedback: ${err.message}`,
        });
    }
};

// Update feedback
exports.updateFeedback = async (req, res) => {
    try {
        const updatedFeedback =
            await Feedback.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

        if (!updatedFeedback) {
            return res.status(404).json({
                status: 'fail',
                message: 'Feedback not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: { feedback: updatedFeedback },
        });
    } catch (err) {
        console.error('Error updating feedback:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error updating feedback.',
        });
    }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(
            req.params.id
        );
        if (!feedback) {
            return res.status(404).json({
                status: 'fail',
                message: 'Feedback not found.',
            });
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        console.log('Error deleting feedback:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error deleting feedback.',
        });
    }
};
