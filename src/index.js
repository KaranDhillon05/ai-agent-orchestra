const express = require('express');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./api/routes');

// Initialize the Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Serve static files from the frontend build directory if it exists
const frontendBuildPath = path.join(__dirname, '../dist');
app.use(express.static(frontendBuildPath));

// Root API route for health check
app.get('/api/status', (req, res) => {
  res.json({
    name: 'AI Agent Orchestra',
    description: 'A collaborative multi-agent system for complex problem solving',
    version: '1.0.0',
    status: 'running',
  });
});

// Serve the frontend for all other routes
app.use('*', (req, res) => {
  // Check if the request is for an API route
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Serve the frontend index.html
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server in production
  if (config.nodeEnv === 'development') {
    process.exit(1);
  }
});

module.exports = app; // Export for testing
