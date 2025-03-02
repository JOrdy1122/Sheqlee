const express = require('express');
const pageController = require('../controllers/pageController');
const { protect } = require('./../middlewares/auth'); 

const {getAllPages,getPage,updatePage,deletePage} = pageController;
const router = express.Router();


router.post('/', createPage);

// Get all pages 
router.get('/', getAllPages);

router.get('/:id', getPage);


router.put('/:id', protect,updatePage);


router.delete('/:id',protect, deletePage);

module.exports = router;
