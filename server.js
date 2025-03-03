const express = require('express');
const path = require('path');

// Initialize the Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Simple API endpoint
app.get('/api/status', (req, res) => {
  res.json({
    name: 'AI Agent Orchestra',
    status: 'running',
  });
});

// Fallback route for SPA
app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
