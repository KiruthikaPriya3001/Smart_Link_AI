const express = require('express');
const router = express.Router();
const { getUrlAnalytics, getUserSummary } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Note: /user/summary must come BEFORE /:urlId
router.get('/user/summary', protect, getUserSummary);
router.get('/:urlId', protect, getUrlAnalytics);

module.exports = router;
