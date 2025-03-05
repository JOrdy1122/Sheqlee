const express = require('express');
const freelancerController = require('./../controllers/freelancerController');
const authController = require('./../controllers/authController');
const passport = require('passport');
const { protect } = require('./../middlewares/auth'); // Ensure only authenticated users can access

const {
    upload,
    processImage,
} = require('../middlewares/multerConfig');

const {
    getAllFreelancers,
    getFreelancer,
    updateFreelancer,
    deleteFreelancer,
    forgotPassword,
    resetPassword,
    toggleFavoriteJob,
    getFavoriteJobs,
    toggleApplyJob,
    getAppliedJobs,
    toggleCategorySubscription,
    toggleTagSubscription,
    toggleFreelancerAction,
    getFreelancerDashboard,
    toggleCompanySubscription
} = freelancerController;

const {
    signupFreelancer,
    login,
    requestDeletion,
    handleGoogleCallback,
} = authController;

const router = express.Router();

// ✅ Freelancer Google OAuth Route
router.get(
    '/auth/google',
    passport.authenticate('google-freelancer', {
        scope: ['profile', 'email'],
    })
);

// ✅ Freelancer Google OAuth Callback
router.get(
    '/auth/google/callback',
    passport.authenticate('google-freelancer', {
        session: false,
        failureRedirect: '/',
    }),
    handleGoogleCallback
);

// for sign up and login authentication
router.post('/auth/signup', signupFreelancer);
// router.post('/auth/login', login);

// ✅ Add/Remove Favorite Job
router.patch('/favorites', protect, toggleFavoriteJob);
// ✅ Get Favorite Jobs List
router.get('/favorites', protect, getFavoriteJobs);

router.get('/dashboard', protect,getFreelancerDashboard);

// for applying job posts
router.get('/apply', protect, getAppliedJobs);
router.patch('/apply', protect, toggleApplyJob);

// POST: Freelancer requests account deletion
router.post('/deletionRequest', protect, requestDeletion);

router.patch(
    '/:id/action',
    protect,
    toggleFreelancerAction
);

//for getting the reset code
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword', resetPassword);

router.patch('/subscribe/company', protect, toggleCompanySubscription);

router.patch(
    '/subscribe/tag',
    protect,
    toggleTagSubscription
);
router.patch(
    '/subscribe/category',
    protect,
    toggleCategorySubscription
);

router.route('/').get(getAllFreelancers);

// Freelancer requests account deletion
router.post('/deletionRequest', protect, requestDeletion);

// deletion of freelancer by the admin
router.delete('/:id', protect,deleteFreelancer);

router.route('/:id').get(getFreelancer);

router.patch(
    '/:id',
    protect,
    upload.fields([
        { name: 'image', maxCount: 1 }, // Profile picture
        { name: 'cvFile', maxCount: 1 }, // CV file
    ]),
    (req, res, next) => {
        if (req.files && req.files['image']) {
            return processImage(req, res, next); // Process image if it exists
        }
        next(); // Continue to updateFreelancer if no image is uploaded
    },
    updateFreelancer
);

module.exports = router;
