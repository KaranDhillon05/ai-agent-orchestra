const orchestrationService = require('../../orchestration/orchestrationService');

/**
 * List all tasks
 */
exports.listTasks = async (req, res) => {
  try {
    const tasks = await orchestrationService.listTasks();

    return res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Error listing tasks:', error);
    return res.status(500).json({ error: 'Failed to list tasks' });
  }
};

/**
 * Create a new task for the agent orchestra to process
 */
exports.createTask = async (req, res) => {
  try {
    const { query, context = {}, priority = 'normal' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const task = await orchestrationService.createTask(query, context, priority);

    return res.status(201).json({
      message: 'Task created successfully',
      taskId: task.id,
      status: task.status,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
};

/**
 * Get the status of a specific task
 */
exports.getTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;

    const taskStatus = await orchestrationService.getTaskStatus(taskId);

    if (!taskStatus) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json(taskStatus);
  } catch (error) {
    console.error('Error getting task status:', error);
    return res.status(500).json({ error: 'Failed to get task status' });
  }
};

/**
 * Get the result of a completed task
 */
exports.getTaskResult = async (req, res) => {
  try {
    const { taskId } = req.params;

    const taskResult = await orchestrationService.getTaskResult(taskId);

    if (!taskResult) {
      return res.status(404).json({ error: 'Task not found or not completed' });
    }

    return res.status(200).json(taskResult);
  } catch (error) {
    console.error('Error getting task result:', error);
    return res.status(500).json({ error: 'Failed to get task result' });
  }
};
