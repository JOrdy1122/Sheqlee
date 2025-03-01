class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = [
            'search',
            'sort',
            'page',
            'limit',
        ];
        excludedFields.forEach((el) => delete queryObj[el]);

        if (queryObj.date) {
            const dateFilter = {};
            if (queryObj.date.gte)
                dateFilter.$gte = new Date(
                    queryObj.date.gte
                );
            if (queryObj.date.lte)
                dateFilter.$lte = new Date(
                    queryObj.date.lte
                );
            queryObj.createdAt = dateFilter;
            delete queryObj.date;
        }

        this.query = this.query.find(queryObj);
        return this;
    }

    search() {
        if (this.queryString.search) {
            const searchRegex = new RegExp(
                this.queryString.search,
                'i'
            );
            this.query = this.query.find({
                $or: [
                    { title: searchRegex },
                    { 'company.companyName': searchRegex },
                    { skills: searchRegex },
                    { category: searchRegex },
                ],
            });
        }
        return this;
    }

    // sort() {
    //     if (this.queryString.sort) {
    //         const sortBy = this.queryString.sort
    //             .split(',')
    //             .join(' ');
    //         this.query = this.query.sort(sortBy);
    //     } else {
    //         this.query = this.query.sort('-createdAt');
    //     }
    //     return this;
    // }

    paginate(defaultLimit = 10) {
        const page = Number(this.queryString.page) || 1;
        const limit =
            Number(this.queryString.limit) || defaultLimit; // Use provided limit or default
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
    paginate(defaultLimit = 7) {
        const page = Number(this.queryString.page) || 1;
        const limit =
            Number(this.queryString.limit) || defaultLimit; // Use provided limit or default
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;
