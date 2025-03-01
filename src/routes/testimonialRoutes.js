const express = require('express');
const testimonialController = require('./../controllers/testimonialController');

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
    .post(createTestimonial); // used only during development for storing the first data

router
    .route('/:id')
    .get(getTestimonial)
    .patch(updateTestimonial)
    .delete(deleteTestimonial);

router;
