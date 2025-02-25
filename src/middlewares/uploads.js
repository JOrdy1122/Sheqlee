const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'image') {
            cb(null, 'uploads/profile_pictures/'); // Profile pictures
        } else if (file.fieldname === 'cvFile') {
            cb(null, 'uploads/cvs/'); // Freelancer CVs
        } else if (file.fieldname === 'companyFile') {
            cb(null, 'uploads/company_files/'); // Company files
        } else {
            cb(new Error('Invalid file field'), false);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                '-' +
                uniqueSuffix +
                path.extname(file.originalname)
        );
    },
});

// File filter (Only allow images for profile pics & PDFs for CVs)
const fileFilter = (req, file, cb) => {
    if (
        file.fieldname === 'image' &&
        !file.mimetype.startsWith('image/')
    ) {
        return cb(
            new Error(
                'Only images are allowed for profile pictures!'
            ),
            false
        );
    } else if (
        file.fieldname === 'cvFile' &&
        file.mimetype !== 'application/pdf'
    ) {
        return cb(
            new Error(
                'Only PDF files are allowed for CVs!'
            ),
            false
        );
    }
    cb(null, true);
};

// Set file size limits (2MB for profile pics, 5MB for CVs)
const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB max
};

// Multer configuration
const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
