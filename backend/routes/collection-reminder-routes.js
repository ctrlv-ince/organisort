const express = require('express');
const { checkAndSendReminders } = require('../controllers/collection-reminder-controller');

const router = express.Router();

router.get('/check', checkAndSendReminders);

module.exports = router;
