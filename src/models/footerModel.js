const mongoose = require('mongoose');

// Footer Schema
const footerSchema = new mongoose.Schema({
    section: {
        type: String,
        required: [true, 'Footer section is required'],
        trim: true,
    },
    content: {
        type: String,
        required: [true, 'Footer content is required'],
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set creation date
    },
});

const Footer = mongoose.model('Footer', footerSchema);

module.exports = Footer;
