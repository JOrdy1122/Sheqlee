const getSubscriptionStats = require('../utils/subscriptionStats');
const Company = require('../models/companyModel');
const Category = require('../models/categoryModel');
const Tag = require('../models/tagModel');

exports.getAllSubscriptionStats = async (req, res) => {
    try {
        const year =
            Number(req.query.year) ||
            new Date().getFullYear();
        const month =
            Number(req.query.month) ||
            new Date().getMonth() + 1;

        const companyStats = await getSubscriptionStats(
            Company,
            'registeredAt',
            year,
            month
        );
        const categoryStats = await getSubscriptionStats(
            Category,
            'createdAt',
            year,
            month
        );
        const tagStats = await getSubscriptionStats(
            Tag,
            'createdAt',
            year,
            month
        );

        res.status(200).json({
            status: 'success',
            data: {
                companies: companyStats,
                categories: categoryStats,
                tags: tagStats,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};
