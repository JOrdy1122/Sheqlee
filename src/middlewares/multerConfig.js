const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// ✅ Set Multer Storage (Memory instead of Disk for Images)
const storage = multer.memoryStorage(); // Store image in memory before processing

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
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
    },
});

// const processImage = async (req, res, next) => {
//     if (!req.file) return next();

//     const ext = 'jpeg'; // Standardize image format
//     const entityPrefix = req.user
//         ? `user-${req.user.userId}`
//         : `file`;

//     const filename = `${entityPrefix}-${Date.now()}.${ext}`;
//     req.file.filename = filename;

//     const outputPath = path.join(
//         __dirname,
//         '../uploads/profile_pictures',
//         filename
//     );

//     // ✅ Resize, Convert, & Save Image using sharp
//     await sharp(req.file.buffer)
//         .resize(250, 250) // Resize to 250x250
//         .toFormat(ext)
//         .jpeg({ quality: 80 }) // Convert & compress
//         .toFile(outputPath);

//     req.file.path = `/uploads/profile_pictures/${filename}`; // Store path for DB
//     next();
// };

const processImage = async (req, res, next) => {
    if (!req.file) {
        console.log("No file received!");
        return next();
    }

    console.log("Received file:", req.file);

    const ext = 'jpeg'; // Standardize image format
    const entityPrefix = req.user ? `user-${req.user.userId}` : `file`;

    const filename = `${entityPrefix}-${Date.now()}.${ext}`;
    req.file.filename = filename; // ✅ Assign a filename

    const outputPath = path.join(
        __dirname,
        '../uploads/profile_pictures',
        filename
    );

    try {
        // ✅ Resize, Convert, & Save Image using sharp
        await sharp(req.file.buffer)
            .resize(250, 250)
            .toFormat(ext)
            .jpeg({ quality: 80 }) // Convert & compress
            .toFile(outputPath);

        // ✅ Store correct path in `req.file`
        req.file.path = `/uploads/profile_pictures/${filename}`;  

        console.log("Processed image path:", req.file.path);

        // ✅ Assign correct file path to DB field
        req.body.image = req.file.path;

        next();
    } catch (error) {
        console.error("Error processing image:", error);
        return res.status(500).json({ message: "Image processing failed!" });
    }
};

module.exports = { upload, processImage };
