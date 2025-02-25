const Job = require('../models/jobModel');
const getNextId = require('../utils/getNextId');
const moment = require('moment'); // Import moment.js
const Counter = require('./../models/counterModel');

const Freelancer = require('../models/freelancerModel');

exports.getSubscribedJobs = async (req, res) => {
    try {
        // Get the authenticated freelancer
        const freelancer = await Freelancer.findById(
            req.user.userId
        );

        if (!freelancer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Freelancer not found',
            });
        }

        // Extract freelancer's subscriptions
        const {
            subscribedCompanies,
            subscribedCategories,
            subscribedTags,
        } = freelancer;

        // Find jobs that match ANY of the freelancer's subscriptions
        const jobs = await Job.find({
            $or: [
                { company: { $in: subscribedCompanies } },
                { category: { $in: subscribedCategories } },
                { tags: { $in: subscribedTags } },
            ],
            status: 'active', // Only show active jobs
        })
            .populate('company', 'companyName logo') // Include company details
            .populate('category', 'name') // Include category details
            .populate('tags', 'name'); // Include tag details

        res.status(200).json({
            status: 'success',
            results: jobs.length,
            data: { jobs },
        });
    } catch (err) {
        console.error(
            'Error fetching subscribed jobs:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching subscribed jobs',
        });
    }
};

// Fetch latest jobs
exports.getLatestJobs = async (req, res) => {
    try {
        const latestJobs = await Job.find({
            status: 'active',
        })
            .sort({ createdAt: -1 })
            .limit(10);

        if (latestJobs.length === 0) {
            return res.status(200).json({
                success: true,
                message:
                    'No jobs available at the moment. Check back later!',
                jobs: [],
            });
        }

        // Format timestamps
        const formattedJobs = latestJobs.map((job) => ({
            ...job.toObject(),
            timeAgo: moment(job.createdAt).fromNow(),
        }));

        res.status(200).json({
            success: true,
            jobs: formattedJobs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

exports.createJob = async (req, res) => {
    try {
        // Generate the next ID for jobs
        let nextJobId;
        try {
            nextJobId = await getNextId('jobs', 'JPID');
        } catch (err) {
            return res.status(500).json({
                status: 'fail',
                message: 'Error generating Jobid!',
            });
        }

        // Add the generated ID to the request body
        req.body.job_id = nextJobId;

        // Create the new job
        const newJob = await Job.create(req.body);

        // Increment the counter only after successful creation
        await Counter.findOneAndUpdate(
            { name: 'jobs' },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );

        res.status(201).json({
            status: 'success',
            data: {
                job: newJob,
            },
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: `Error creating job: ${err.message}`,
        });
    }
};

exports.getAvailableJobs = async (req, res) => {
    try {
        const jobs = await Job.find({
            $or: [
                { status: 'active', action: 'active' },
                { status: 'inactive', action: 'active' },
            ],
        });

        res.status(200).json({
            status: 'success',
            results: jobs.length,
            data: { jobs },
        });
    } catch (err) {
        console.error('❌ Error fetching jobs:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching available jobs',
        });
    }
};

exports.getjob = async (req, res) => {
    try {
        const job = Job.findById(req.params.id);
        if (!job) console.log('job Could not been found!');

        console.log(job);

        res.status(200).json({
            status: 'success',
            data: {
                job,
            },
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching category!',
        });
    }
};
exports.updatejob = async (req, res) => {
    const updatedjob = Job.findByIdAndUpdate(req.params.id);

    res.status(200).json({
        status: 'success',
        data: {
            updatedjob,
        },
    });
};
exports.deletejob = async (req, res) => {
    const job = Job.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: {
            job,
        },
    });
};
