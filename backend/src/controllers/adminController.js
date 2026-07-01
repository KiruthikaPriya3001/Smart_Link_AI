const os = require('os');
const User = require('../models/User');
const Url = require('../models/Url');

// @desc    Get system-wide metrics for admins
// @route   GET /api/admin/metrics
// @access  Private/Admin
const getAdminMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLinks = await Url.countDocuments();
    
    // Aggregate total redirect clicks
    const urls = await Url.find({}, 'clickCount');
    const totalClicks = urls.reduce((sum, u) => sum + (u.clickCount || 0), 0);

    // Retrieve process-level and hardware system metrics
    const systemMetrics = {
      uptime: process.uptime(), // seconds
      nodeVersion: process.version,
      platform: os.platform(),
      cpuCount: os.cpus().length,
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      processMemory: process.memoryUsage().heapUsed,
    };

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalLinks,
        totalClicks,
        systemMetrics,
      },
    });
  } catch (error) {
    console.error('Get Admin Metrics Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving system metrics' });
  }
};

module.exports = {
  getAdminMetrics,
};
