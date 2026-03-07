const express = require('express');
const { sendWeeklyDigest } = require('../controllers/digest-controller');

const router = express.Router();

// Triggered by external cron (cron-job.org) — no auth middleware, uses shared secret
router.get('/send-weekly', sendWeeklyDigest);

module.exports = router;
