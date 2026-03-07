const User = require('../models/User');
const { createNotification } = require('./notification-controller');

const DIGEST_CRON_SECRET = process.env.DIGEST_CRON_SECRET?.trim();

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * GET /api/reminders/check?secret=<DIGEST_CRON_SECRET>
 * Called by external cron every 15 minutes.
 * Finds users whose collection is coming up within their reminder window.
 */
const checkAndSendReminders = async (req, res) => {
    const secret = req.query.secret || req.headers['x-cron-secret'];
    if (!DIGEST_CRON_SECRET || secret !== DIGEST_CRON_SECRET) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    try {
        // Get current time in Manila (UTC+8)
        const now = new Date();
        const manilaOffset = 8 * 60; // +8 hours in minutes
        const manilaTime = new Date(now.getTime() + (manilaOffset + now.getTimezoneOffset()) * 60000);

        const currentDay = manilaTime.getDay(); // 0=Sun, 6=Sat
        const currentMinutes = manilaTime.getHours() * 60 + manilaTime.getMinutes();

        // Find users with collection schedule enabled for today
        const users = await User.find({
            isActive: true,
            'collectionSchedule.enabled': true,
            'collectionSchedule.schedules.day': currentDay,
        }).select('email displayName collectionSchedule');

        let sent = 0;

        for (const user of users) {
            const reminderWindow = user.collectionSchedule.reminderMinutesBefore || 30;

            for (const schedule of user.collectionSchedule.schedules) {
                if (schedule.day !== currentDay) continue;

                // Parse schedule time
                const [hours, minutes] = (schedule.time || '07:00').split(':').map(Number);
                const scheduleMinutes = hours * 60 + minutes;
                const reminderTime = scheduleMinutes - reminderWindow;

                // Check if current time falls within the 15-minute cron window of the reminder time
                if (currentMinutes >= reminderTime && currentMinutes < reminderTime + 15) {
                    const dayName = DAY_NAMES[schedule.day];
                    const label = schedule.label ? ` (${schedule.label})` : '';

                    await createNotification(user._id, {
                        title: '🗑️ Collection Reminder',
                        body: `Waste pickup${label} is in ${reminderWindow} minutes! Get your waste ready for ${dayName} at ${schedule.time}.`,
                        type: 'system',
                    });
                    sent++;
                }
            }
        }

        res.json({ success: true, sent, checked: users.length });
    } catch (error) {
        console.error('[reminders] check failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    checkAndSendReminders,
};
