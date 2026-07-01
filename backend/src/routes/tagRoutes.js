const express = require('express');
const router = express.Router();
const {
  getTags,
  createTag,
  deleteTag,
} = require('../controllers/tagController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getTags);
router.post('/', protect, createTag);
router.delete('/:id', protect, deleteTag);

module.exports = router;
