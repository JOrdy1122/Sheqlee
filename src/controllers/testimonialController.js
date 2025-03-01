const Testimonial = require('../models/testimonialModel');

// Create a Testimonial and only used during a development
exports.createTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.create(
            req.body
        );

        res.status(201).json({
            status: 'success',
            data: { testimonial },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

//Get All Testimonials
exports.getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();

        res.status(200).json({
            status: 'success',
            results: testimonials.length,
            data: { testimonials },
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching testimonials',
        });
    }
};

// Get Single Testimonial
exports.getTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(
            req.params.id
        );

        if (!testimonial) {
            return res.status(404).json({
                status: 'fail',
                message: 'Testimonial not found',
            });
        }

        res.status(200).json({
            status: 'success',
            data: { testimonial },
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching testimonial',
        });
    }
};

// Update Testimonial
exports.updateTestimonial = async (req, res) => {
    try {
        req.body.updatedAt = Date.now(); // Update timestamp

        const testimonial =
            await Testimonial.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

        if (!testimonial) {
            return res.status(404).json({
                status: 'fail',
                message: 'Testimonial not found',
            });
        }

        res.status(200).json({
            status: 'success',
            data: { testimonial },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

// Delete Testimonial
exports.deleteTestimonial = async (req, res) => {
    try {
        const testimonial =
            await Testimonial.findByIdAndDelete(
                req.params.id
            );

        if (!testimonial) {
            return res.status(404).json({
                status: 'fail',
                message: 'Testimonial not found',
            });
        }

        res.status(204).json({
            status: 'success',
            data: null, // No content for delete
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: 'Error deleting testimonial',
        });
    }
};
