const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  country: {
    type: String,
    default: 'Unknown',
  },
  city: {
    type: String,
    default: 'Unknown',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  device: {
    type: String,
    default: 'Unknown', // e.g., Desktop, Mobile, Tablet
  },
  os: {
    type: String,
    default: 'Unknown',
  },
  ipAddress: {
    type: String,
  },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
