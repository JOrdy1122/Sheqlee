const Counter = require('../models/counterModel');

const getNextId = async (entityName, prefix) => {
    try {
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
