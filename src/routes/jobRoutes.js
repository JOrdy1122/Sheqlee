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
} = jobController;

const router = express.Router();

router.get('/latest-job-posts', getLatestJobs);

router.get('/subscribed', protect, getSubscribedJobs);

router.patch('/:id/publish', protect, publishJob);

router.route('/').get(getAvailableJobs).post(createJob);

router
    .route('/:id')
    .get(getjob)
    .patch(updatejob)
    .delete(deletejob);

module.exports = router;
