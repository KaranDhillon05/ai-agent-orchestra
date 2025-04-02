const { Agent } = require('../models');
const dbService = require('./dbService');

/**
 * Get all agents
 * @returns {Promise<Array>} - Array of agents
 */
async function getAgents() {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }
    
    const agents = await Agent.find().sort({ name: 1 });
    return agents;
  } catch (error) {
    console.error('Error getting agents from database:', error);
    return null;
  }
}

/**
 * Get an agent by ID
 * @param {string} agentId - The agent ID
 * @returns {Promise<Object>} - The agent object
 */
async function getAgentById(agentId) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }
    
    const agent = await Agent.findOne({ id: agentId });
    return agent;
  } catch (error) {
    console.error(`Error getting agent ${agentId} from database:`, error);
    return null;
  }
}

/**
 * Create or update an agent
 * @param {Object} agentData - The agent data
 * @returns {Promise<Object>} - The created or updated agent
 */
async function saveAgent(agentData) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }
    
    const agent = await Agent.findOneAndUpdate(
      { id: agentData.id },
      agentData,
      { new: true, upsert: true }
    );
    
    return agent;
  } catch (error) {
    console.error('Error saving agent to database:', error);
    return null;
  }
}

/**
 * Update an agent's status
 * @param {string} agentId - The agent ID
 * @param {string} status - The new status
 * @returns {Promise<Object>} - The updated agent
 */
async function updateAgentStatus(agentId, status) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }
    
    const agent = await Agent.findOneAndUpdate(
      { id: agentId },
      { status },
      { new: true }
    );
    
    return agent;
  } catch (error) {
    console.error(`Error updating agent ${agentId} status:`, error);
    return null;
  }
}

/**
 * Add a task to an agent's history
 * @param {string} agentId - The agent ID
 * @param {Object} taskData - The task data
 * @returns {Promise<Object>} - The updated agent
 */
async function addTaskToAgentHistory(agentId, taskData) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }
    
    const agent = await Agent.findOne({ id: agentId });
    
    if (!agent) {
      return null;
    }
    
    // Add task to history
    agent.taskHistory.unshift({
      id: taskData.id,
      query: taskData.query,
      timestamp: new Date(),
      result: taskData.result || 'Task completed',
    });
    
    // Limit history size
    if (agent.taskHistory.length > 100) {
      agent.taskHistory = agent.taskHistory.slice(0, 100);
    }
    
    await agent.save();
    
    return agent;
  } catch (error) {
    console.error(`Error adding task to agent ${agentId} history:`, error);
    return null;
  }
}

/**
 * Initialize default agents if they don't exist
 * @param {Array} defaultAgents - Array of default agent data
 */
async function initializeDefaultAgents(defaultAgents) {
  try {
    if (!dbService.isConnected()) {
      return false; // Use in-memory storage instead
    }
    
    // Check if agents already exist
    const count = await Agent.countDocuments();
    
    if (count > 0) {
      console.log('Agents already exist in database');
      return true;
    }
    
    // Create default agents
    await Agent.insertMany(defaultAgents);
    console.log('Default agents initialized in database');
    return true;
  } catch (error) {
    console.error('Error initializing default agents:', error);
    return false;
  }
}

module.exports = {
  getAgents,
  getAgentById,
  saveAgent,
  updateAgentStatus,
  addTaskToAgentHistory,
  initializeDefaultAgents,
};
