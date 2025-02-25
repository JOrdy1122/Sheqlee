const EmailAlert = require('../models/emailAlertModel');

exports.sendEmailAndLog = async (req, res) => {
    const {
        recipientType,
        recipientId,
        emailType,
        subject,
    } = req.body;

    try {
        // Send email logic (integrate with nodemailer, SendGrid, etc.)
        // Example: await sendEmail(recipientEmail, subject, body);

        // Log the email alert
        const newAlert = await EmailAlert.create({
            alert_id: `alert_${Date.now()}`,
            recipientType,
            recipientId,
            emailType,
            subject,
        });

        res.status(201).json({
            status: 'success',
            message: 'Email sent and logged successfully!',
            data: newAlert,
        });
    } catch (err) {
        console.error('Error sending email:', err);

        // Log the failure
        await EmailAlert.create({
            alert_id: `alert_${Date.now()}`,
            recipientType,
            recipientId,
            emailType,
            subject,
            status: 'failed',
            errorDetails: err.message,
        });

        res.status(500).json({
            status: 'fail',
            message: 'Failed to send email.',
        });
    }
};
