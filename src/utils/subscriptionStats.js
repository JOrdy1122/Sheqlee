const getSubscriptionStats = async (
    Model,
    dateField,
    year,
    month
) => {
    const totalSubs = await Model.aggregate([
        {
            $project: {
                subsCount: { $size: '$subscribers' },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$subsCount' },
            },
        },
    ]);

    const yearSubs = await Model.aggregate([
        {
            $match: {
                [dateField]: {
                    $gte: new Date(year, 0, 1),
                    $lt: new Date(year + 1, 0, 1),
                },
            },
        },
        {
            $project: {
                subsCount: { $size: '$subscribers' },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$subsCount' },
            },
        },
    ]);

    const monthSubs = await Model.aggregate([
        {
            $match: {
                [dateField]: {
                    $gte: new Date(year, month - 1, 1),
                    $lt: new Date(year, month, 1),
                },
            },
        },
        {
            $project: {
                subsCount: { $size: '$subscribers' },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$subsCount' },
            },
        },
    ]);

    const thisYearStart = new Date(
        new Date().getFullYear(),
        0,
        1
    );
    const thisMonthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );

    const thisYearSubs = await Model.aggregate([
        {
            $match: {
                [dateField]: { $gte: thisYearStart },
            },
        },
        {
            $project: {
                subsCount: { $size: '$subscribers' },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$subsCount' },
            },
        },
    ]);

    const thisMonthSubs = await Model.aggregate([
        {
            $match: {
                [dateField]: { $gte: thisMonthStart },
            },
        },
        {
            $project: {
                subsCount: { $size: '$subscribers' },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$subsCount' },
            },
        },
    ]);

    return {
        totalSubscriptions: totalSubs[0]?.total || 0,
        yearSubscriptions: yearSubs[0]?.total || 0,
        monthSubscriptions: monthSubs[0]?.total || 0,
        thisYearSubscriptions: thisYearSubs[0]?.total || 0,
        thisMonthSubscriptions:
            thisMonthSubs[0]?.total || 0,
    };
};

module.exports = getSubscriptionStats;
