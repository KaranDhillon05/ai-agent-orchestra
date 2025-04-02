const mongoose = require('mongoose');

// Agent Schema
const agentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    default: 'gpt-4',
  },
  status: {
    type: String,
    enum: ['idle', 'busy', 'error'],
    default: 'idle',
  },
  capabilities: {
    type: [String],
    default: [],
  },
  taskHistory: {
    type: [{
      id: String,
      query: String,
      timestamp: Date,
      result: String,
    }],
    default: [],
  },
}, {
  timestamps: true,
});

// Task Schema
const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  query: {
    type: String,
    required: true,
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  steps: {
    type: [{
      id: Number,
      description: String,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'failed'],
        default: 'pending',
      },
      agentId: String,
      startedAt: Date,
      completedAt: Date,
      result: mongoose.Schema.Types.Mixed,
    }],
    default: [],
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  error: {
    type: String,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Memory Schema
const memorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['task', 'conversation', 'knowledge'],
    default: 'task',
  },
  query: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  apiKey: {
    type: String,
    unique: true,
    sparse: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Add task reference to user schema
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'userId',
});

// Create models
const Agent = mongoose.model('Agent', agentSchema);
const Task = mongoose.model('Task', taskSchema);
const Memory = mongoose.model('Memory', memorySchema);
const User = mongoose.model('User', userSchema);

module.exports = {
  Agent,
  Task,
  Memory,
  User,
};
