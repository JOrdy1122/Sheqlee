const express = require('express');
const deletionRequestController = require('./../controllers/deletionRequestController');

const {
    createDeletionRequest,
    updateDeletionRequest,
    getAllDeletionRequests,
} = deletionRequestController;

const router = express.Router();

// User submits a deletion request
router.post('/', createDeletionRequest);

// Admin fetches all pending deletion requests
router.get('/', getAllDeletionRequests);

// Admin approves or rejects a deletion request
router.patch('/:id', updateDeletionRequest);

module.exports = router;
