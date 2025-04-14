const { Task } = require('../models');
const dbService = require('./dbService');

/**
 * Get all tasks
 * @param {string} userId - Optional user ID to filter tasks
 * @returns {Promise<Array>} - Array of tasks
 */
async function getTasks(userId = null) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }

    // If userId is provided, filter tasks by user
    const query = userId ? { userId } : {};

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    return tasks;
  } catch (error) {
    console.error('Error getting tasks from database:', error);
    return null;
  }
}

/**
 * Get a task by ID
 * @param {string} taskId - The task ID
 * @returns {Promise<Object>} - The task object
 */
async function getTaskById(taskId) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }

    const task = await Task.findOne({ id: taskId });
    return task;
  } catch (error) {
    console.error(`Error getting task ${taskId} from database:`, error);
    return null;
  }
}

/**
 * Create a new task
 * @param {Object} taskData - The task data
 * @returns {Promise<Object>} - The created task
 */
async function createTask(taskData) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }

    const task = new Task(taskData);
    await task.save();

    return task;
  } catch (error) {
    console.error('Error creating task in database:', error);
    return null;
  }
}

/**
 * Update a task
 * @param {string} taskId - The task ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} - The updated task
 */
async function updateTask(taskId, updateData) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }

    const task = await Task.findOneAndUpdate(
      { id: taskId },
      updateData,
      { new: true }
    );

    return task;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    return null;
  }
}

/**
 * Update a task's status
 * @param {string} taskId - The task ID
 * @param {string} status - The new status
 * @param {number} progress - The progress percentage
 * @returns {Promise<Object>} - The updated task
 */
async function updateTaskStatus(taskId, status, progress = null) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }

    const updateData = { status };

    if (progress !== null) {
      updateData.progress = progress;
    }

    const task = await Task.findOneAndUpdate(
      { id: taskId },
      updateData,
      { new: true }
    );

    return task;
  } catch (error) {
    console.error(`Error updating task ${taskId} status:`, error);
    return null;
  }
}

/**
 * Add a step to a task
 * @param {string} taskId - The task ID
 * @param {Object} stepData - The step data
 * @returns {Promise<Object>} - The updated task
 */
async function addTaskStep(taskId, stepData) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }

    const task = await Task.findOne({ id: taskId });

    if (!task) {
      return null;
    }

    // Add step to task
    task.steps.push(stepData);
    await task.save();

    return task;
  } catch (error) {
    console.error(`Error adding step to task ${taskId}:`, error);
    return null;
  }
}

/**
 * Update a task step
 * @param {string} taskId - The task ID
 * @param {number} stepId - The step ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} - The updated task
 */
async function updateTaskStep(taskId, stepId, updateData) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }

    const task = await Task.findOne({ id: taskId });

    if (!task) {
      return null;
    }

    // Find the step
    const stepIndex = task.steps.findIndex(step => step.id === stepId);

    if (stepIndex === -1) {
      return null;
    }

    // Update the step
    Object.assign(task.steps[stepIndex], updateData);
    await task.save();

    return task;
  } catch (error) {
    console.error(`Error updating step ${stepId} in task ${taskId}:`, error);
    return null;
  }
}

/**
 * Set the result for a completed task
 * @param {string} taskId - The task ID
 * @param {Object} result - The task result
 * @returns {Promise<Object>} - The updated task
 */
async function setTaskResult(taskId, result) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }

    const task = await Task.findOneAndUpdate(
      { id: taskId },
      {
        result,
        status: 'completed',
        progress: 100,
      },
      { new: true }
    );

    return task;
  } catch (error) {
    console.error(`Error setting result for task ${taskId}:`, error);
    return null;
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  addTaskStep,
  updateTaskStep,
  setTaskResult,
};
