const Tag = require('./../models/tagModel');
const getNextId = require('../utils/getNextId');
const Counter = require('../models/counterModel');

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
        console.error('❌ Error toggling tag status:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error toggling tag status!',
        });
    }
};

// exports.getPopularTags = async (req, res) => {
//     try {
//         const popularTags = await Tag.aggregate([
//             { $match: { status: 'active' } }, // Step 1: Filter active tags

//             {
//                 $lookup: {
//                     // Step 2: Join with categories
//                     from: 'categories',
//                     localField: '_id',
//                     foreignField: 'tags',
//                     as: 'categories',
//                 },
//             },

//             {
//                 $unwind: {
//                     // Step 3: Convert categories array into separate documents
//                     path: '$categories',
//                     preserveNullAndEmptyArrays: true,
//                 },
//             },

//             {
//                 $lookup: {
//                     // Step 4: Find jobs that belong to these categories
//                     from: 'jobs',
//                     localField: 'categories._id',
//                     foreignField: 'category',
//                     as: 'jobs',
//                 },
//             },

//             {
//                 $lookup: {
//                     // Step 5: Find freelancers who subscribed to these tags
//                     from: 'freelancers',
//                     localField: '_id',
//                     foreignField: 'subscribedTags',
//                     as: 'freelancerSubscribers',
//                 },
//             },

//             {
//                 $addFields: {
//                     // Step 6: Count jobs and subscribers
//                     jobCount: { $size: '$jobs' },
//                     subscriberCount: {
//                         $size: '$freelancerSubscribers',
//                     },
//                 },
//             },

//             {
//                 $addFields: {
//                     // Step 7: Calculate popularity score
//                     popularityScore: {
//                         $add: [
//                             {
//                                 $multiply: [
//                                     '$subscriberCount',
//                                     2,
//                                 ],
//                             }, // Subscribers * 2
//                             '$jobCount', // Jobs * 1
//                         ],
//                     },
//                 },
//             },

//             { $sort: { popularityScore: -1 } }, // Step 8: Sort by highest popularityScore

//             { $limit: 6 }, // Step 9: Return only the top 6 tags

//             {
//                 $project: {
//                     // Step 10: Select only the needed fields
//                     _id: 1,
//                     name: 1,
//                     jobCount: 1,
//                     subscriberCount: 1,
//                 },
//             },
//         ]);

//         res.status(200).json({
//             success: true,
//             tags: popularTags,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message,
//         });
//     }
// };

exports.getPopularTags = async (req, res) => {
    try {
        let popularTags = await Tag.aggregate([
            { $match: { status: 'active' } }, // Step 1: Filter active tags

            {
                $lookup: {
                    // Step 2: Join with categories
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
            }, // Step 3: Flatten categories array

            {
                $lookup: {
                    // Step 4: Find jobs linked to these categories
                    from: 'jobs',
                    localField: 'categories._id',
                    foreignField: 'category',
                    as: 'jobs',
                },
            },

            {
                $lookup: {
                    // Step 5: Find freelancers who subscribed to these tags
                    from: 'freelancers',
                    localField: '_id',
                    foreignField: 'subscribedTags',
                    as: 'freelancerSubscribers',
                },
            },

            {
                $addFields: {
                    jobCount: { $size: '$jobs' },
                    subscriberCount: {
                        $size: '$freelancerSubscribers',
                    },
                },
            },

            {
                $addFields: {
                    // Step 6: Calculate popularity score
                    popularityScore: {
                        $add: [
                            {
                                $multiply: [
                                    '$subscriberCount',
                                    2,
                                ],
                            }, // Subscribers * 2
                            '$jobCount', // Jobs * 1
                        ],
                    },
                },
            },

            { $sort: { popularityScore: -1 } }, // Step 7: Sort by popularity score

            { $limit: 6 }, // Step 8: Return only the top 6 tags

            {
                $project: {
                    _id: 1,
                    name: 1,
                    jobCount: 1,
                    subscriberCount: 1,
                },
            },
        ]);

        // **Fallback: Show default tags if no popular tags exist**
        if (popularTags.length === 0) {
            popularTags = await Tag.find({
                status: 'active',
            })
                .limit(6)
                .select('_id name'); // Fetch 6 random active tags
        }

        res.status(200).json({
            success: true,
            tags: popularTags,
        });
    } catch (error) {
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
        const tags =
            await Tag.find().populate('categories');

        res.status(200).json({
            status: 'success',
            result: tags.length,
            data: {
                tags,
            },
        });
    } catch (err) {
        console.log(
            '💥 There was an error Fetching all Tags !',
            err
        );
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
        console.log('There was an Error getting a tag!');
    }
};

exports.updateTag = async (req, res) => {
    try {
        const updatedTag = await Tag.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, // Return the updated document
                runValidators: true, // Validate the updated fields
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
    const tag = await Tag.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: {
            tag,
        },
    });
};
