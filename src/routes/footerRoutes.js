const express = require('express');
const footerController = require('../controllers/footerController');
const { protect } = require('./../middlewares/auth'); 

const {
    createFooter,
    getAllFooters,
    getFooter,
    updateFooter,
    deleteFooter,
} = footerController;

const router = express.Router();

// Create a new footer and Only used on development
router.post('/', protect ,createFooter);

router.get('/',getAllFooters);


router.get('/:id', getFooter);

// Update a footer section by ID
router.put('/:id',protect, updateFooter);

// Delete a footer section by ID
router.delete('/:id',protect, deleteFooter);

module.exports = router;
