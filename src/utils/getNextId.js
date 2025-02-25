const Counter = require('../models/counterModel');

/**
 * Fetches and increments the next ID for a given entity
 * @param {String} entityName - The name of the entity (e.g., 'categories', 'jobs')
 * @param {String} prefix - The prefix for the ID (e.g., 'CTID', 'JOB')
 * @returns {String} - The next formatted ID (e.g., 'CTID001')
 */
const getNextId = async (entityName, prefix) => {
    try {
        // const counter = await Counter.findOneAndUpdate(
        //     { name: entityName },
        //     { $inc: { value: 1 } },
        //     { new: true, upsert: true } // Increment or create if it doesn't exist
        // );

        // const nextId = `${prefix}${String(counter.value).padStart(3, '0')}`;
        // return nextId;

        const counter = await Counter.findOne({
            name: entityName,
        });
        const currentValue = counter ? counter.value : 0;

        // Return the formatted ID without incrementing
        return `${prefix}${String(currentValue + 1).padStart(4, '0')}`;
    } catch (err) {
        throw new Error(
            `Error generating ID for ${entityName}: ${err.message}`
        );
    }
};

module.exports = getNextId;
