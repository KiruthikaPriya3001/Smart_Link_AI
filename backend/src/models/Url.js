const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  originalUrl: {
    type: String,
    required: [true, 'Please add the original URL'],
    trim: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    trim: true,
  },
  qrCode: {
    type: String, // Base64 Data URI
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
    index: true,
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }],
  isFavorite: {
    type: Boolean,
    default: false,
    index: true,
  },
  isPublicAnalytics: {
    type: Boolean,
    default: false,
  },
  healthStatus: {
    status: {
      type: String,
      enum: ['healthy', 'broken', 'loop', 'unchecked'],
      default: 'unchecked',
    },
    statusCode: {
      type: Number,
    },
    errorMessage: {
      type: String,
    },
    lastChecked: {
      type: Date,
    },
  },
  aiInsights: {
    category: {
      type: String,
      default: 'Uncategorized',
    },
    websiteType: {
      type: String,
      default: 'General Website',
    },
    riskScore: {
      type: Number,
      default: 0,
    },
    seoFriendliness: {
      type: Number,
      default: 50,
    },
    seoReport: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Url', UrlSchema);
