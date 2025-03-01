const Page = require('../models/APGSPPTSCPModel');
const getNextId = require('../utils/getNextId');
const Counter = require('../models/counterModel');
const ApiFeatures = require('../utils/apiFeatures');

// Create a new page with a unique ID (PGID)
exports.createPage = async (req, res) => {
    try {
        // Generate the next ID without incrementing the counter yet
        let nextPageId;
        try {
            nextPageId = await getNextId('page', 'PGID');
        } catch (err) {
            return res.status(500).json({
                status: 'fail',
                message: 'Error generating Page ID',
            });
        }
        req.body.page_id = nextPageId;

        // Create the page
        const newPage = await Page.create(req.body);

        // Increment the counter only after successful creation
        await Counter.findOneAndUpdate(
            { name: 'page' },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );

        res.status(201).json({
            status: 'success',
            data: { page: newPage },
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: `Error creating page: ${err.message}`,
        });
    }
};

// Get all pages with filtering, searching, and pagination
exports.getAllPages = async (req, res) => {
    try {
        let query = Page.find();

        const apiFeatures = new ApiFeatures(
            query,
            req.query
        )
            .filter()
            .search(['title', 'content']) // Searchable fields
            .paginate();

        const pages = await apiFeatures.query;

        res.status(200).json({
            status: 'success',
            results: pages.length,
            data: { pages },
        });
    } catch (err) {
        console.error('Error fetching pages:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching pages.',
        });
    }
};

// Get a single page by ID
exports.getPage = async (req, res) => {
    try {
        const page = await Page.findById(
            req.params.id
        ).populate('updatedBy');

        if (!page) {
            return res.status(404).json({
                status: 'fail',
                message: 'Page not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: { page },
        });
    } catch (err) {
        console.error('Error fetching page:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching page.',
        });
    }
};

// Update a page
exports.updatePage = async (req, res) => {
    try {
        req.body.updatedOn = Date.now(); // Update timestamp

        const updatedPage = await Page.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedPage) {
            return res.status(404).json({
                status: 'fail',
                message: 'Page not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: { page: updatedPage },
        });
    } catch (err) {
        console.error('Error updating page:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error updating page.',
        });
    }
};

// Delete a page
exports.deletePage = async (req, res) => {
    try {
        const page = await Page.findByIdAndDelete(
            req.params.id
        );

        if (!page) {
            return res.status(404).json({
                status: 'fail',
                message: 'Page not found.',
            });
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        console.error('Error deleting page:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error deleting page.',
        });
    }
};
