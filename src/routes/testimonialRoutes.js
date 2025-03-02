const express = require('express');
const testimonialController = require('./../controllers/testimonialController');
const { protect } = require('./../middlewares/auth'); 

const {
    createTestimonial,
    deleteTestimonial,
    updateTestimonial,
    getAllTestimonials,
    getTestimonial,
} = testimonialController;

const router = express.Router();

router
    .route('/')
    .get(getAllTestimonials)
    .post(protect,createTestimonial); // used only during development for storing the first data

router
    .route('/:id')
    .get(getTestimonial)
    .patch(protect,updateTestimonial)
    .delete(protect,deleteTestimonial);

module.exports = router;
