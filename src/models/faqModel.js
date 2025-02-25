const mongoose = require('mongoose');

const faqSchema = mongoose.Schema({
    // for the display id the second id
    faq_id: {
        type: String,
        required: [true, 'Custom faq_id is required!'],
        unique: true,
    },
    audience: {
        type: String,
        required: [true, 'Audience is required for FAQ !'],
        enum: ['freelancer', 'companies'],
        default: [],
    },
    question: {
        type: String,
        required: [true, 'Questions are required !'],
        // trim: true
    },
    answers: {
        type: String,
        required: [true, 'answers are required'],
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
