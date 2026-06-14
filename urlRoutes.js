const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  getUserUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  bulkCreateUrls,
  getPublicStats,
} = require('../controllers/urlController');
const { protect } = require('../middleware/auth');
const { validateUrl } = require('../middleware/validation');

router.post('/create', protect, validateUrl, createShortUrl);
router.post('/bulk', protect, bulkCreateUrls);
router.get('/all', protect, getUserUrls);
router.get('/stats/:shortCode', getPublicStats); // Public route
router.get('/:id', protect, getUrlById);
router.put('/:id', protect, updateUrl);
router.delete('/:id', protect, deleteUrl);

module.exports = router;
