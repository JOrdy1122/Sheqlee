const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('./../middlewares/auth'); 

const {
    getAllFeedback,
    createFeedback,
    getFeedback,
    deleteFeedback,
    updateFeedback,
} = feedbackController;

router
    .route('/')
    .get(getAllFeedback) // Get all feedback with filtering, search & pagination
    .post(protect, createFeedback); // Create new feedback

router
    .route('/:id')
    .get(getFeedback) // Get single feedback
    .put(protect, updateFeedback) // Update feedback
    .delete(protect, deleteFeedback); // Delete feedback

module.exports = router;
