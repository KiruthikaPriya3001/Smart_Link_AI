const Analytics = require('../models/Analytics');

/**
 * Generates AI-style natural language insights from raw analytics records.
 * @param {Array} records - Array of Analytics Mongoose documents
 * @returns {Array<string>} - Array of insight strings
 */
const generateInsights = (records) => {
  const insights = [];
  if (!records || records.length === 0) {
    return [
      "No traffic recorded yet. Share your link to start gathering insights!",
      "Insights will generate automatically once clicks are logged.",
    ];
  }

  const totalClicks = records.length;

  // 1. Device Breakdown
  const devices = { Mobile: 0, Desktop: 0, Tablet: 0, Unknown: 0 };
  records.forEach((r) => {
    const dev = r.device || 'Unknown';
    devices[dev] = (devices[dev] || 0) + 1;
  });

  let topDevice = 'Desktop';
  let maxDeviceCount = 0;
  Object.keys(devices).forEach((k) => {
    if (devices[k] > maxDeviceCount && k !== 'Unknown') {
      maxDeviceCount = devices[k];
      topDevice = k;
    }
  });

  const devicePct = Math.round((maxDeviceCount / totalClicks) * 100);
  if (maxDeviceCount > 0) {
    insights.push(`Most visitors (${devicePct}%) are using ${topDevice.toLowerCase()} devices.`);
  }

  // 2. Geolocation Distribution
  const countries = {};
  records.forEach((r) => {
    const country = r.country || 'Unknown';
    if (country !== 'Unknown') {
      countries[country] = (countries[country] || 0) + 1;
    }
  });

  let topCountry = '';
  let maxCountryCount = 0;
  Object.keys(countries).forEach((c) => {
    if (countries[c] > maxCountryCount) {
      maxCountryCount = countries[c];
      topCountry = c;
    }
  });

  if (topCountry) {
    const countryPct = Math.round((maxCountryCount / totalClicks) * 100);
    insights.push(`${topCountry} contributes the largest share of traffic (${countryPct}% of total clicks).`);
  }

  // 3. Peak Activity Hour
  const hours = Array(24).fill(0);
  records.forEach((r) => {
    const date = new Date(r.timestamp);
    const hr = date.getHours();
    hours[hr]++;
  });

  let peakHour = 0;
  let maxHourCount = 0;
  hours.forEach((count, hr) => {
    if (count > maxHourCount) {
      maxHourCount = count;
      peakHour = hr;
    }
  });

  if (maxHourCount > 0) {
    const formatHour = (h) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr12 = h % 12 || 12;
      return `${hr12} ${ampm}`;
    };
    const peakStart = peakHour;
    const peakEnd = (peakHour + 2) % 24;
    insights.push(`Peak traffic activity occurs between ${formatHour(peakStart)} and ${formatHour(peakEnd)}.`);
  }

  // 4. Traffic Trend (Week over Week)
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const clicksThisWeek = records.filter(
    (r) => new Date(r.timestamp) >= oneWeekAgo
  ).length;
  const clicksLastWeek = records.filter(
    (r) => {
      const ts = new Date(r.timestamp);
      return ts >= twoWeeksAgo && ts < oneWeekAgo;
    }
  ).length;

  if (clicksLastWeek > 0) {
    const diff = clicksThisWeek - clicksLastWeek;
    const pctChange = Math.round((diff / clicksLastWeek) * 100);
    if (pctChange > 0) {
      insights.push(`Traffic increased by ${pctChange}% this week compared to last week.`);
    } else if (pctChange < 0) {
      insights.push(`Traffic decreased by ${Math.abs(pctChange)}% this week compared to last week.`);
    } else {
      insights.push(`Traffic volume is holding steady week-over-week.`);
    }
  } else if (clicksThisWeek > 0) {
    insights.push(`Traffic is growing fast, with ${clicksThisWeek} new clicks registered this week.`);
  }

  // 5. Browser Insights
  const browsers = {};
  records.forEach((r) => {
    const b = r.browser || 'Unknown';
    if (b !== 'Unknown') {
      browsers[b] = (browsers[b] || 0) + 1;
    }
  });

  let topBrowser = '';
  let maxBrowserCount = 0;
  Object.keys(browsers).forEach((b) => {
    if (browsers[b] > maxBrowserCount) {
      maxBrowserCount = browsers[b];
      topBrowser = b;
    }
  });

  if (topBrowser) {
    const browserPct = Math.round((maxBrowserCount / totalClicks) * 100);
    insights.push(`${topBrowser} is the dominant browser utilized by your visitors (${browserPct}%).`);
  }

  // 6. Actionable recommendations
  if (topDevice === 'Mobile' && devicePct > 55) {
    insights.push(`Actionable Insight: Since mobile makes up a large share of your audience, ensure your target site has speed and responsive performance optimized.`);
  }
  if (maxHourCount > 0) {
    const formatHour = (h) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr12 = h % 12 || 12;
      return `${hr12} ${ampm}`;
    };
    insights.push(`Optimization Tip: Consider scheduling campaigns or updates to launch around ${formatHour(peakHour)} to maximize engagement.`);
  }

  return insights;
};

/**
 * Controller-facing service helper to fetch records and run insights
 * @param {string} urlId - MongoDB Mongoose Url ID
 * @returns {Promise<Array<string>>}
 */
const getUrlInsights = async (urlId) => {
  const records = await Analytics.find({ urlId }).sort({ timestamp: -1 });
  return generateInsights(records);
};

/**
 * High level dashboard insights aggregating across all user URLs
 * @param {Array<string>} urlIds - List of URL IDs
 * @returns {Promise<Array<string>>}
 */
const getUserAggregateInsights = async (urlIds) => {
  const records = await Analytics.find({ urlId: { $in: urlIds } }).sort({ timestamp: -1 });
  return generateInsights(records);
};

/**
 * Analyzes the domain and parameters of originalUrl to simulate offline AI-style link insights.
 * @param {string} originalUrl - Destination URL
 * @returns {Object} - Link insights
 */
const generateLinkInsights = (originalUrl) => {
  let hostname = '';
  try {
    hostname = new URL(originalUrl).hostname.toLowerCase();
  } catch (e) {
    hostname = originalUrl.toLowerCase();
  }

  let category = 'Technology';
  let websiteType = 'General Website';
  let riskScore = 0;
  let seoFriendliness = 75;
  const seoReport = [];

  // Check SSL (HTTPS vs HTTP)
  if (originalUrl.startsWith('https://')) {
    seoReport.push('Uses HTTPS encryption (Secure and favored by search engines).');
    riskScore += 0;
  } else {
    seoReport.push('Uses unencrypted HTTP protocol (Not secure, negative SEO signal).');
    riskScore += 35;
    seoFriendliness -= 20;
  }

  // Check URL length
  if (originalUrl.length > 80) {
    seoReport.push('URL length is long (> 80 characters). Shorter URLs rank better.');
    seoFriendliness -= 10;
  } else {
    seoReport.push('URL length is concise (Excellent for indexing and sharing).');
  }

  // Check URL query parameters
  if (originalUrl.includes('?') || originalUrl.includes('&')) {
    seoReport.push('Contains dynamic query parameters. Static URLs are cleaner for SEO.');
    seoFriendliness -= 5;
  } else {
    seoReport.push('URL is clean and static (Highly search-engine friendly).');
  }

  // Categorize based on hostname
  if (hostname.includes('github') || hostname.includes('gitlab') || hostname.includes('bitbucket')) {
    category = 'Development & Tech';
    websiteType = 'Code Repository';
    seoFriendliness += 15;
  } else if (hostname.includes('google') || hostname.includes('drive') || hostname.includes('docs') || hostname.includes('dropbox') || hostname.includes('onedrive')) {
    category = 'Productivity & Office';
    websiteType = 'Cloud Sharing Document';
  } else if (hostname.includes('linkedin') || hostname.includes('twitter') || hostname.includes('facebook') || hostname.includes('instagram') || hostname.includes('reddit')) {
    category = 'Social Media & Marketing';
    websiteType = 'Social Platform';
  } else if (hostname.includes('medium') || hostname.includes('dev.to') || hostname.includes('wordpress') || hostname.includes('blogspot') || hostname.includes('subtack')) {
    category = 'Media & Blogs';
    websiteType = 'Blog Platform';
  } else if (hostname.includes('figma') || hostname.includes('canva') || hostname.includes('dribbble') || hostname.includes('behance')) {
    category = 'Design & Creative';
    websiteType = 'Portfolio / Design Asset';
  } else if (hostname.includes('zoom') || hostname.includes('meet.google') || hostname.includes('teams')) {
    category = 'Communications';
    websiteType = 'Video Conferencing';
  } else if (hostname.includes('notion') || hostname.includes('trello') || hostname.includes('slack') || hostname.includes('asana') || hostname.includes('jira')) {
    category = 'Productivity & Office';
    websiteType = 'Workspace Collaboration';
  } else if (hostname.includes('leetcode') || hostname.includes('hackerrank') || hostname.includes('geeksforgeeks') || hostname.includes('stackoverflow')) {
    category = 'Education & Development';
    websiteType = 'Learning Platform';
  } else if (hostname.includes('paypal') || hostname.includes('stripe') || hostname.includes('crypto') || hostname.includes('coinbase') || hostname.includes('bank')) {
    category = 'Finance & Banking';
    websiteType = 'Payment / Financial Portal';
  } else if (hostname.includes('amazon') || hostname.includes('ebay') || hostname.includes('shopify') || hostname.includes('flipkart') || hostname.includes('walmart')) {
    category = 'E-Commerce & Retail';
    websiteType = 'Online Shop';
  }

  // Suspicious keywords checking
  const suspiciousKeywords = ['free', 'win', 'phish', 'login', 'account-verify', 'gift', 'prize', 'viagra', 'hack'];
  let foundKeywords = [];
  suspiciousKeywords.forEach(kw => {
    if (originalUrl.includes(kw)) {
      foundKeywords.push(kw);
      riskScore += 25;
    }
  });

  if (foundKeywords.length > 0) {
    seoReport.push(`Contains high-risk keywords in URL path: [${foundKeywords.join(', ')}].`);
    seoFriendliness -= 15;
  }

  // Bound scores between 0 and 100
  riskScore = Math.max(0, Math.min(100, riskScore));
  seoFriendliness = Math.max(0, Math.min(100, seoFriendliness));

  return {
    category,
    websiteType,
    riskScore,
    seoFriendliness,
    seoReport,
  };
};

/**
 * Suggests expiration timelines based on link access logs.
 * @param {Array} records - Array of click events
 * @returns {Object} - Recommendation text & suggested days
 */
const getSmartExpiryRecommendation = (records) => {
  if (!records || records.length < 5) {
    return {
      recommendation: "Collect at least 5 visits to receive smart expiry recommendations.",
      suggestedDays: null
    };
  }

  const timestamps = records.map(r => new Date(r.timestamp).getTime()).sort();
  const firstClick = timestamps[0];
  const lastClick = timestamps[timestamps.length - 1];
  const totalDuration = lastClick - firstClick;

  if (totalDuration < 24 * 60 * 60 * 1000) {
    return {
      recommendation: "Link traffic is short-lived. We recommend setting a custom expiry of 3 days.",
      suggestedDays: 3
    };
  }

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentClicksCount = records.filter(r => new Date(r.timestamp).getTime() >= sevenDaysAgo).length;

  const activityRatio = recentClicksCount / records.length;
  if (activityRatio < 0.1) {
    return {
      recommendation: "Warning: Traffic has dropped by 90% over the last week. Recommend setting an expiry of 7 days.",
      suggestedDays: 7
    };
  } else if (activityRatio > 0.8) {
    return {
      recommendation: "Highly active: Traffic is growing rapidly. Keep link active indefinitely.",
      suggestedDays: null
    };
  } else {
    return {
      recommendation: "Steady traffic detected. Setting an expiry of 60 days will keep your platform tidy.",
      suggestedDays: 60
    };
  }
};

module.exports = {
  generateInsights,
  getUrlInsights,
  getUserAggregateInsights,
  generateLinkInsights,
  getSmartExpiryRecommendation,
};
