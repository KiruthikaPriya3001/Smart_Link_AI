const express = require('express');
const router = express.Router();
const {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
} = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFolders);
router.post('/', protect, createFolder);
router.put('/:id', protect, updateFolder);
router.delete('/:id', protect, deleteFolder);

module.exports = router;
