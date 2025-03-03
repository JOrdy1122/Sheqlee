const Category = require('./../models/categoryModel');
const getNextId = require('../utils/getNextId');
const Counter = require('../models/counterModel');
const Tag = require('../models/tagModel');
const ApiFeatures = require('./../utils/apiFeatures');
const logger = require('../utils/logger');

exports.toggleCategoryStatus = async (req, res) => {
    try {
        const category = await Category.findById(
            req.params.id
        );

        if (!category) {
            return res.status(404).json({
                status: 'fail',
                message: 'Category not found!',
            });
        }

        // Toggle status
        category.status =
            category.status === 'active'
                ? 'inactive'
                : 'active';

        await category.save(); // 

        res.status(200).json({
            status: 'success',
            message: `Category is now ${category.status}!`,
            data: { category },
        });
    } catch (err) {
        console.error(
            'Error toggling category status:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error toggling category status!',
        });
    }
};

exports.createCategory = async (req, res) => {
    try {
        // Generate the next ID without incrementing the counter yet
        let nextCategoryId;
        try {
            nextCategoryId = await getNextId(
                'category',
                'CTID'
            );
        } catch (errr) {
            return res.status(500).json({
                status: 'fail',
                message: 'Error generating Category Id',
            });
        }
        req.body.category_id = nextCategoryId;

        //create the category
        const newCategory = await Category.create(req.body);

        // Increment the counter only after successful creation
        await Counter.findOneAndUpdate(
            { name: 'category' },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );

        res.status(201).json({
            status: 'success',
            data: {
                category: newCategory,
            },
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: `Error creating category: ${err.message}`,
        });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        let query = Category.find().populate('tags', '-__v');

        const apiFeatures = new ApiFeatures(
            query,
            req.query
        )
            .filter()
            .search(['title']) ;
             

        const categories = await apiFeatures.query;

        res.status(200).json({
            status: 'success',
            results: categories.length,
            data: { categories },
        });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching categories.',
        });
    }
};

exports.getCategory = async (req, res) => {
    try {
        // Fetch the category by ID and populate the tags field
        const category = await Category.findById(
            req.params.id
        ).populate('tags','-__v');

        // Check if the category exists
        if (!category) {
            return res.status(404).json({
                status: 'fail',
                message: 'Category not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                category,
            },
        });
    } catch (err) {
        console.error('Error fetching category:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching category.',
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { tags } = req.body;

        // Validate the provided tag IDs
        if (tags && tags.length > 0) {
            const validTags = await Tag.find({
                _id: { $in: tags },
            });
            if (validTags.length !== tags.length) {
                return res.status(400).json({
                    status: 'fail',
                    message:
                        'One or more tag IDs are invalid.',
                });
            }
        }

        const updatedCategory =
            await Category.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true, // Return the updated document
                    runValidators: true, // Validate the updated fields
                }
            );

        if (!updatedCategory) {
            return res.status(404).json({
                status: 'fail',
                message: 'Category not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                category: updatedCategory,
            },
        });
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error updating category.',
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(
            req.params.id
        );
        if (!category) {
            return res.status(404).json({
                status: 'fail',
                message: 'Category not found',
            });
        }
        logger.info(
            `Admin ${req.user.id} deleted user ${req.params.id}`
        );
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        console.log('Error deleting category:', err);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting category',
        });
    }
};
