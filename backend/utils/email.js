const { spawn } = require('child_process');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER?.trim();
const SMTP_PASS = process.env.SMTP_PASS?.replace(/\s+/g, '');
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL?.trim() || SMTP_USER;
const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 10000);

/**
 * Sends an email using SMTP via the `curl` command line tool.
 * 
 * @param {Object} options
 * @param {string} options.recipientEmail
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.textFallback]
 * @returns {Promise<void>}
 */
const sendEmail = ({ recipientEmail, subject, html, textFallback }) => {
    return new Promise((resolve, reject) => {
        if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
            return reject(new Error('SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL are required to send emails'));
        }

        const smtpUrl = `smtp://${SMTP_HOST}:${SMTP_PORT}/`;
        const args = [
            '--silent',
            '--show-error',
            '--ssl',
            '--url', smtpUrl,
            '--user', `${SMTP_USER}:${SMTP_PASS}`,
            '--mail-from', SMTP_FROM_EMAIL,
            '--mail-rcpt', recipientEmail,
            '--upload-file', '-',
        ];

        const payload = [
            `From: OrganiSort <${SMTP_FROM_EMAIL}>`,
            `To: ${recipientEmail}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            '',
            html,
            '',
            ...(textFallback ? [`Plain-text fallback: ${textFallback}`, ''] : []),
        ].join('\r\n');

        const child = spawn('curl', args, { timeout: SMTP_TIMEOUT_MS });

        let stderr = '';
        child.stderr.on('data', (d) => { stderr += d.toString(); });

        child.on('close', (code) => {
            if (code === 0) return resolve();
            const err = new Error('Unable to send email via SMTP. Check SMTP credentials (for Gmail use an app password) and sender configuration.');
            err.code = code;
            err.statusCode = 502;
            err.cause = { stderr };
            reject(err);
        });

        child.on('error', (spawnErr) => {
            const err = new Error('Unable to send email via SMTP. Check SMTP credentials (for Gmail use an app password) and sender configuration.');
            err.statusCode = 502;
            err.cause = { stderr, spawnErr };
            reject(err);
        });

        child.stdin.write(payload);
        child.stdin.end();
    });
};

module.exports = {
    sendEmail,
};
