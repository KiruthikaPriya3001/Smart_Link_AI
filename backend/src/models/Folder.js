const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a folder name'],
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// User cannot have duplicate folders with the same name
FolderSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Folder', FolderSchema);
