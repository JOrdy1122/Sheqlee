const Footer = require('../models/footerModel');
const getNextId = require('../utils/getNextId');
const Counter = require('../models/counterModel');
const ApiFeatures = require('../utils/apiFeatures');

// Create a new footer section with a unique ID (FTID)
exports.createFooter = async (req, res) => {
    try {
        // Generate the next ID without incrementing the counter yet
        let nextFooterId;
        try {
            nextFooterId = await getNextId(
                'footer',
                'FTID'
            );
        } catch (err) {
            return res.status(500).json({
                status: 'fail',
                message: 'Error generating Footer ID',
            });
        }
        req.body.footer_id = nextFooterId;

        // Create the footer section
        const newFooter = await Footer.create(req.body);

        // Increment the counter only after successful creation
        await Counter.findOneAndUpdate(
            { name: 'footer' },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );

        res.status(201).json({
            status: 'success',
            data: { footer: newFooter },
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: `Error creating footer: ${err.message}`,
        });
    }
};

// Get all footer sections with filtering, searching, and pagination
exports.getAllFooters = async (req, res) => {
    try {
        let query = Footer.find();

        const apiFeatures = new ApiFeatures(
            query,
            req.query
        )
            .filter()
            .search(['section', 'content']) // Searchable fields
            .paginate();

        const footers = await apiFeatures.query;

        res.status(200).json({
            status: 'success',
            results: footers.length,
            data: { footers },
        });
    } catch (err) {
        console.error('Error fetching footers:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching footers.',
        });
    }
};

// Get a single footer section by ID
exports.getFooter = async (req, res) => {
    try {
        const footer = await Footer.findById(req.params.id);

        if (!footer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Footer section not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: { footer },
        });
    } catch (err) {
        console.error(
            'Error fetching footer section:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching footer section.',
        });
    }
};

// Update a footer section
exports.updateFooter = async (req, res) => {
    try {
        const updatedFooter =
            await Footer.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!updatedFooter) {
            return res.status(404).json({
                status: 'fail',
                message: 'Footer section not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: { footer: updatedFooter },
        });
    } catch (err) {
        console.error('Error updating footer:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error updating footer.',
        });
    }
};

// Delete a footer section
exports.deleteFooter = async (req, res) => {
    try {
        const footer = await Footer.findByIdAndDelete(
            req.params.id
        );

        if (!footer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Footer section not found.',
            });
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        console.error('Error deleting footer:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error deleting footer.',
        });
    }
};
