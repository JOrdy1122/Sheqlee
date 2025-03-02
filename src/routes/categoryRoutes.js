const express = require('express');
const categoryController = require('./../controllers/categoryController');
const getNextId = require('../controllers/getNextIdController');
const { protect } = require('./../middlewares/auth'); // Ensure only authenticated users can access

const {
    getAllCategories,
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
} = categoryController;
const { getNextIdsForAllEntities } = getNextId;

const router = express.Router();

router.get('/next-id', getNextIdsForAllEntities);

router.patch(
    '/categories/:categoryId/status',
    protect,
    toggleCategoryStatus
);

router
    .route('/')
    .get(getAllCategories)
    .post(protect,createCategory);

router
    .route('/:id')
    .get(getCategory)
    .patch(protect,updateCategory)
    .delete(protect,deleteCategory);

module.exports = router;
