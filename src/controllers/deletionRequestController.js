const DeletionRequest = require('../models/deletionRequestModel');
const AccountService = require('../services/accountServices');

exports.createDeletionRequest = async (req, res) => {
    try {
        const { accountId, role, reason } = req.body;

        // Check if a similar pending request exists
        const existingRequest =
            await DeletionRequest.findOne({
                accountId,
                status: 'pending',
            });

        if (existingRequest) {
            return res.status(400).json({
                status: 'fail',
                message:
                    'A pending deletion request already exists for this account.',
            });
        }

        // Create a new deletion request
        const newRequest = await DeletionRequest.create({
            accountId,
            role,
            reason,
            status: 'pending', // Default status
        });

        res.status(201).json({
            status: 'success',
            data: {
                deletionRequest: newRequest,
            },
        });
    } catch (err) {
        console.error(
            'Error creating deletion request:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Could not create deletion request.',
        });
    }
};

exports.getAllDeletionRequests = async (req, res) => {
    try {
        // Fetch all deletion requests, including the account details if needed
        const deletionRequests =
            await DeletionRequest.find()
                .populate({
                    path: 'accountId', // Populates the related account (Freelancer or Client)
                    select: 'name email role', // Adjust fields based on requirements
                })
                .sort({ createdAt: -1 }); // Sort by most recent first

        // Return the list of deletion requests
        res.status(200).json({
            status: 'success',
            data: {
                deletionRequests,
            },
        });
    } catch (err) {
        console.error(
            'Error fetching deletion requests:',
            err
        );
        res.status(500).json({
            status: 'error',
            message: 'Could not fetch deletion requests.',
        });
    }
};

exports.updateDeletionRequest = async (req, res) => {
    try {
        const { id } = req.params; // Deletion request ID
        const { status } = req.body; // Status: 'approved' or 'rejected'

        const request = await DeletionRequest.findById(id);
        if (!request) {
            return res.status(404).json({
                status: 'fail',
                message: 'Deletion request not found.',
            });
        }

        request.status = status;
        await request.save();

        if (status === 'approved') {
            // Use the service layer to handle deletion
            if (request.role === 'Freelancer') {
                await AccountService.deleteFreelancer(
                    request.accountId
                );
            } else if (request.role === 'Client') {
                await AccountService.deleteClient(
                    request.accountId
                );
            }

            return res.status(200).json({
                status: 'success',
                message:
                    'Deletion request approved. Account deleted successfully.',
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Deletion request rejected.',
        });
    } catch (err) {
        console.error(
            'Error updating deletion request:',
            err
        );
        res.status(500).json({
            status: 'error',
            message: 'Could not update deletion request.',
        });
    }
};
