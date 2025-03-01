const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

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
    .post(createFeedback); // Create new feedback

router
    .route('/:id')
    .get(getFeedback) // Get single feedback
    .put(updateFeedback) // Update feedback
    .delete(deleteFeedback); // Delete feedback

module.exports = router;
