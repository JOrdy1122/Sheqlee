const Faq = require('./../models/faqModel');
const getNextId = require('../utils/getNextId');
const Counter = require('../models/counterModel');
const ApiFeatures = require('./../utils/apiFeatures');

exports.createFaq = async (req, res) => {
    try {
        // Generate the next ID without incrementing the counter yet
        let nextFaqId;
        try {
            nextFaqId = await getNextId('faq', 'CTID');
        } catch (errr) {
            return res.status(500).json({
                status: 'fail',
                message: 'Error generating faq Id',
            });
        }
        req.body.faq_id = nextFaqId;

        //create the faq
        const newFaq = await Faq.create(req.body);

        // Increment the counter only after successful creation
        await Counter.findOneAndUpdate(
            { name: 'faq' },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );

        res.status(201).json({
            status: 'success',
            data: {
                faq: newFaq,
            },
        });
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: `Error creating FAQ: ${err.message}`,
        });
    }
};
exports.getAllFaq = async (req, res) => {
    try {
        let query = Faq.find();

        const apiFeatures = new ApiFeatures(
            query,
            req.query
        )
            .filter()
            .search(['question', 'answer']) // Adjust searchable fields
            .paginate(); // 🔹 Uses default limit (7 per page)

        const faqs = await apiFeatures.query;

        res.status(200).json({
            status: 'success',
            results: faqs.length,
            data: { faqs },
        });
    } catch (err) {
        console.error('💥 Error fetching FAQs:', err);
        res.status(500).json({
            status: 'fail',
            message: `Error fetching FAQs: ${err.message}`,
        });
    }
};

exports.getFaq = async (req, res) => {
    try {
        // Fetch the faq by ID and populate the tags field
        const faq = await Faq.findById(req.params.id);

        // Check if the faq exists
        if (!faq) {
            return res.status(404).json({
                status: 'fail',
                message: 'faq not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                faq,
            },
        });
    } catch (err) {
        console.error('Error fetching faq:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching faq.',
        });
    }
};
exports.updateFaq = async (req, res) => {
    try {
        const updatedFaq = await Faq.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedFaq) {
            return res.status(404).json({
                status: 'Fail',
                message: 'Faq Not Found!',
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                updatedFaq,
            },
        });
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: `Error updating FAQ: ${err.message}`,
        });
    }
};

exports.deleteFaq = async (req, res) => {
    try {
        const faq = await Faq.findByIdAndDelete(
            req.params.id
        );
        if (!faq) {
            return res.status(404).json({
                status: 'Fail',
                message: 'FAQ Not Found!',
            });
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(500).json({
            status: 'Fail',
            message: 'Error deleting  FAQ',
        });
    }
};
