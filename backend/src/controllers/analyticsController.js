const Analytics = require('../models/Analytics');
const Url = require('../models/Url');
const { getUrlInsights, getUserAggregateInsights, getSmartExpiryRecommendation } = require('../services/aiService');

// Helper to format date keys
const getDayKey = (date) => date.toISOString().split('T')[0];

const getWeekKey = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
};

const getMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// @desc    Get detailed analytics for a single URL
// @route   GET /api/analytics/:urlId
// @access  Private
const getUrlAnalytics = async (req, res) => {
  try {
    const urlId = req.params.urlId;
    const userId = req.user.id;

    // Verify owner
    const url = await Url.findOne({ _id: urlId, userId });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or unauthorized' });
    }

    // Fetch all analytics for this url
    const records = await Analytics.find({ urlId }).sort({ timestamp: 1 }); // Ascending for time trends

    const totalClicks = records.length;
    
    // Unique visitors by IP
    const uniqueIps = new Set(records.map((r) => r.ipAddress).filter(Boolean));
    const uniqueVisitors = uniqueIps.size;

    const lastRecord = records[records.length - 1];
    const lastVisitedTime = lastRecord ? lastRecord.timestamp : null;

    // Devices, browsers, OS, countries, cities aggregates
    const devices = {};
    const browsers = {};
    const OSs = {};
    const countries = {};
    const cities = {};

    // Trends grouping maps
    const dailyMap = {};
    const weeklyMap = {};
    const monthlyMap = {};

    records.forEach((r) => {
      const ts = new Date(r.timestamp);
      
      // Device
      const dev = r.device || 'Unknown';
      devices[dev] = (devices[dev] || 0) + 1;

      // Browser
      const br = r.browser || 'Unknown';
      browsers[br] = (browsers[br] || 0) + 1;

      // OS
      const osSystem = r.os || 'Unknown';
      OSs[osSystem] = (OSs[osSystem] || 0) + 1;

      // Geolocation
      const ctry = r.country || 'Unknown';
      countries[ctry] = (countries[ctry] || 0) + 1;

      const cty = r.city || 'Unknown';
      const cityKey = ctry !== 'Unknown' ? `${cty}, ${ctry}` : cty;
      cities[cityKey] = (cities[cityKey] || 0) + 1;

      // Trends
      const dayKey = getDayKey(ts);
      dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1;

      const weekKey = getWeekKey(ts);
      weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + 1;

      const monthKey = getMonthKey(ts);
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
    });

    // Formatting outputs for Recharts
    const formatPieData = (map) =>
      Object.keys(map).map((name) => ({ name, value: map[name] }));

    const formatTrendData = (map) =>
      Object.keys(map).map((name) => ({ name, clicks: map[name] }));

    const formatGeoData = (map) =>
      Object.keys(map)
        .map((name) => ({ name, clicks: map[name] }))
        .sort((a, b) => b.clicks - a.clicks);

    // AI Insights
    const insights = await getUrlInsights(urlId);

    // Smart Expiry Recommendation
    const smartExpiry = getSmartExpiryRecommendation(records);

    // Get 10 recent click logs
    const recentVisits = [...records]
      .reverse()
      .slice(0, 10)
      .map((r) => ({
        id: r._id,
        timestamp: r.timestamp,
        country: r.country,
        city: r.city,
        browser: r.browser,
        device: r.device,
        os: r.os,
        ipAddress: r.ipAddress ? `${r.ipAddress.slice(0, 6)}...` : 'Unknown', // anonymize partially
      }));

    res.status(200).json({
      success: true,
      data: {
        url,
        summary: {
          totalClicks,
          uniqueVisitors,
          lastVisitedTime,
        },
        devices: formatPieData(devices),
        browsers: formatPieData(browsers),
        operatingSystems: formatPieData(OSs),
        countries: formatGeoData(countries),
        cities: formatGeoData(cities).slice(0, 10),
        trends: {
          daily: formatTrendData(dailyMap).slice(-30), // limit to last 30 entries
          weekly: formatTrendData(weeklyMap).slice(-12), // limit to last 12 entries
          monthly: formatTrendData(monthlyMap).slice(-12), // limit to last 12 entries
        },
        insights,
        smartExpiry,
        recentVisits,
      },
    });
  } catch (error) {
    console.error('Get URL Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving analytics' });
  }
};

// @desc    Get aggregate stats for dashboard main console
// @route   GET /api/analytics/user/summary
// @access  Private
const getUserSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all user's URLs
    const urls = await Url.find({ userId });
    const urlIds = urls.map((u) => u._id);
    const totalLinks = urls.length;

    // Calculate active vs expired count
    const now = new Date();
    let activeLinksCount = 0;
    let expiredLinksCount = 0;

    urls.forEach((u) => {
      if (u.expiryDate && now > u.expiryDate) {
        expiredLinksCount++;
      } else {
        activeLinksCount++;
      }
    });

    const totalClicks = urls.reduce((sum, u) => sum + (u.clickCount || 0), 0);

    // Fetch aggregate analytics for trend charts (last 30 days)
    const records = await Analytics.find({ urlId: { $in: urlIds } }).sort({ timestamp: 1 });

    const uniqueIps = new Set(records.map((r) => r.ipAddress).filter(Boolean));
    const uniqueVisitors = uniqueIps.size;

    const dailyMap = {};
    const countries = {};
    const devices = {};
    const browsers = {};

    records.forEach((r) => {
      const ts = new Date(r.timestamp);
      
      const dayKey = getDayKey(ts);
      dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1;

      const ctry = r.country || 'Unknown';
      countries[ctry] = (countries[ctry] || 0) + 1;

      const dev = r.device || 'Unknown';
      devices[dev] = (devices[dev] || 0) + 1;

      const br = r.browser || 'Unknown';
      browsers[br] = (browsers[br] || 0) + 1;
    });

    const formatTrendData = (map) =>
      Object.keys(map).map((name) => ({ name, clicks: map[name] }));

    const formatPieData = (map) =>
      Object.keys(map).map((name) => ({ name, value: map[name] }));

    const topCountries = Object.keys(countries)
      .map((name) => ({ name, clicks: countries[name] }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    // Aggregate AI insights
    const insights = await getUserAggregateInsights(urlIds);

    res.status(200).json({
      success: true,
      data: {
        counters: {
          totalLinks,
          activeLinks: activeLinksCount,
          expiredLinks: expiredLinksCount,
          totalClicks,
          uniqueVisitors,
        },
        dailyTrend: formatTrendData(dailyMap).slice(-30),
        topCountries,
        devices: formatPieData(devices),
        browsers: formatPieData(browsers),
        insights,
      },
    });
  } catch (error) {
    console.error('Get User Summary Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard summary' });
  }
};

module.exports = {
  getUrlAnalytics,
  getUserSummary,
};
