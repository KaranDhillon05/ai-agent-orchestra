const express = require('express');
const router = express.Router();
const orchestrationService = require('../../orchestration/orchestrationService');

// Create a new development task
router.post('/tasks', async (req, res) => {
  try {
    const task = await orchestrationService.handleDevelopmentRequest(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task status
router.get('/tasks/:taskId', async (req, res) => {
  try {
    const status = await orchestrationService.getTaskStatus(req.params.taskId);
    res.json(status);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get task history
router.get('/tasks', async (req, res) => {
  try {
    const history = await orchestrationService.getTaskHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle complex development tasks
router.post('/complex-tasks', async (req, res) => {
  try {
    const result = await orchestrationService.handleComplexTask(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 