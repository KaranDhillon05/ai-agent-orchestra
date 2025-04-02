const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// In-memory store for memories (in a production app, this would be a vector database)
const memories = [];

/**
 * Store a new memory in the system
 * @param {Object} memory - The memory to store
 * @returns {Object} - The stored memory with ID
 */
exports.storeMemory = async (memory) => {
  const memoryId = uuidv4();
  
  const newMemory = {
    id: memoryId,
    ...memory,
    createdAt: new Date().toISOString(),
  };
  
  memories.unshift(newMemory); // Add to the beginning for recency
  
  // Limit the number of memories based on configuration
  if (memories.length > config.memory.retentionLimit) {
    memories.length = config.memory.retentionLimit;
  }
  
  return newMemory;
};

/**
 * Retrieve memories relevant to a query
 * @param {string} query - The query to find relevant memories for
 * @param {number} limit - Maximum number of memories to return
 * @returns {Array} - Array of relevant memories
 */
exports.getRelevantMemory = async (query, limit = 5) => {
  // In a real implementation, this would use vector similarity search
  // For now, we'll use simple keyword matching
  
  if (!query || memories.length === 0) {
    return [];
  }
  
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  // Score memories based on term overlap
  const scoredMemories = memories.map(memory => {
    const memoryText = `${memory.query || ''} ${memory.result || ''}`.toLowerCase();
    
    // Count matching terms
    const matchCount = queryTerms.reduce((count, term) => {
      return count + (memoryText.includes(term) ? 1 : 0);
    }, 0);
    
    // Calculate score based on match count and recency
    const matchScore = matchCount / queryTerms.length;
    
    // Get age in days
    const ageInDays = (new Date() - new Date(memory.createdAt)) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - (ageInDays / 30)); // Decay over 30 days
    
    // Combined score with recency bias
    const score = (matchScore * 0.7) + (recencyScore * 0.3);
    
    return { memory, score };
  });
  
  // Sort by score and take the top results
  const relevantMemories = scoredMemories
    .filter(item => item.score > 0.1) // Minimum relevance threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => ({
      ...item.memory,
      relevanceScore: item.score,
    }));
  
  return relevantMemories;
};

/**
 * Get all memories (for debugging/admin purposes)
 * @param {number} limit - Maximum number of memories to return
 * @returns {Array} - Array of memories
 */
exports.getAllMemories = async (limit = 100) => {
  return memories.slice(0, limit);
};

/**
 * Clear all memories (for debugging/admin purposes)
 */
exports.clearAllMemories = async () => {
  memories.length = 0;
  return { success: true, message: 'All memories cleared' };
};
