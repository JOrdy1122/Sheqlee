const Freelancer = require('./../models/freelancerModel');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Jobs = require('../models/jobModel');
const ApiFeatures = require('../utils/apiFeatures');


exports.getFreelancerDashboard = async (req, res) => {
    try {
        const { userId } = req.user;

        // Fetch the freelancer with subscriptions populated
        const freelancer = await Freelancer.findById(userId).populate([
            'subscribedCategories',
            'subscribedTags',
            'subscribedCompanies'
        ]);

        if (!freelancer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Freelancer not found!',
            });
        }

        // Get subscription IDs
        const categoryIds = freelancer.subscribedCategories.map(cat => cat._id);
        const tagIds = freelancer.subscribedTags.map(tag => tag._id);
        const companyIds = freelancer.subscribedCompanies.map(comp => comp._id);

        // Find jobs that match any of the subscriptions
        const jobs = await Jobs.find({
            $or: [
                { category: { $in: categoryIds } },
                { tags: { $in: tagIds } },
                { company: { $in: companyIds } }
            ]
        }).populate('company', 'name') // Populate company name
        .populate('tags', 'name');  // Populate tag names

        // Enhance job data: Check applied & favorite jobs
        const enrichedJobs = jobs.map(job => ({
            ...job.toObject(),
            isApplied: freelancer.appliedJobs.includes(job._id),
            isFavorite: freelancer.favorites.includes(job._id),
        }));

        res.status(200).json({
            status: 'success',
            totalJobs: enrichedJobs.length,
            data: {
                jobs: enrichedJobs,
                subscriptions: {
                    categories: freelancer.subscribedCategories,
                    tags: freelancer.subscribedTags,
                    companies: freelancer.subscribedCompanies
                }
            }
        });
    } catch (err) {
        console.error('Error fetching freelancer dashboard:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching freelancer dashboard!',
        });
    }
};


exports.toggleTagSubscription = async (req, res) => {
    try {
        const { userId } = req.user; 
        const { tagId } = req.body; 

        if (!tagId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Tag ID is required!',
            });
        }

        // Find the freelancer
        const freelancer =
            await Freelancer.findById(userId);
        if (!freelancer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Freelancer not found!',
            });
        }

        // Toggle the tag subscription
        const subscribedTagsSet = new Set(
            freelancer.subscribedTags.map((id) =>
                id.toString()
            )
        );

        if (subscribedTagsSet.has(tagId)) {
            subscribedTagsSet.delete(tagId); // Unsubscribe
        } else {
            subscribedTagsSet.add(tagId); // Subscribe
        }

        // Update freelancer subscriptions
        const updatedFreelancer =
            await Freelancer.findByIdAndUpdate(
                userId,
                {
                    subscribedTags: Array.from(
                        subscribedTagsSet
                    ),
                },
                { new: true, runValidators: false }
            );

        res.status(200).json({
            status: 'success',
            message: `Successfully ${subscribedTagsSet.has(tagId) ? 'subscribed to' : 'unsubscribed from'} tag!`,
            data: updatedFreelancer.subscribedTags,
        });
    } catch (err) {
        console.error(
            ' Error toggling tag subscription:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error toggling tag subscription!',
        });
    }
};

exports.toggleCategorySubscription = async (req, res) => {
    try {
        const { userId } = req.user; // Extract the logged-in freelancer's ID
        const { categoryId } = req.body; // Get the category ID from request body

        if (!categoryId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Category ID is required!',
            });
        }

        // Find the freelancer
        const freelancer =
            await Freelancer.findById(userId);
        if (!freelancer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Freelancer not found!',
            });
        }

        // Toggle the category subscription
        const subscribedCategoriesSet = new Set(
            freelancer.subscribedCategories.map((id) =>
                id.toString()
            )
        );

        if (subscribedCategoriesSet.has(categoryId)) {
            subscribedCategoriesSet.delete(categoryId); // Unsubscribe
        } else {
            subscribedCategoriesSet.add(categoryId); // Subscribe
        }

        // Update freelancer subscriptions
        const updatedFreelancer =
            await Freelancer.findByIdAndUpdate(
                userId,
                {
                    subscribedCategories: Array.from(
                        subscribedCategoriesSet
                    ),
                },
                { new: true, runValidators: false }
            );

        res.status(200).json({
            status: 'success',
            message: `Successfully ${subscribedCategoriesSet.has(categoryId) ? 'subscribed to' : 'unsubscribed from'} category!`,
            data: updatedFreelancer.subscribedCategories,
        });
    } catch (err) {
        console.error(
            ' Error toggling category subscription:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message:
                'Error toggling category subscription!',
        });
    }
};

exports.toggleApplyJob = async (req, res) => {
    try {
        const { userId } = req.user;
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Job ID is required!',
            });
        }

        // Find the freelancer
        const freelancer =
            await Freelancer.findById(userId);
        if (!freelancer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Freelancer not found!',
            });
        }

        // Check if the job is already applied for
        const isApplied =
            freelancer.appliedJobs.includes(jobId);

        // Update appliedJobs using $pull or $addToSet
        const updatedFreelancer =
            await Freelancer.findByIdAndUpdate(
                userId,
                isApplied
                    ? { $pull: { appliedJobs: jobId } } // Remove from applied jobs
                    : { $addToSet: { appliedJobs: jobId } }, // Add to applied jobs if not already present
                { new: true, runValidators: false } // Prevents validation errors like `passwordConfirm`
            );

        res.status(200).json({
            status: 'success',
            message: isApplied
                ? 'Job application canceled!'
                : 'Job successfully applied!',
            appliedJobs: updatedFreelancer.appliedJobs, // Return updated applied jobs
        });
    } catch (err) {
        console.error(
            ' Error updating applied jobs:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error updating applied jobs!',
        });
    }
};

exports.getAppliedJobs = async (req, res) => {
    try {
        const { userId } = req.user; // Freelancer ID

        // Fetch freelancer and populate applied jobs
        const freelancer =
            await Freelancer.findById(userId).populate(
                'appliedJobs', '-__v'
            );

        if (!freelancer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Freelancer not found!',
            });
        }

        res.status(200).json({
            status: 'success',
            result: freelancer.appliedJobs.length, 
            data: freelancer.appliedJobs, 
        });
    } catch (err) {
        console.error(
            ' Error fetching applied jobs:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching applied jobs!',
        });
    }
};

exports.toggleFavoriteJob = async (req, res) => {
    try {
        const { userId } = req.user;
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Job ID is required!',
            });
        }

        // Use $pull to remove if exists, $addToSet to add if not
        const freelancer =
            await Freelancer.findById(userId);
        if (!freelancer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Freelancer not found!',
            });
        }

        const isFavorited =
            freelancer.favorites.includes(jobId);

        const updatedFreelancer =
            await Freelancer.findByIdAndUpdate(
                userId,
                isFavorited
                    ? { $pull: { favorites: jobId } } 
                    : { $addToSet: { favorites: jobId } }, 
                { new: true, runValidators: false } // 
            );

        res.status(200).json({
            status: 'success',
            message: isFavorited
                ? 'Job removed from favorites!'
                : 'Job added to favorites!',
            data: updatedFreelancer.favorites, 
        });
    } catch (err) {
        console.error(
            ' Error updating favorite jobs:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error updating favorite jobs!',
        });
    }
};

// Get Favorite Jobs List
exports.getFavoriteJobs = async (req, res) => {
    try {
        const { userId } = req.user;

        const freelancer =
            await Freelancer.findById(userId).populate(
                'favorites'
            );

        if (!freelancer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Freelancer not found!',
            });
        }

        res.status(200).json({
            status: 'success',
            results: freelancer.favorites.length,
            data: freelancer.favorites,
        });
    } catch (err) {
        console.error(
            ' Error fetching favorite jobs:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching favorite jobs!',
        });
    }
};

exports.toggleFreelancerAction = async (req, res) => {
    try {
        const freelancer = await Freelancer.findById(
            req.params.id
        );

        if (!freelancer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Freelancer not found!',
            });
        }

        // Toggle action status
        freelancer.action =
            freelancer.action === 'active'
                ? 'inactive'
                : 'active';

        await freelancer.save(); // Save the updated status

        res.status(200).json({
            status: 'success',
            message: `Freelancer is now ${freelancer.action}!`,
            data: { freelancer },
        });
    } catch (err) {
        console.error(
            'Error toggling freelancer status:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error toggling freelancer status!',
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const freelancer = await Freelancer.findOne({
            email: req.body.email,
        });

        if (!freelancer) {
            return res.status(404).json({
                status: 'fail',
                message:
                    'No freelancer found with this email!',
            });
        }

        // Generate password reset code
        const resetCode =
            freelancer.createPasswordResetCode();
        await freelancer.save({
            validateBeforeSave: false,
        });

        // Send email with reset code
        const message = `Your password reset code is: ${resetCode}. This code will expire in 10 minutes.`;

        await sendEmail({
            email: freelancer.email,
            subject: 'Password Reset Code',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Reset code sent to email!',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'fail',
            message:
                'Error processing password reset request!',
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const hashedCode = crypto
            .createHash('sha256')
            .update(req.body.passwordResetCode)
            .digest('hex');

        const freelancer = await Freelancer.findOne({
            passwordResetCode: hashedCode,
            passwordResetCodeExpires: { $gt: Date.now() },
        });

        if (!freelancer) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid or expired reset code!',
            });
        }

        // Update password
        freelancer.password = req.body.password;
        freelancer.passwordConfirm =
            req.body.passwordConfirm;
        freelancer.passwordResetCode = undefined;
        freelancer.passwordResetCodeExpires = undefined;
        await freelancer.save();

        res.status(200).json({
            status: 'success',
            message: 'Password reset successfully!',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'fail',
            message: 'Error resetting password!',
        });
    }
};
exports.toggleCompanySubscription = async (req, res) => {
    try {
        const { userId } = req.user; 
        const { companyId } = req.body; 

        if (!companyId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Company ID is required!',
            });
        }

        // Find freelancer
        const freelancer = await Freelancer.findById(userId);
        if (!freelancer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Freelancer not found!',
            });
        }

        // Convert subscribedCompanies to a Set for toggle logic
        const subscribedCompaniesSet = new Set(freelancer.subscribedCompanies.map(id => id.toString()));

        if (subscribedCompaniesSet.has(companyId)) {
            subscribedCompaniesSet.delete(companyId); // Unsubscribe
        } else {
            subscribedCompaniesSet.add(companyId); // Subscribe
        }

        // Update freelancer with the new list of subscribed companies
        freelancer.subscribedCompanies = Array.from(subscribedCompaniesSet);
        await freelancer.save();

        res.status(200).json({
            status: 'success',
            message: subscribedCompaniesSet.has(companyId)
                ? 'Successfully subscribed to company!'
                : 'Successfully unsubscribed from company!',
            data: freelancer.subscribedCompanies,
        });
    } catch (error) {
        console.error('Error toggling company subscription:', error);
        res.status(500).json({
            status: 'fail',
            message: 'Error toggling company subscription!',
        });
    }
};


exports.getAllFreelancers = async (req, res) => {
    try {
        let query = Freelancer.find();

        // Apply filtering, searching, sorting, and pagination
        const apiFeatures = new ApiFeatures(
            query,
            req.query
        )
            .filter() // Apply dropdown filters
            .search(['name', 'email']) // Search by name or email
            .paginate(); // Apply pagination (12 per page)

        const freelancers = await apiFeatures.query.select('-__v');

        res.status(200).json({
            status: 'success',
            results: freelancers.length,
            data: { freelancers },
        });
    } catch (err) {
        console.error('Error fetching freelancers:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching freelancers.',
        });
    }
};

exports.getFreelancer = async (req, res) => {
    try {
        const freelancer = await Freelancer.findById(
            req.params.id
        );
        if (!freelancer)
            console.log('Freelancer Could not been found!');

        console.log(freelancer);

        res.status(200).json({
            status: 'success',
            data: {
                freelancer,
            },
        });
    } catch (err) {
        console.log('ERROR Fetching category: ', err);
        res.status(500).json({
            status: 'Fail',
            message: ' Freelancer not found!',
        });
    }
};

exports.updateFreelancer = async (req, res) => {
    try {
        let updateData = { ...req.body }; // Clone request body

        // Handle Image Upload (Create/Update)
        if (req.files && req.files.image) {
            updateData.image = `/uploads/${req.files.image[0].filename}`;
        }

        // Handle CV Upload (Create/Update)
        if (req.files && req.files.cvFile) {
            updateData.cvFile = `/uploads/${req.files.cvFile[0].filename}`;
        }

        // Update freelancer details
        const updatedFreelancer =
            await Freelancer.findByIdAndUpdate(
                req.params.id,
                updateData, // Pass modified data
                {
                    new: true, // Return updated document
                    runValidators: true, // Validate fields
                    upsert: true, // Create if doesn't exist
                }
            );

        if (!updatedFreelancer) {
            return res.status(404).json({
                status: 'fail',
                message: 'Freelancer not found.',
            });
        }

        res.status(200).json({
            status: 'success!',
            message: 'Freelancer updated successfully!',
            data: {
                freelancer: updatedFreelancer,
            },
        });
    } catch (err) {
        console.error('ERROR updating Freelancer: ', err);
        res.status(500).json({
            status: 'fail',
            message: 'ERROR updating the freelancer!',
        });
    }
};

exports.deleteFreelancer = async (req, res) => {
    try {
        const freelancer = Freelancer.findByIdAndDelete(
            req.params.id
        );

        res.status(204).json({
            status: 'success',
            data: {
                freelancer,
            },
        });
    } catch (err) {
        console.log('Error deleting a Freelancer ', err);
        res.status(500).json({
            status: 'Fail',
            message: 'Error Deleting a Freelancer',
        });
    }
};
