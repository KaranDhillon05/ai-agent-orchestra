const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise<boolean>} - True if connected successfully, false otherwise
 */
async function connect(uri) {
  try {
    if (!uri || uri === 'mongodb://localhost:27017/agent-orchestra') {
      console.warn('MongoDB URI not provided or using default local URI. Using in-memory storage.');
      return false;
    }

    await mongoose.connect(uri);

    console.log('Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.warn('Falling back to in-memory storage');
    return false;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnect() {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}

/**
 * Check if connected to MongoDB
 * @returns {boolean} - True if connected, false otherwise
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connect,
  disconnect,
  isConnected,
};
