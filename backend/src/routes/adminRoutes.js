const express = require('express');
const router = express.Router();
const { getAdminMetrics } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/metrics', protect, admin, getAdminMetrics);

module.exports = router;
