const Tag = require('./../models/tagModel');
const getNextId = require('../utils/getNextId');
const Counter = require('../models/counterModel');
const ApiFeatures = require('./../utils/apiFeatures');

exports.toggleTagStatus = async (req, res) => {
    try {
        const { tagId } = req.params;

        // Find the tag
        const tag = await Tag.findById(tagId);
        if (!tag) {
            return res.status(404).json({
                status: 'fail',
                message: 'Tag not found!',
            });
        }

        // Toggle the status
        tag.status =
            tag.status === 'active' ? 'inactive' : 'active';

        await tag.save();

        res.status(200).json({
            status: 'success',
            message: `Tag status changed to ${tag.status}!`,
            data: tag,
        });
    } catch (err) {
        console.error(' Error toggling tag status:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error toggling tag status!',
        });
    }
};

exports.getPopularTags = async (req, res) => {
    try {
        let popularTags = await Tag.aggregate([
            { $match: { status: 'active' } },

            
            {
                $addFields: {
                    tagTitle: '$title', // Store original title before lookups
                },
            },

            // Get associated categories
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: 'tags',
                    as: 'categories',
                },
            },

            {
                $unwind: {
                    path: '$categories',
                    preserveNullAndEmptyArrays: true,
                },
            },

            // Get associated jobs
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'categories._id',
                    foreignField: 'category',
                    as: 'jobs',
                },
            },

            // Get freelancer subscribers
            {
                $lookup: {
                    from: 'freelancers',
                    localField: '_id',
                    foreignField: 'subscribedTags',
                    as: 'freelancerSubscribers',
                },
            },

          
            {
                $addFields: {
                    jobCount: {
                        $size: { $ifNull: ['$jobs', []] },
                    },
                    subscriberCount: {
                        $size: {
                            $ifNull: [
                                '$freelancerSubscribers',
                                [],
                            ],
                        },
                    },
                    popularityScore: {
                        $add: [
                            {
                                $multiply: [
                                    {
                                        $size: '$freelancerSubscribers',
                                    },
                                    2,
                                ],
                            },
                            { $size: '$jobs' },
                        ],
                    },
                },
            },

            { $sort: { popularityScore: -1 } },
            { $limit: 6 },

           
            {
                $project: {
                    _id: 1,
                    title: {
                        $ifNull: ['$tagTitle', '$title'],
                    }, 
                    jobCount: 1,
                    subscriberCount: 1,
                },
            },
        ]);

        // 🔹 Fallback: If no popular tags, return any active ones
        if (popularTags.length === 0) {
            popularTags = await Tag.find({
                status: 'active',
            })
                .limit(6)
                .select('_id title');
        }

        console.log(popularTags); 

        res.status(200).json({
            success: true,
            tags: popularTags,
        });
    } catch (error) {
        console.error('Error in getPopularTags:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

exports.createTag = async (req, res) => {
    try {
        // // Generate the next ID without incrementing the counter yet
        const nextTagId = await getNextId('tags', 'TGID');
        req.body.tag_id = nextTagId;

        //creating the tag
        const newTag = await Tag.create(req.body);

        //Increment the counter only after the successfull creation
        await Counter.findOneAndUpdate(
            { name: 'tags' },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );

        res.status(201).json({
            status: 'success',
            data: {
                tag: newTag,
            },
        });
    } catch (err) {
        console.log('Error creating tag:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error creating tag',
        });
    }
};

exports.getAllTags = async (req, res) => {
    try {
        let query = Tag.find().populate('categories');

        // Handle filter and search
        const apiFeatures = new ApiFeatures(query, req.query)
            .filter()
            .search(['title']);

        // If no pagination is requested, show all tags
        if (!req.query.page && !req.query.limit) {
            const tags = await apiFeatures.query; // Get all tags
            return res.status(200).json({
                status: 'success',
                results: tags.length,
                data: { tags },
            });
        }

        // If pagination is requested (page and/or limit are in the query params)
        apiFeatures.paginate(); // Apply pagination

        const tags = await apiFeatures.query;

        // Count total items (tags) to calculate totalPages
        const totalItems = await Tag.countDocuments(); // Count all tags

        // Calculate totalPages
        const totalPages = Math.ceil(totalItems / (req.query.limit || 10));

        res.status(200).json({
            status: 'success',
            results: tags.length,
            totalPages: totalPages,
            currentPage: req.query.page || 1, // Default to page 1 if not provided
            totalItems: totalItems,
            data: { tags },
        });
    } catch (err) {
        console.error('💥 There was an error fetching all Tags!', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching tags.',
        });
    }
};

exports.getTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) console.log('Tag Could not been found!');

        console.log(tag);
        res.status(200).json({
            status: 'success',
            data: {
                tag,
            },
        });
    } catch (err) {
        console.error('Error getting tag:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error getting a tag.',
        });
    }
};

exports.updateTag = async (req, res) => {
    try {
        const updatedTag = await Tag.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, 
                runValidators: true, 
            }
        );

        if (!updatedTag) {
            return res.status(404).json({
                status: 'fail',
                message: 'Tag not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                tag: updatedTag,
            },
        });
    } catch (err) {
        console.error('Error updating tag:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error updating tag.',
        });
    }
};

exports.deleteTag = async (req, res) => {
    try {
        const tag = await Tag.findByIdAndDelete(
            req.params.id
        );

        res.status(204).json({
            status: 'success',
            data: {
                tag,
            },
        });
    } catch (err) {
        console.error('Error deleting tag:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error deleting tag.',
        });
    }
};
