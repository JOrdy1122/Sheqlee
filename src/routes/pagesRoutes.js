const express = require('express');
const pageController = require('../controllers/pageController');

const router = express.Router();

// Create a new page
router.post('/', pageController.createPage);

// Get all pages (with filtering, searching, and pagination)
router.get('/', pageController.getAllPages);

// Get a single page by ID
router.get('/:id', pageController.getPage);

// Update a page by ID
router.put('/:id', pageController.updatePage);

// Delete a page by ID
router.delete('/:id', pageController.deletePage);

module.exports = router;
