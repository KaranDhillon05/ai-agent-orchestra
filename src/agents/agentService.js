const config = require('../config');
const BaseAgent = require('./BaseAgent');
const ResearchAgent = require('./ResearchAgent');
const PlannerAgent = require('./PlannerAgent');
const CriticAgent = require('./CriticAgent');
const CreativeAgent = require('./CreativeAgent');
const ExecutorAgent = require('./ExecutorAgent');

// In-memory store for agents (in a production app, this would be a database)
const agents = {};

/**
 * Initialize all agent types from configuration
 */
const initializeAgents = () => {
  config.agents.types.forEach(agentConfig => {
    // Create the appropriate agent type based on the agent ID
    switch (agentConfig.id) {
      case 'researcher':
        agents[agentConfig.id] = new ResearchAgent(agentConfig);
        break;
      case 'planner':
        agents[agentConfig.id] = new PlannerAgent(agentConfig);
        break;
      case 'critic':
        agents[agentConfig.id] = new CriticAgent(agentConfig);
        break;
      case 'creative':
        agents[agentConfig.id] = new CreativeAgent(agentConfig);
        break;
      case 'executor':
        agents[agentConfig.id] = new ExecutorAgent(agentConfig);
        break;
      default:
        agents[agentConfig.id] = new BaseAgent(agentConfig);
    }
  });
};

/**
 * Get a list of all available agents
 */
exports.listAgents = async () => {
  // Initialize agents if not already done
  if (Object.keys(agents).length === 0) {
    initializeAgents();
  }

  return Object.values(agents).map(agent => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    status: agent.status,
  }));
};

/**
 * Get an agent by its ID
 */
exports.getAgentById = async (agentId) => {
  // Initialize agents if not already done
  if (Object.keys(agents).length === 0) {
    initializeAgents();
  }

  const agent = agents[agentId];

  if (!agent) {
    return null;
  }

  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    status: agent.status,
    model: agent.model,
    capabilities: agent.capabilities,
    taskHistory: agent.taskHistory.slice(0, 10), // Return only the 10 most recent tasks
  };
};

/**
 * Get an agent instance by its ID
 */
exports.getAgentInstance = (agentId) => {
  // Initialize agents if not already done
  if (Object.keys(agents).length === 0) {
    initializeAgents();
  }

  return agents[agentId] || null;
};

// Initialize agents on module load
initializeAgents();
