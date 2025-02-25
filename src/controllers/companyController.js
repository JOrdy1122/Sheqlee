const Company = require('./../models/companyModel');

exports.toggleCompanyAction = async (req, res) => {
    try {
        const { id } = req.params;

        // Step 1: Find company by ID
        const company = await Company.findById(id);
        if (!company) {
            return res.status(404).json({
                status: 'fail',
                message: 'Company not found!',
            });
        }

        // Step 2: Toggle action status
        company.action =
            company.action === 'active'
                ? 'inactive'
                : 'active';
        await company.save();

        // Step 3: Respond with success
        res.status(200).json({
            status: 'success',
            message: `Company action set to ${company.action}`,
            data: { company },
        });
    } catch (err) {
        console.error(
            '❌ Error updating company action:',
            err
        );
        res.status(500).json({
            status: 'fail',
            message: 'Error updating company action!',
        });
    }
};

// Get All Companies
exports.getAllCompanies = async (req, res) => {
    try {
        const companies =
            await Company.find().populate('subscribers');

        res.status(200).json({
            status: 'success',
            results: companies.length,
            data: {
                companies,
            },
        });
    } catch (err) {
        console.error('Error fetching companies:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching companies.',
        });
    }
};

// Get Single Company
exports.getCompany = async (req, res) => {
    try {
        const company = await Company.findById(
            req.params.id
        ).populate('subscribers');

        if (!company) {
            return res.status(404).json({
                status: 'fail',
                message: 'Company not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                company,
            },
        });
    } catch (err) {
        console.error('Error fetching company:', err);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching company.',
        });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        let updateData = { ...req.body }; // Clone request body

        // ✅ Handle Logo Upload (Create/Update)
        if (req.file) {
            updateData.logo = `/uploads/${req.file.filename}`;
        }

        // ✅ Update company details
        const updatedCompany =
            await Company.findByIdAndUpdate(
                req.params.id,
                updateData, // Pass modified data
                {
                    new: true, // Return updated document
                    runValidators: true, // Validate fields
                    upsert: true, // Create if doesn't exist
                }
            );

        if (!updatedCompany) {
            return res.status(404).json({
                status: 'fail',
                message: 'Company not found.',
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Company updated successfully!',
            data: {
                company: updatedCompany,
            },
        });
    } catch (err) {
        console.error('ERROR updating Company: ', err);
        res.status(500).json({
            status: 'fail',
            message: 'ERROR updating the company!',
        });
    }
};

exports.createJobPosts = async (req, res) => {
    res.status(200).json({
        status: 'success',
        message: ' This route has not been created yet!',
    });
};
