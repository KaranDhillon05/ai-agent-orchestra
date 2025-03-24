const express = require('express');
const router = express.Router();
const orchestrationController = require('./controllers/orchestrationController');
const agentController = require('./controllers/agentController');

// Orchestration routes
router.post('/tasks', orchestrationController.createTask);
router.get('/tasks', orchestrationController.listTasks);
router.get('/tasks/:taskId', orchestrationController.getTaskStatus);
router.get('/tasks/:taskId/result', orchestrationController.getTaskResult);

// Agent routes
router.get('/agents', agentController.listAgents);
router.get('/agents/:agentId', agentController.getAgentDetails);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
