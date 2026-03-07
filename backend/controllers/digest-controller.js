const User = require('../models/User');
const Detection = require('../models/Detection');
const { sendEmail } = require('../utils/email');
const { createNotification } = require('./notification-controller');

const DIGEST_CRON_SECRET = process.env.DIGEST_CRON_SECRET?.trim();

/**
 * GET /api/digest/send-weekly?secret=<DIGEST_CRON_SECRET>
 * Sends a weekly digest email to all users who have emailUpdates enabled.
 * Secured by a shared secret to prevent unauthorized access.
 */
const sendWeeklyDigest = async (req, res) => {
    // Validate cron secret
    const secret = req.query.secret || req.headers['x-cron-secret'];
    if (!DIGEST_CRON_SECRET || secret !== DIGEST_CRON_SECRET) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    try {
        // Find users who opted in to email updates
        const users = await User.find({
            isActive: true,
            emailVerified: true,
            'preferences.emailUpdates': true,
        }).select('email displayName _id');

        if (users.length === 0) {
            return res.json({ success: true, message: 'No eligible users for digest', sent: 0 });
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        let sent = 0;
        let failed = 0;

        for (const user of users) {
            try {
                // Get user's detections from the past week
                const detections = await Detection.find({
                    user: user._id,
                    createdAt: { $gte: oneWeekAgo },
                });

                const totalScans = detections.length;
                const totalItems = detections.reduce(
                    (sum, d) => sum + (d.detections?.length || 0),
                    0
                );

                // Count waste types
                const wasteTypeCounts = {};
                detections.forEach((d) => {
                    (d.detections || []).forEach((item) => {
                        const cls = item.class;
                        wasteTypeCounts[cls] = (wasteTypeCounts[cls] || 0) + 1;
                    });
                });

                const topWasteTypes = Object.entries(wasteTypeCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                // Build email HTML
                const wasteTypeRows = topWasteTypes.length > 0
                    ? topWasteTypes
                        .map(
                            ([type, count]) =>
                                `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-transform:capitalize;font-weight:600;">${type.replace(/-/g, ' ')}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-weight:700;">${count}</td></tr>`
                        )
                        .join('')
                    : '<tr><td colspan="2" style="padding:16px;text-align:center;color:#71717a;">No scans this week</td></tr>';

                const html = `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#18181b;max-width:520px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;border-radius:16px 16px 0 0;">
              <h1 style="margin:0;color:#fff;font-size:24px;">📊 Your Weekly Digest</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Hey ${user.displayName || 'there'}, here's your OrganiSort recap!
              </p>
            </div>

            <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:0;">
              <div style="display:flex;gap:16px;margin-bottom:24px;">
                <div style="flex:1;background:#f5f3ff;padding:16px;border-radius:12px;text-align:center;">
                  <div style="font-size:28px;font-weight:900;color:#7c3aed;">${totalScans}</div>
                  <div style="font-size:12px;color:#71717a;font-weight:700;text-transform:uppercase;">Scans</div>
                </div>
                <div style="flex:1;background:#ecfdf5;padding:16px;border-radius:12px;text-align:center;">
                  <div style="font-size:28px;font-weight:900;color:#10b981;">${totalItems}</div>
                  <div style="font-size:12px;color:#71717a;font-weight:700;text-transform:uppercase;">Items</div>
                </div>
              </div>

              <h3 style="margin:0 0 12px;font-size:15px;color:#18181b;">Top Detected Waste</h3>
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="background:#fafafa;">
                    <th style="padding:8px 12px;text-align:left;font-size:11px;color:#71717a;text-transform:uppercase;">Type</th>
                    <th style="padding:8px 12px;text-align:center;font-size:11px;color:#71717a;text-transform:uppercase;">Count</th>
                  </tr>
                </thead>
                <tbody>${wasteTypeRows}</tbody>
              </table>
            </div>

            <div style="background:#fafafa;padding:20px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:0;text-align:center;">
              <p style="margin:0;font-size:13px;color:#71717a;">
                Keep scanning and sorting! Every item counts. 🌱
              </p>
            </div>
          </div>
        `;

                await sendEmail({
                    recipientEmail: user.email,
                    subject: `📊 Your Weekly OrganiSort Digest — ${totalScans} scans this week`,
                    html,
                    textFallback: `Weekly Digest: ${totalScans} scans, ${totalItems} items detected. Top waste: ${topWasteTypes.map(([t, c]) => `${t} (${c})`).join(', ') || 'None'}`,
                });

                // Also create an in-app notification
                await createNotification(user._id, {
                    title: 'Weekly Digest',
                    body: `You scanned ${totalScans} item${totalScans !== 1 ? 's' : ''} this week and detected ${totalItems} waste item${totalItems !== 1 ? 's' : ''}. ${topWasteTypes.length > 0 ? `Top: ${topWasteTypes[0][0].replace(/-/g, ' ')}` : ''}`,
                    type: 'digest',
                });

                sent++;
            } catch (userError) {
                console.error(`[digest] failed for ${user.email}:`, userError.message);
                failed++;
            }
        }

        res.json({
            success: true,
            message: `Digest sent to ${sent} users, ${failed} failed`,
            sent,
            failed,
            total: users.length,
        });
    } catch (error) {
        console.error('[digest] sendWeeklyDigest failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    sendWeeklyDigest,
};
