const authService = require('../services/authService');

/**
 * Middleware to authenticate JWT token
 */
function authenticateToken(req, res, next) {
  try {
    // Get token from header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Add user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware to authenticate API key
 */
function authenticateApiKey(req, res, next) {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }
    
    // In a real implementation, we would verify the API key against the database
    // For now, we'll just check if it starts with 'ak_'
    if (!apiKey.startsWith('ak_')) {
      return res.status(403).json({ error: 'Invalid API key' });
    }
    
    // Add API key to request
    req.apiKey = apiKey;
    
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(403).json({ error: 'Invalid API key' });
  }
}

/**
 * Middleware to check if user is admin
 */
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
}

module.exports = {
  authenticateToken,
  authenticateApiKey,
  isAdmin,
};
