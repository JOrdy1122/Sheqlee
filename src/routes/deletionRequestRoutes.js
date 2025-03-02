const express = require('express');
const deletionRequestController = require('./../controllers/deletionRequestController');
const { protect } = require('./../middlewares/auth'); 

const {
    createDeletionRequest,
    updateDeletionRequest,
    getAllDeletionRequests,
} = deletionRequestController;

const router = express.Router();

// User submits a deletion request
router.post('/', protect,createDeletionRequest);

// Admin fetches all pending deletion requests
router.get('/', protect,getAllDeletionRequests);


router.patch('/:id', protect , updateDeletionRequest);

module.exports = router;
