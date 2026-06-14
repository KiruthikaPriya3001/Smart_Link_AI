const express = require('express');
const router = express.Router();
const { listNotifications, markNotificationsAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, listNotifications);
router.post('/read', protect, markNotificationsAsRead);

module.exports = router;
