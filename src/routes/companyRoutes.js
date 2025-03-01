const express = require('express');
const companyController = require('./../controllers/companyController');
const authController = require('./../controllers/authController');
const passport = require('passport');
const { protect } = require('./../middlewares/auth');

const {
    upload,
    processImage,
} = require('../middlewares/multerConfig');

const {
    getAllCompanies,
    getCompany,
    updateCompany,
    toggleCompanyAction,
} = companyController;
const {
    login,
    signupCompany,
    handleGoogleCallback,
    requestDeletion,
} = authController;

const router = express.Router();

// ✅ Company Google OAuth Route
router.get(
    '/auth/google',
    passport.authenticate('google-company', {
        scope: ['profile', 'email'],
    })
);

// ✅ Company Google OAuth Callback
router.get(
    '/auth/google/callback',
    passport.authenticate('google-company', {
        session: false,
        failureRedirect: '/',
    }),
    handleGoogleCallback
);

router.post('/auth/signup', signupCompany);

// router.post('/auth/login', login);

router.route('/').get(getAllCompanies);

router.route('/:id').get(getCompany);

// POST: Company requests account deletion
router.post('/deletionRequest', protect, requestDeletion);

router.patch('/:id/action', protect, toggleCompanyAction);

router.patch(
    '/:id',
    upload.single('logo'), // Upload logo
    processImage, // Process image (resize, optimize)
    updateCompany
);

module.exports = router;
