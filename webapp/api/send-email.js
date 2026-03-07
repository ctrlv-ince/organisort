const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || SMTP_USER;
const EMAIL_PROXY_SECRET = process.env.EMAIL_PROXY_SECRET;

let transporter = null;

module.exports = async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // Validate shared secret
    const secret = req.headers['x-email-proxy-secret'];
    if (!EMAIL_PROXY_SECRET || secret !== EMAIL_PROXY_SECRET) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { recipientEmail, subject, html, textFallback } = req.body || {};

    if (!recipientEmail || !subject || !html) {
        return res.status(400).json({ success: false, error: 'recipientEmail, subject, and html are required' });
    }

    if (!SMTP_USER || !SMTP_PASS) {
        return res.status(500).json({ success: false, error: 'SMTP credentials are not configured on the server' });
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });
    }

    try {
        await transporter.sendMail({
            from: `"OrganiSort" <${SMTP_FROM_EMAIL}>`,
            to: recipientEmail,
            subject,
            text: textFallback || 'Please view this email in a client that supports HTML',
            html,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('[api/send-email] SMTP error:', error.message);
        return res.status(502).json({ success: false, error: 'Failed to send email' });
    }
};
