const express = require('express');

const getNextId = require('../controllers/getNextIdController');
const utilsController = require('./../controllers/utilController');

const { getNextIdsForAllEntities } = getNextId;
const { clearCollectionAndResetCounter } = utilsController;

const router = express.Router();

// Route to clear a collection and reset its counter
router.post(
    '/clear-collection',
    clearCollectionAndResetCounter
);

router.get('/next-id', getNextIdsForAllEntities);

module.exports = router;
