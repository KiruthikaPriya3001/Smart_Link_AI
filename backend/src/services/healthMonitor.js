const axios = require('axios');
const Url = require('../models/Url');

/**
 * Checks the HTTP health of a destination URL.
 * Detects 404/500 broken pages, redirect loops, and timeouts.
 * @param {string} targetUrl - Destination URL to check
 * @returns {Promise<Object>} - Health status result
 */
const checkUrlHealth = async (targetUrl) => {
  const result = {
    status: 'healthy',
    statusCode: 200,
    errorMessage: '',
    lastChecked: new Date(),
  };

  try {
    // Perform HEAD request first (more efficient)
    const response = await axios.get(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartLinkAI-HealthCheck/1.0',
      },
      timeout: 4000, // 4 seconds timeout
      maxRedirects: 6, // if it redirects more than 6 times, it's considered a potential loop
    });

    result.statusCode = response.status;
    
    if (response.status >= 400) {
      result.status = 'broken';
      result.errorMessage = `HTTP Status ${response.status}`;
    }
  } catch (error) {
    result.lastChecked = new Date();
    
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      result.status = 'broken';
      result.statusCode = error.response.status;
      result.errorMessage = `HTTP Status ${error.response.status}`;
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      result.status = 'broken';
      result.statusCode = 408;
      result.errorMessage = 'Connection Timeout';
    } else if (error.message && error.message.includes('maxRedirects')) {
      // Redirect loop
      result.status = 'loop';
      result.statusCode = 310;
      result.errorMessage = 'Too many redirects / Redirect loop detected';
    } else {
      // DNS issue or general network error
      result.status = 'broken';
      result.statusCode = 503;
      result.errorMessage = error.code || error.message || 'Service Unavailable';
    }
  }

  return result;
};

/**
 * Checks a URL document and saves its health status to the database.
 * @param {string} urlId - MongoDB Url ID
 */
const verifyAndSaveHealth = async (urlId) => {
  try {
    const urlDoc = await Url.findById(urlId);
    if (!urlDoc) return;

    const health = await checkUrlHealth(urlDoc.originalUrl);
    urlDoc.healthStatus = health;
    await urlDoc.save();
    return health;
  } catch (error) {
    console.error(`Error in verifyAndSaveHealth for ${urlId}:`, error.message);
  }
};

module.exports = {
  checkUrlHealth,
  verifyAndSaveHealth,
};
