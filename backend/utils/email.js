const axios = require('axios');

const WEBAPP_URL = (process.env.WEBAPP_URL || 'http://localhost:5173').replace(/\/+$/, '');
const EMAIL_PROXY_SECRET = process.env.EMAIL_PROXY_SECRET?.trim();

/**
 * Sends an email by proxying through the Vercel serverless function.
 * HuggingFace blocks SMTP ports, so the actual nodemailer sending
 * happens on the Vercel side where SMTP is allowed.
 *
 * @param {Object} options
 * @param {string} options.recipientEmail
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.textFallback]
 * @returns {Promise<void>}
 */
const sendEmail = async ({ recipientEmail, subject, html, textFallback }) => {
    if (!EMAIL_PROXY_SECRET) {
        throw new Error('EMAIL_PROXY_SECRET is required to send emails');
    }

    const url = `${WEBAPP_URL}/api/send-email`;

    try {
        const { data } = await axios.post(url, {
            recipientEmail,
            subject,
            html,
            textFallback,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-email-proxy-secret': EMAIL_PROXY_SECRET,
            },
            timeout: 15000,
        });

        if (!data.success) {
            throw new Error(data.error || 'Email proxy returned failure');
        }

        console.log(`[email.js] Email successfully sent to ${recipientEmail} (via proxy)`);
    } catch (error) {
        console.error('[email.js] Failed to send email via proxy:', error.response?.data || error.message);
        const err = new Error('Unable to send email. Check EMAIL_PROXY_SECRET and WEBAPP_URL configuration.');
        err.statusCode = 502;
        err.cause = error;
        throw err;
    }
};

module.exports = {
    sendEmail,
};
