const getNextId = require('../utils/getNextId');

exports.getNextIdsForAllEntities = async (req, res) => {
    try {
        // Define all the entities and their respective prefixes
        const entities = [
            { entityName: 'category', prefix: 'CTID' },
            { entityName: 'company', prefix: 'CID' },
            { entityName: 'user', prefix: 'UID' },
            { entityName: 'jobs', prefix: 'JPID' },
            { entityName: 'tags', prefix: 'TGID' },
            { entityName: 'feedback', prefix: 'FDID' },
            { entityName: 'freelancer', prefix: 'FLID' },
            { entityName: 'faq', prefix: 'FID' },
        ];

        // Generate IDs for all entities
        const nextIds = {};
        for (const entity of entities) {
            nextIds[entity.entityName] = await getNextId(
                entity.entityName,
                entity.prefix
            );
        }

        res.status(200).json({
            status: 'success',
            data: nextIds,
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: `Error fetching next IDs: ${err.message}`,
        });
    }
};

exports.resetCounter = async (req, res) => {
    try {
        const { entityName } = req.body;

        // Update the sequence to 0 for the specified entity
        await Counter.updateOne(
            { entityName },
            { $set: { seq: 0 } },
            { upsert: true }
        );

        res.status(200).json({
            status: 'success',
            message: `Counter for ${entityName} reset to 0.`,
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: `Failed to reset counter: ${err.message}`,
        });
    }
};
