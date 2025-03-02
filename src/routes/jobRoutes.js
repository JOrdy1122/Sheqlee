const express = require('express');
const jobController = require('./../controllers/jobController');
const { protect } = require('./../middlewares/auth'); // Import the middleware

const {
    getAvailableJobs,
    createJob,
    getjob,
    updatejob,
    deletejob,
    getLatestJobs,
    getSubscribedJobs,
    publishJob,
    toggleJobStatus
} = jobController;

const router = express.Router();

router.get('/latest-job-posts', getLatestJobs);

router.get('/subscribed', protect, getSubscribedJobs);

router.patch('/:id/toggle-status', protect, toggleJobStatus);

router.patch('/:id/publish', protect, publishJob);

router.route('/').get(getAvailableJobs).post(protect,createJob);

router
    .route('/:id')
    .get(getjob)
    .patch(protect,updatejob)
    .delete(protect,deletejob);

module.exports = router;
