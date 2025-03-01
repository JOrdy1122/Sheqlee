const Freelancer = require('../models/freelancerModel');
const Company = require('../models/companyModel');
const DeletionRequest = require('../models/deletionRequestModel'); // Import the deletion request model
const dotenv = require('dotenv');

dotenv.config();

const DELETION_PERIOD =
    parseInt(process.env.DELETION_REQUEST_PERIOD, 10) || 30; // Default 30 days

class AccountService {
    /**
     * Request deletion for a freelancer or company
     */
    static async requestDeletion(accountId, role, reason) {
        // Check if a deletion request already exists
        const existingRequest =
            await DeletionRequest.findOne({
                account_Id: accountId,
                role,
            });
        if (existingRequest) {
            throw new Error(
                'Deletion request already submitted.'
            );
        }

        // Calculate the deletion date (30 days from now)
        const scheduledDeletionDate = new Date();
        scheduledDeletionDate.setDate(
            scheduledDeletionDate.getDate() +
                DELETION_PERIOD
        );

        // Create deletion request
        const deletionRequest =
            await DeletionRequest.create({
                account_Id: accountId,
                role,
                reason,
                scheduledDeletionDate, // New field
            });

        // Update user status to inactive
        if (role === 'Freelancer') {
            await Freelancer.findByIdAndUpdate(accountId, {
                status: 'inactive',
            });
        } else if (role === 'Company') {
            await Company.findByIdAndUpdate(accountId, {
                status: 'inactive',
            });
        }

        console.log(
            `Deletion request created for ${role} with ID: ${accountId}.`
        );

        return deletionRequest;
    }

    /**
     * Process deletion requests and delete users after 30 days if they remain inactive
     */
    static async processDeletionRequests() {
        const now = new Date();

        // Find all requests where the scheduled deletion date has passed
        const requests = await DeletionRequest.find({
            scheduledDeletionDate: { $lte: now },
        });

        for (const request of requests) {
            const Model =
                request.role === 'Freelancer'
                    ? Freelancer
                    : Company;
            const user = await Model.findById(
                request.account_Id
            );

            // ✅ Only delete if the user is still inactive
            if (user && user.status === 'inactive') {
                await Model.findByIdAndDelete(
                    request.account_Id
                );
                console.log(
                    `✅ Deleted ${request.role} with ID: ${request.account_Id}`
                );
                await DeletionRequest.findByIdAndDelete(
                    request._id
                ); // Remove deletion request
            }
        }
    }

    /**
     * Cancel deletion request if the user logs in within 30 days
     */
    static async cancelDeletionRequest(accountId) {
        const deletionRequest =
            await DeletionRequest.findOne({
                account_Id: accountId,
            });

        if (deletionRequest) {
            await DeletionRequest.deleteOne({
                account_Id: accountId,
            }); // Remove request

            // Restore user status to active
            if (deletionRequest.role === 'Freelancer') {
                await Freelancer.findByIdAndUpdate(
                    accountId,
                    { status: 'active' }
                );
            } else if (deletionRequest.role === 'Company') {
                await Company.findByIdAndUpdate(accountId, {
                    status: 'active',
                });
            }

            console.log(
                `🚀 Deletion request canceled for ${deletionRequest.role} with ID: ${accountId}`
            );
        }
    }
}

module.exports = AccountService;
