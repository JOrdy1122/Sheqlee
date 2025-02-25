const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // ✅ Gmail SMTP service
        auth: {
            user: process.env.EMAIL_USERNAME, // ✅ Uses .env
            pass: process.env.EMAIL_PASSWORD, // ✅ Uses .env
        },
        tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
        from: `Sheqlee Support <${process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
