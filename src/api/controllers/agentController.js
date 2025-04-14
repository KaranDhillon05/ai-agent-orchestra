const config = require('../../config');
const agentService = require('../../agents/agentService');

/**
 * List all available agents in the system
 */
exports.listAgents = async (req, res) => {
  try {
    const agents = await agentService.listAgents();
    
    return res.status(200).json({
      count: agents.length,
      agents,
    });
  } catch (error) {
    console.error('Error listing agents:', error);
    return res.status(500).json({ error: 'Failed to list agents' });
  }
};

/**
 * Get details about a specific agent
 */
exports.getAgentDetails = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const agent = await agentService.getAgentById(agentId);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    return res.status(200).json(agent);
  } catch (error) {
    console.error('Error getting agent details:', error);
    return res.status(500).json({ error: 'Failed to get agent details' });
  }
};
