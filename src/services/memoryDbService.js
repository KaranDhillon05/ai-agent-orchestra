const { Memory } = require('../models');
const dbService = require('./dbService');

/**
 * Store a new memory
 * @param {Object} memoryData - The memory data
 * @returns {Promise<Object>} - The stored memory
 */
async function storeMemory(memoryData) {
  try {
    if (!dbService.isConnected()) {
      return null; // Use in-memory storage instead
    }
    
    const memory = new Memory({
      id: memoryData.id,
      type: memoryData.type || 'task',
      query: memoryData.query,
      result: memoryData.result,
      metadata: memoryData.metadata || {},
    });
    
    await memory.save();
    
    return memory;
  } catch (error) {
    console.error('Error storing memory in database:', error);
    return null;
  }
}

/**
 * Get memories relevant to a query
 * @param {string} query - The query to find relevant memories for
 * @param {number} limit - Maximum number of memories to return
 * @returns {Promise<Array>} - Array of relevant memories
 */
async function getRelevantMemory(query, limit = 5) {
  try {
    if (!dbService.isConnected() || !query) {
      return []; // Use in-memory storage instead
    }
    
    // Simple text search for now
    // In a real implementation, this would use vector similarity search
    const memories = await Memory.find({
      $text: { $search: query },
    })
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(limit);
    
    return memories;
  } catch (error) {
    console.error('Error getting relevant memories:', error);
    return [];
  }
}

/**
 * Get all memories
 * @param {number} limit - Maximum number of memories to return
 * @returns {Promise<Array>} - Array of memories
 */
async function getAllMemories(limit = 100) {
  try {
    if (!dbService.isConnected()) {
      return []; // Use in-memory storage instead
    }
    
    const memories = await Memory.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return memories;
  } catch (error) {
    console.error('Error getting all memories:', error);
    return [];
  }
}

/**
 * Clear all memories
 * @returns {Promise<Object>} - Result of the operation
 */
async function clearAllMemories() {
  try {
    if (!dbService.isConnected()) {
      return { success: false, message: 'Database not connected' };
    }
    
    await Memory.deleteMany({});
    
    return { success: true, message: 'All memories cleared' };
  } catch (error) {
    console.error('Error clearing memories:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  storeMemory,
  getRelevantMemory,
  getAllMemories,
  clearAllMemories,
};
