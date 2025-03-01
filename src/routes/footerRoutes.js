const express = require('express');
const footerController = require('../controllers/footerController');

const router = express.Router();

// Create a new footer section
router.post('/', footerController.createFooter);

// Get all footer sections (with filtering, searching, and pagination)
router.get('/', footerController.getAllFooters);

// Get a single footer section by ID
router.get('/:id', footerController.getFooter);

// Update a footer section by ID
router.put('/:id', footerController.updateFooter);

// Delete a footer section by ID
router.delete('/:id', footerController.deleteFooter);

module.exports = router;
