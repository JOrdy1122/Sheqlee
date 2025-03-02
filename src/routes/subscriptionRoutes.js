const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('./../middlewares/auth'); 

router.get(
    '/stats',
    protect,
    subscriptionController.getAllSubscriptionStats
);

module.exports = router;
