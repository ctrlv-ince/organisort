const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER?.trim();
const SMTP_PASS = process.env.SMTP_PASS?.replace(/\s+/g, '');
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL?.trim() || SMTP_USER;
const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 10000);

let transporter = null;

/**
 * Sends an email using nodemailer.
 *
 * @param {Object} options
 * @param {string} options.recipientEmail
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.textFallback]
 * @returns {Promise<void>}
 */
const sendEmail = async ({ recipientEmail, subject, html, textFallback }) => {
    if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
        throw new Error('SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL are required to send emails');
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
            connectionTimeout: SMTP_TIMEOUT_MS,
            greetingTimeout: SMTP_TIMEOUT_MS,
            socketTimeout: SMTP_TIMEOUT_MS,
        });
    }

    try {
        await transporter.sendMail({
            from: `"OrganiSort" <${SMTP_FROM_EMAIL}>`,
            to: recipientEmail,
            subject: subject,
            text: textFallback || 'Please view this email in a client that supports HTML',
            html: html,
        });
        console.log(`[email.js] Email successfully sent to ${recipientEmail}`);
    } catch (error) {
        console.error('[email.js] Failed to send email via SMTP:', error);
        const err = new Error('Unable to send email via SMTP. Check SMTP credentials (for Gmail use an app password) and sender configuration.');
        err.statusCode = 502;
        err.cause = error;
        throw err;
    }
};

module.exports = {
    sendEmail,
};
