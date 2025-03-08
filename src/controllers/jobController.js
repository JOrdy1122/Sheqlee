const Job = require('../models/jobModel');
const getNextId = require('../utils/getNextId');
const moment = require('moment'); // Import moment.js
const Counter = require('./../models/counterModel');
const APIFeatures = require('./../utils/apiFeatures');
const Company = require('./../models/companyModel')
const Category = require('../models/categoryModel'); 
const Tag = require('../models/tagModel'); 


const Freelancer = require('../models/freelancerModel');


exports.toggleJobStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the job
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        // Toggle status: If active → inactive, if inactive → active
        job.status = job.status === 'active' ? 'inactive' : 'active';
        await job.save();

        res.status(200).json({
            success: true,
            message: `Job status updated to ${job.status}`,
            job,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

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
            status: 'active', 
        })
            .populate('company', 'companyName logo') 
            .populate('category', 'name') 
            .populate('tags', 'name'); 

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

const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    Birr: 'Br',
};

exports.getLatestJobs = async (req, res) => {
    try {
        const latestJobs = await Job.find({ status: 'active' })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('company', 'companyName -_id')
            .select('-__v');

        if (latestJobs.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No jobs available at the moment. Check back later!',
                jobs: [],
            });
        }

        // Format timestamps & replace currency with symbol
        const formattedJobs = latestJobs.map((job) => {
            const jobObj = job.toObject();
            return {
                ...jobObj,
                timeAgo: moment(job.createdAt).fromNow(),
                salary: {
                    ...jobObj.salary,
                    currency: currencySymbols[jobObj.salary.currency] || jobObj.salary.currency, // Replace with symbol
                },
            };
        });

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
        let nextJobId;
        try {
            nextJobId = await getNextId('jobs', 'JPID');
        } catch (err) {
            return res.status(500).json({
                status: 'fail',
                message: 'Error generating Job ID!',
            });
        }

        // Allow only 'draft' or 'active' status
        let { status } = req.body;
        if (!['draft', 'active'].includes(status)) {
            status = 'active'; 
        }

        req.body.job_id = nextJobId;
       

        const newJob = await Job.create(req.body);

        // Increment counter
        await Counter.findOneAndUpdate(
            { name: 'jobs' },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        );

        res.status(201).json({
            status: 'success',
            message: `Job ${status === 'draft' ? 'saved as draft' : 'posted successfully'}`,
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
exports.publishJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                status: 'fail',
                message: 'Job not found',
            });
        }

        if (job.status !== 'draft') {
            return res.status(400).json({
                status: 'fail',
                message: 'Only draft jobs can be published',
            });
        }

        job.status = 'active';
        await job.save();

        res.status(200).json({
            status: 'success',
            message: 'Job published successfully',
            data: { job },
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: `Error publishing job: ${err.message}`,
        });
    }
};
// exports.getAvailableJobs = async (req, res) => {
//     try {
//         let query = Job.find();

//         // Apply filtering and searching using APIFeatures
//         const features = new APIFeatures(query, req.query)
//             .filter()
//             .search();

//         // If no pagination is requested (no 'page' or 'limit' query params), return all jobs
//         if (!req.query.page && !req.query.limit) {
//             const jobs = await features.query
//                 .populate('company', 'companyName')
//                 .select('-__v');

//             return res.status(200).json({
//                 status: 'success',
//                 results: jobs.length,
//                 data: { jobs },
//             });
//         }

//         // Apply pagination if 'page' or 'limit' is provided in the query
//         features.paginate(12); // Default limit is 12 if no limit is provided in query

//         const jobs = await features.query
//             .populate('company', 'companyName')
//             .select('-__v');

//         // Count total jobs to calculate totalPages
//         const totalItems = await Job.countDocuments(); // Count all jobs

//         // Calculate totalPages
//         const totalPages = Math.ceil(totalItems / (req.query.limit || 12));

//         res.status(200).json({
//             status: 'success',
//             results: jobs.length,
//             totalPages: totalPages,
//             currentPage: req.query.page || 1, // Default to page 1 if not provided
//             totalItems: totalItems,
//             data: { jobs },
//         });
//     } catch (err) {
//         console.error('Error fetching jobs:', err);
//         res.status(500).json({
//             status: 'fail',
//             message: 'Error fetching available jobs',
//         });
//     }
// };
exports.getAvailableJobs = async (req, res) => {
    try {
        let query = Job.find();

        if (req.query.search) {
            const searchRegex = new RegExp(
                req.query.search,
                'i'
            ); // Case-insensitive search
            console.log(
                '🔍 Search Query:',
                req.query.search
            );

            // 🔍 Find matching categories based on `title`
            const categories = await Category.find({
                title: searchRegex,
            }).select('_id');
            const categoryIds = categories.map(
                (cat) => cat._id
            ); // Extract ObjectIds

            console.log(
                '🔍 Matched Categories:',
                categoryIds
            );

            // 🔍 Find matching tags based on `title`
            const tags = await Tag.find({
                title: searchRegex,
            }).select('_id');
            const tagIds = tags.map((tag) => tag._id);

            console.log('🔍 Matched Tags:', tagIds);

            if (
                categoryIds.length === 0 &&
                tagIds.length === 0
            ) {
                console.log(
                    '⚠️ No matching categories or tags found for:',
                    req.query.search
                );
            }

            // Update query to filter jobs by matching category or tag
            query = query.or([
                { category: { $in: categoryIds } }, // Category must match
                { skills: { $in: tagIds } }, // At least one tag must match
            ]);
        }

        console.log(
            '🛠️ Final MongoDB Query:',
            JSON.stringify(query.getFilter(), null, 2)
        );

        // Apply filtering and pagination
        const features = new APIFeatures(query, req.query)
            .filter()
            .paginate(12);

        const jobs = await features.query
            .populate('category', 'title')
            .populate('skills', 'title')
            .populate('company', 'companyName'),
            .populate('appliedFreelancers', 'name')
            .select('-__v');

        console.log('✅ Jobs Found:', jobs.length);
         // **Format timestamps just like `getLatestJobs`**
        const formattedJobs = jobs.map((job) => {
            const jobObj = job.toObject();
            return {
                ...jobObj,
                timeAgo: moment(job.createdAt).fromNow(), // Format timestamp
            };
        });

        res.status(200).json({
            status: 'success',
            results: formattedJobs.length,
            data: { jobs: formattedJobs }, // Send formatted jobs
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
        const job = Job.findById(req.params.id).select('-__v');
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
    try {
        const updatedjob = Job.findByIdAndUpdate(req.params.id);
    
        res.status(200).json({
            status: 'success',
            data: {
                updatedjob,
            },
        });
    } catch (err) {
        console.log('Error updating job',err)
        res.status(500).json({
            status: 'Fail',
            message: 'Error updating job'
        })
    }
};
exports.deletejob = async (req, res) => {
    try {
        const job = Job.findByIdAndDelete(req.params.id);
    
        res.status(204).json({
            status: 'success',
            data: {
                job,
            },
        });
    } catch(err){
        console.log('Error Deleting job',err),
        res.status(500).json({
            status: 'Fail',
            message: 'Error deleting job'
        })
    }
};
