const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

router.get(
    '/stats',
    subscriptionController.getAllSubscriptionStats
);

module.exports = router;
