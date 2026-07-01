const validator = require('validator');

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  next();
};

const validateUrl = (req, res, next) => {
  const { originalUrl, customAlias } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ success: false, message: 'Please provide the original URL' });
  }

  // Basic validation of URL structure
  const isValid = validator.isURL(originalUrl, {
    protocols: ['http', 'https'],
    require_protocol: true, // enforce http or https
  });

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid URL. Make sure it starts with http:// or https://' });
  }

  if (customAlias) {
    // Check for alphanumeric aliases, allow dash and underscore
    const aliasRegex = /^[a-zA-Z0-9_-]+$/;
    if (!aliasRegex.test(customAlias)) {
      return res.status(400).json({ success: false, message: 'Custom alias must contain only letters, numbers, hyphens (-), and underscores (_)' });
    }

    if (customAlias.length < 3 || customAlias.length > 30) {
      return res.status(400).json({ success: false, message: 'Custom alias must be between 3 and 30 characters long' });
    }
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUrl,
};
