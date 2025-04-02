const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const dbService = require('./dbService');

// In-memory user store for when database is not available
const users = [];

/**
 * Register a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - The registered user
 */
async function registerUser(userData) {
  try {
    // Validate user data
    if (!userData.username || !userData.email || !userData.password) {
      throw new Error('Username, email, and password are required');
    }
    
    // Check if database is connected
    if (dbService.isConnected()) {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { username: userData.username },
          { email: userData.email },
        ],
      });
      
      if (existingUser) {
        throw new Error('Username or email already exists');
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user',
      });
      
      // Generate API key if requested
      if (userData.generateApiKey) {
        user.apiKey = generateApiKey();
      }
      
      // Save user
      await user.save();
      
      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;
      
      return userObject;
    } else {
      // Use in-memory storage
      
      // Check if user already exists
      const existingUser = users.find(u => 
        u.username === userData.username || u.email === userData.email
      );
      
      if (existingUser) {
        throw new Error('Username or email already exists');
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const user = {
        id: Math.random().toString(36).substring(2, 15),
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Generate API key if requested
      if (userData.generateApiKey) {
        user.apiKey = generateApiKey();
      }
      
      // Save user
      users.push(user);
      
      // Return user without password
      const userObject = { ...user };
      delete userObject.password;
      
      return userObject;
    }
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

/**
 * Login a user
 * @param {string} username - Username or email
 * @param {string} password - Password
 * @returns {Promise<Object>} - The logged in user and token
 */
async function loginUser(username, password) {
  try {
    let user;
    
    // Check if database is connected
    if (dbService.isConnected()) {
      // Find user
      user = await User.findOne({
        $or: [
          { username },
          { email: username },
        ],
      });
    } else {
      // Use in-memory storage
      user = users.find(u => u.username === username || u.email === username);
    }
    
    // Check if user exists
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check if user is active
    if (user.isActive === false) {
      throw new Error('User account is disabled');
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Return user without password
    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.password;
    
    return {
      user: userObject,
      token,
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - The user
 */
async function getUserById(userId) {
  try {
    let user;
    
    // Check if database is connected
    if (dbService.isConnected()) {
      // Find user
      user = await User.findById(userId);
    } else {
      // Use in-memory storage
      user = users.find(u => u.id === userId);
    }
    
    // Check if user exists
    if (!user) {
      throw new Error('User not found');
    }
    
    // Return user without password
    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.password;
    
    return userObject;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - The updated user
 */
async function updateUser(userId, updateData) {
  try {
    // Check if database is connected
    if (dbService.isConnected()) {
      // Find user
      const user = await User.findById(userId);
      
      // Check if user exists
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update user
      Object.keys(updateData).forEach(key => {
        if (key !== 'password' && key !== '_id') {
          user[key] = updateData[key];
        }
      });
      
      // Update password if provided
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(updateData.password, salt);
      }
      
      // Save user
      await user.save();
      
      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;
      
      return userObject;
    } else {
      // Use in-memory storage
      const userIndex = users.findIndex(u => u.id === userId);
      
      // Check if user exists
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update user
      const user = users[userIndex];
      
      Object.keys(updateData).forEach(key => {
        if (key !== 'password' && key !== 'id') {
          user[key] = updateData[key];
        }
      });
      
      // Update password if provided
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(updateData.password, salt);
      }
      
      // Update timestamp
      user.updatedAt = new Date().toISOString();
      
      // Return user without password
      const userObject = { ...user };
      delete userObject.password;
      
      return userObject;
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
function generateToken(user) {
  const payload = {
    id: user._id || user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1d' }
  );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Generate API key
 * @returns {string} - API key
 */
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let apiKey = 'ak_';
  
  for (let i = 0; i < 32; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return apiKey;
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  verifyToken,
  generateApiKey,
};
