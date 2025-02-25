const mongoose = require('mongoose');
const Counter = require('./../models/counterModel');

exports.clearCollectionAndResetCounter = async (
    req,
    res
) => {
    try {
        const { entityName, modelName } = req.body;

        // Validate input
        if (!entityName || !modelName) {
            return res.status(400).json({
                status: 'fail',
                message:
                    'Both entityName and modelName are required.',
            });
        }

        // Get the model dynamically
        const Model = mongoose.model(modelName);
        if (!Model) {
            return res.status(404).json({
                status: 'fail',
                message: `Model ${modelName} not found.`,
            });
        }

        // Clear the specified collection
        await Model.deleteMany();

        // Reset the counter for the given entity
        await Counter.updateOne(
            { entityName },
            { $set: { seq: 0 } },
            { upsert: true }
        );

        res.status(200).json({
            status: 'success',
            message: `Collection ${modelName} cleared and counter for ${entityName} reset.`,
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: `Error clearing collection and resetting counter: ${err.message}`,
        });
    }
};
