const express = require('express');
const router = express.Router();

// Import route modules
const developmentRoutes = require('./development');
const agentRoutes = require('./agents');
const memoryRoutes = require('./memory');

// Mount routes
router.use('/development', developmentRoutes);
router.use('/agents', agentRoutes);
router.use('/memory', memoryRoutes);

// Health check endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router; 