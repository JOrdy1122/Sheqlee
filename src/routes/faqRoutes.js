const express = require('express');
const faqController = require('./../controllers/faqController');

const {
    createFaq,
    updateFaq,
    getFaq,
    getAllFaq,
    deleteFaq,
} = faqController;

const router = express.Router();

router.route('/').get(getAllFaq).post(createFaq);

router
    .route('/:id')
    .get(getFaq)
    .patch(updateFaq)
    .delete(deleteFaq);

module.exports = router;
