const axios = require('axios');

let WEBAPP_URL = (process.env.WEBAPP_URL || 'http://localhost:5173').trim().replace(/\/+$/, '');
if (WEBAPP_URL && !/^https?:\/\//i.test(WEBAPP_URL)) {
    WEBAPP_URL = `https://${WEBAPP_URL}`;
}
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
    console.log(`[email.js] Proxying email to: ${url}`);

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
        const status = error.response?.status;
        const responseData = error.response?.data;
        console.error(`[email.js] Failed to send email via proxy:`, {
            url,
            status,
            responseError: responseData?.error || error.message,
            code: error.code,
        });
        const err = new Error(
            `Unable to send email (proxy ${status || error.code || 'unknown'}). ` +
            `${responseData?.error || error.message}`
        );
        err.statusCode = 502;
        err.cause = error;
        throw err;
    }
};

module.exports = {
    sendEmail,
};
