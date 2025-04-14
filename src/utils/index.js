/**
 * Utility functions for the AI Agent Orchestra
 */

/**
 * Generate a unique ID with a prefix
 * @param {string} prefix - Prefix for the ID
 * @returns {string} - Unique ID
 */
exports.generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}-${randomStr}`;
};

/**
 * Format a date as an ISO string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
exports.formatDate = (date = new Date()) => {
  return date.toISOString();
};

/**
 * Truncate a string to a maximum length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated string
 */
exports.truncate = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + '...';
};

/**
 * Extract keywords from a text
 * @param {string} text - Text to extract keywords from
 * @param {number} maxKeywords - Maximum number of keywords to extract
 * @returns {Array} - Array of keywords
 */
exports.extractKeywords = (text, maxKeywords = 10) => {
  if (!text) {
    return [];
  }
  
  // Simple keyword extraction based on word frequency
  // In a real implementation, this would be more sophisticated
  
  // Remove common stop words
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of',
    'that', 'this', 'these', 'those', 'it', 'its', 'they', 'them',
    'their', 'we', 'us', 'our', 'you', 'your', 'he', 'him', 'his',
    'she', 'her', 'i', 'me', 'my', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
    'can', 'could', 'may', 'might', 'must', 'from',
  ]);
  
  // Tokenize and count word frequency
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 2 && !stopWords.has(word)); // Filter stop words and short words
  
  // Count word frequency
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Sort by frequency and take top keywords
  const keywords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
  
  return keywords;
};

/**
 * Calculate similarity between two texts
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} - Similarity score (0-1)
 */
exports.calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2) {
    return 0;
  }
  
  // Simple Jaccard similarity based on word overlap
  // In a real implementation, this would use embeddings or more sophisticated methods
  
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  // Calculate intersection and union
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  // Jaccard similarity
  return intersection.size / union.size;
};
