const mongoose = require('mongoose');

/////   TO be Rechecked when working with Nodemail

const emailAlertSchema = new mongoose.Schema({
    alert_id: {
        type: String,
        required: true,
        unique: true,
    },
    recipientType: {
        type: String,
        required: true,
        enum: ['freelancer', 'company'], // Define if the recipient is a freelancer or a company
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientType', // Dynamically reference based on recipientType
    },
    emailType: {
        type: String,
        required: true,
        enum: [
            'resetPassword',
            'jobApplication',
            'subscriptionNotification',
            'general',
        ], // Types of emails
    },
    subject: {
        type: String,
        required: true,
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['sent', 'failed'],
        default: 'sent',
    },
    errorDetails: {
        type: String, // Optional field to store error messages in case of failure
        default: null,
    },
});

const EmailAlert = mongoose.model(
    'EmailAlert',
    emailAlertSchema
);

module.exports = EmailAlert;
