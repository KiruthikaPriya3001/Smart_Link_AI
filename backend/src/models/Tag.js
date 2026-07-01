const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a tag name'],
    trim: true,
  },
  color: {
    type: String,
    default: '#6366f1', // default indigo
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

// User cannot have duplicate tags with the same name
TagSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Tag', TagSchema);
