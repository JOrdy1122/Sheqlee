const express = require('express');
const footerController = require('../controllers/footerController');

const {
    createFooter,
    getAllFooters,
    getFooter,
    updateFooter,
    deleteFooter,
} = footerController;

const router = express.Router();

// Create a new footer and Only used on development
router.post('/', createFooter);

// Get all footer sections
router.get('/', getAllFooters);

// Get a single footer section by ID
router.get('/:id', getFooter);

// Update a footer section by ID
router.put('/:id', updateFooter);

// Delete a footer section by ID
router.delete('/:id', deleteFooter);

module.exports = router;
