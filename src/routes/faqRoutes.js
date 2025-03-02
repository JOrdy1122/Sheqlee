const express = require('express');
const faqController = require('./../controllers/faqController');
const { protect } = require('./../middlewares/auth'); 

const {
    createFaq,
    updateFaq,
    getFaq,
    getAllFaq,
    deleteFaq,
} = faqController;

const router = express.Router();

router.route('/').get(getAllFaq).post(protect,createFaq);

router
    .route('/:id')
    .get(getFaq)
    .patch(protect,updateFaq)
    .delete(protect,deleteFaq);

module.exports = router;
