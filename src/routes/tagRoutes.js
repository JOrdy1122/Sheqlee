const express = require('express');
const tagController = require('./../controllers/tagController');
const { protect } = require('./../middlewares/auth'); // Ensure only authenticated users can access

const {
    getAllTags,
    createTag,
    getTag,
    updateTag,
    deleteTag,
    getPopularTags,
    toggleTagStatus,
} = tagController;

const router = express.Router();

router.get('/popular-tags', getPopularTags);

router.patch(
    '/tags/:tagId/status',
    protect,
    toggleTagStatus
);

router.route('/').get(getAllTags).post(createTag);

router
    .route('/:id')
    .get(getTag)
    .patch(updateTag)
    .delete(deleteTag);

module.exports = router;
