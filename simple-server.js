const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const geminiService = require('./src/services/geminiService');
const dbService = require('./src/services/dbService');
const agentDbService = require('./src/services/agentDbService');
const taskDbService = require('./src/services/taskDbService');
const memoryDbService = require('./src/services/memoryDbService');
const authService = require('./src/services/authService');
const { authenticateToken, isAdmin } = require('./src/middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Simple API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    name: 'AI Agent Orchestra',
    status: 'running',
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const user = await authService.registerUser({
      username,
      email,
      password,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({ error: error.message || 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const { user, token } = await authService.loginUser(username, password);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    res.json({
      message: 'Login successful',
      user,
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({ error: error.message || 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(404).json({ error: error.message || 'User not found' });
  }
});

// Mock agents data
const agents = [
  {
    id: 'researcher',
    name: 'Research Agent',
    description: 'Specializes in gathering and analyzing information from various sources',
    status: 'idle',
    capabilities: ['information retrieval', 'data analysis', 'fact verification'],
    model: 'gemini-1.5-pro',
    prompt: 'You are a Research Agent that specializes in gathering and analyzing information from various sources. Your goal is to thoroughly investigate topics, gather relevant information, evaluate sources, and synthesize comprehensive analyses.',
  },
  {
    id: 'planner',
    name: 'Planning Agent',
    description: 'Specializes in breaking down complex tasks into manageable steps',
    status: 'idle',
    capabilities: ['task decomposition', 'step sequencing', 'dependency analysis'],
    model: 'gemini-1.5-pro',
    prompt: 'You are a Planning Agent that specializes in breaking down complex tasks into manageable steps. Your goal is to analyze tasks, identify components, create clear action steps, determine logical sequences, and identify dependencies.',
  },
  {
    id: 'critic',
    name: 'Critic Agent',
    description: 'Specializes in evaluating solutions and identifying potential issues',
    status: 'idle',
    capabilities: ['solution evaluation', 'issue identification', 'risk assessment'],
    model: 'gemini-1.5-pro',
    prompt: 'You are a Critic Agent that specializes in evaluating solutions and identifying potential issues. Your goal is to analyze proposed solutions, identify flaws or weaknesses, assess risks, and suggest improvements.',
  },
  {
    id: 'creative',
    name: 'Creative Agent',
    description: 'Specializes in generating innovative ideas and solutions',
    status: 'idle',
    capabilities: ['idea generation', 'creative problem solving', 'innovative thinking'],
    model: 'gemini-1.5-pro',
    prompt: 'You are a Creative Agent that specializes in generating innovative ideas and solutions. Your goal is to think outside the box, approach problems from multiple perspectives, and develop novel concepts and solutions.',
  },
  {
    id: 'executor',
    name: 'Execution Agent',
    description: 'Specializes in implementing solutions and executing tasks',
    status: 'idle',
    capabilities: ['task execution', 'solution implementation', 'result synthesis'],
    model: 'gemini-1.5-pro',
    prompt: 'You are an Execution Agent that specializes in implementing solutions and executing tasks. Your goal is to understand requirements, implement effective solutions, execute necessary actions, and evaluate outcomes.',
  },
  {
    id: 'data-analyst',
    name: 'Data Analysis Agent',
    description: 'Specializes in analyzing data and extracting meaningful insights',
    status: 'idle',
    capabilities: ['data processing', 'statistical analysis', 'data visualization', 'insight extraction'],
    model: 'gemini-1.5-pro',
    prompt: 'You are a Data Analysis Agent that specializes in analyzing data and extracting meaningful insights. Your goal is to process data, perform statistical analyses, create visualizations, and extract actionable insights.',
  },
  {
    id: 'writer',
    name: 'Content Writing Agent',
    description: 'Specializes in creating high-quality written content for various purposes',
    status: 'idle',
    capabilities: ['content creation', 'copywriting', 'editing', 'tone adaptation'],
    model: 'gemini-1.5-pro',
    prompt: 'You are a Content Writing Agent that specializes in creating high-quality written content. Your goal is to craft engaging, clear, and effective content tailored to specific audiences and purposes.',
  },
  {
    id: 'summarizer',
    name: 'Summarization Agent',
    description: 'Specializes in condensing large amounts of information into concise summaries',
    status: 'idle',
    capabilities: ['text summarization', 'key point extraction', 'information distillation'],
    model: 'gemini-1.5-pro',
    prompt: 'You are a Summarization Agent that specializes in condensing large amounts of information into concise summaries. Your goal is to extract key points, maintain essential context, and present information efficiently.',
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant Agent',
    description: 'Specializes in writing, reviewing, and optimizing code',
    status: 'idle',
    capabilities: ['code generation', 'code review', 'debugging', 'optimization'],
    model: 'gemini-1.5-pro',
    prompt: 'You are a Code Assistant Agent that specializes in writing, reviewing, and optimizing code. Your goal is to generate efficient, readable code, identify and fix bugs, and suggest optimizations.',
  },
  {
    id: 'translator',
    name: 'Translation Agent',
    description: 'Specializes in translating content between different languages',
    status: 'idle',
    capabilities: ['language translation', 'cultural adaptation', 'context preservation'],
    model: 'gemini-1.5-pro',
    prompt: 'You are a Translation Agent that specializes in translating content between different languages. Your goal is to accurately translate text while preserving meaning, context, and cultural nuances.',
  },
];

// Agents endpoints
app.get('/api/agents', async (req, res) => {
  try {
    // Try to get agents from database
    const dbAgents = await agentDbService.getAgents();

    if (dbAgents) {
      // Use agents from database
      return res.json({
        count: dbAgents.length,
        agents: dbAgents,
      });
    }

    // Fall back to in-memory agents
    res.json({
      count: agents.length,
      agents,
    });
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

app.get('/api/agents/:agentId', async (req, res) => {
  try {
    const agentId = req.params.agentId;

    // Try to get agent from database
    const dbAgent = await agentDbService.getAgentById(agentId);

    if (dbAgent) {
      // Use agent from database
      return res.json(dbAgent);
    }

    // Fall back to in-memory agent
    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    console.error('Error getting agent:', error);
    res.status(500).json({ error: 'Failed to get agent' });
  }
});

// Mock tasks data
const tasks = [
  {
    id: '8265b9f1-29b8-4453-9215-ba893ee234ba',
    query: 'Create a marketing strategy for a new AI-powered fitness app',
    status: 'completed',
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T10:45:00Z',
    progress: 100,
    steps: [
      {
        id: 1,
        description: 'Analyze task and create execution plan',
        status: 'completed',
        agentId: 'planner',
      },
      {
        id: 2,
        description: 'Research fitness app market and target audience',
        status: 'completed',
        agentId: 'researcher',
      },
      {
        id: 3,
        description: 'Generate innovative marketing ideas',
        status: 'completed',
        agentId: 'creative',
      },
      {
        id: 4,
        description: 'Evaluate marketing strategy and identify potential issues',
        status: 'completed',
        agentId: 'critic',
      },
      {
        id: 5,
        description: 'Synthesize results and create final response',
        status: 'completed',
        agentId: 'executor',
      },
    ],
  },
  {
    id: '7a6e5d4c-3b2a-1098-7f6e-5d4c3b2a1098',
    query: 'Develop a content strategy for a B2B SaaS company',
    status: 'in_progress',
    createdAt: '2023-05-16T14:20:00Z',
    updatedAt: '2023-05-16T14:30:00Z',
    progress: 60,
    steps: [
      {
        id: 1,
        description: 'Analyze task and create execution plan',
        status: 'completed',
        agentId: 'planner',
      },
      {
        id: 2,
        description: 'Research B2B SaaS content marketing best practices',
        status: 'completed',
        agentId: 'researcher',
      },
      {
        id: 3,
        description: 'Generate content ideas and themes',
        status: 'in_progress',
        agentId: 'creative',
      },
    ],
  },
  {
    id: '2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
    query: 'Design a customer onboarding process for a fintech app',
    status: 'pending',
    createdAt: '2023-05-17T09:15:00Z',
    updatedAt: '2023-05-17T09:15:00Z',
    progress: 0,
    steps: [],
  },
];

// Tasks endpoints
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    // Try to get tasks from database for the current user
    const dbTasks = await taskDbService.getTasks(req.user.id);

    if (dbTasks) {
      // Use tasks from database
      return res.json({
        count: dbTasks.length,
        tasks: dbTasks,
      });
    }

    // Fall back to in-memory tasks, filtered by user ID if available
    const filteredTasks = req.user && req.user.id
      ? tasks.filter(t => t.userId === req.user.id)
      : tasks;

    res.json({
      count: filteredTasks.length,
      tasks: filteredTasks,
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

app.get('/api/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    // Try to get task from database
    const dbTask = await taskDbService.getTaskById(taskId);

    if (dbTask) {
      // Use task from database
      return res.json(dbTask);
    }

    // Fall back to in-memory task
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

app.get('/api/tasks/:taskId/result', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    // Try to get task from database
    const dbTask = await taskDbService.getTaskById(taskId);

    if (dbTask) {
      // Use task from database
      if (dbTask.status !== 'completed' || !dbTask.result) {
        return res.status(404).json({ error: 'Task not found or not completed' });
      }

      return res.json({
        id: dbTask.id,
        query: dbTask.query,
        result: dbTask.result,
        createdAt: dbTask.createdAt,
        completedAt: dbTask.updatedAt,
      });
    }

    // Fall back to in-memory task
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'completed') {
      return res.status(404).json({ error: 'Task not found or not completed' });
    }

    // Return the task result
    const result = {
      id: task.id,
      query: task.query,
      result: task.result || {
        content: 'Task completed successfully',
        confidence: 0.9,
        metadata: {
          agent: 'executor',
          timestamp: task.updatedAt,
        },
      },
      createdAt: task.createdAt,
      completedAt: task.updatedAt,
    };

    res.json(result);
  } catch (error) {
    console.error('Error getting task result:', error);
    res.status(500).json({ error: 'Failed to get task result' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { query, context = {}, priority = 'normal' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Create a new task with a unique ID
    const taskId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const newTask = {
      id: taskId,
      query,
      context,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      steps: [],
      userId: req.user.id, // Add user ID from authenticated user
    };

    // Try to save task to database
    let savedTask = null;
    if (dbConnected) {
      savedTask = await taskDbService.createTask(newTask);
    }

    // If database save failed, use in-memory storage
    if (!savedTask) {
      tasks.unshift(newTask);
    }

    // Start processing the task asynchronously
    processTask(savedTask || newTask).catch(error => {
      console.error(`Error processing task ${taskId}:`, error);

      // Update task status in database or in-memory
      if (dbConnected) {
        taskDbService.updateTask(taskId, {
          status: 'failed',
          error: error.message,
          updatedAt: new Date().toISOString(),
        }).catch(err => console.error(`Error updating task ${taskId} status:`, err));
      } else {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          task.status = 'failed';
          task.error = error.message;
          task.updatedAt = new Date().toISOString();
        }
      }
    });

    res.status(201).json({
      message: 'Task created successfully',
      taskId: newTask.id,
      status: newTask.status,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * Process a task through the agent orchestra
 * @param {Object} task - The task to process
 */
async function processTask(task) {
  try {
    // Update task status
    task.status = 'in_progress';
    task.updatedAt = new Date().toISOString();
    task.progress = 10;

    // Update task in database if connected
    if (dbConnected) {
      await taskDbService.updateTaskStatus(task.id, 'in_progress', 10);
    }

    // Step 1: Planning with the planner agent
    const planningStep = {
      id: 1,
      description: 'Analyze task and create execution plan',
      status: 'in_progress',
      agentId: 'planner',
      startedAt: new Date().toISOString(),
    };
    task.steps.push(planningStep);

    // Add step to database if connected
    if (dbConnected) {
      await taskDbService.addTaskStep(task.id, planningStep);
    }

    // Generate a plan using the LLM
    const planPrompt = `You are a Planning Agent that specializes in breaking down complex tasks into manageable steps.

Task: ${task.query}

As a Planning Agent, your goal is to:
1. Analyze the overall task and identify its components
2. Break down the task into clear, actionable steps
3. Determine the logical sequence of steps
4. Identify dependencies between steps
5. Assign the most appropriate agent type for each step

Provide a detailed plan with 3-5 steps. For each step, include:
- Step description
- The agent type that should handle it (researcher, planner, creative, critic, or executor)

Format your response as a numbered list of steps.`;

    const planResult = await geminiService.generateResponse(planPrompt, { temperature: 0.7 });

    // Update planning step
    planningStep.status = 'completed';
    planningStep.completedAt = new Date().toISOString();
    planningStep.result = planResult;

    // Update step in database if connected
    if (dbConnected) {
      await taskDbService.updateTaskStep(task.id, planningStep.id, {
        status: 'completed',
        completedAt: planningStep.completedAt,
        result: planResult,
      });
    }

    // Parse the plan to extract steps
    const planSteps = extractStepsFromPlan(planResult.content);
    task.progress = 25;
    task.updatedAt = new Date().toISOString();

    // Update task progress in database if connected
    if (dbConnected) {
      await taskDbService.updateTaskStatus(task.id, 'in_progress', 25);
    }

    // Execute each step of the plan
    for (let i = 0; i < planSteps.length; i++) {
      const planStep = planSteps[i];

      // Add execution step
      const executionStep = {
        id: i + 2, // +2 because we already have the planning step
        description: planStep.description,
        status: 'in_progress',
        agentId: planStep.agentId,
        startedAt: new Date().toISOString(),
      };
      task.steps.push(executionStep);

      // Add step to database if connected
      if (dbConnected) {
        await taskDbService.addTaskStep(task.id, executionStep);
      }

      // Update agent status in database if connected
      if (dbConnected) {
        await agentDbService.updateAgentStatus(planStep.agentId, 'busy');
      }

      // Generate a prompt based on the agent type
      const stepPrompt = generateAgentPrompt(planStep.agentId, planStep.description, task.query, {
        previousSteps: task.steps.filter(s => s.status === 'completed').map(s => ({
          description: s.description,
          result: s.result?.content || JSON.stringify(s.result),
          agentId: s.agentId,
        })),
      });

      // Process with the selected agent
      const stepResult = await geminiService.generateResponse(stepPrompt, { temperature: 0.8 });

      // Update execution step
      executionStep.status = 'completed';
      executionStep.completedAt = new Date().toISOString();
      executionStep.result = stepResult;

      // Update step in database if connected
      if (dbConnected) {
        await taskDbService.updateTaskStep(task.id, executionStep.id, {
          status: 'completed',
          completedAt: executionStep.completedAt,
          result: stepResult,
        });

        // Reset agent status
        await agentDbService.updateAgentStatus(planStep.agentId, 'idle');

        // Add task to agent history
        await agentDbService.addTaskToAgentHistory(planStep.agentId, {
          id: task.id,
          query: planStep.description,
          result: stepResult.content,
        });
      }

      // Update task progress
      task.progress = 25 + Math.round(((i + 1) / planSteps.length) * 50);
      task.updatedAt = new Date().toISOString();

      // Update task progress in database if connected
      if (dbConnected) {
        await taskDbService.updateTaskStatus(task.id, 'in_progress', task.progress);
      }
    }

    // Final synthesis step
    const synthesisStep = {
      id: task.steps.length + 1,
      description: 'Synthesize results and create final response',
      status: 'in_progress',
      agentId: 'executor',
      startedAt: new Date().toISOString(),
    };
    task.steps.push(synthesisStep);

    // Add step to database if connected
    if (dbConnected) {
      await taskDbService.addTaskStep(task.id, synthesisStep);
      await agentDbService.updateAgentStatus('executor', 'busy');
    }

    // Generate the synthesis prompt
    const synthesisPrompt = `You are an Execution Agent that specializes in synthesizing information and creating final responses.

Original Task: ${task.query}

Previous steps and their results:
${task.steps.filter(s => s.status === 'completed').map(s =>
  `Step: ${s.description} (${s.agentId})
Result: ${s.result?.content || JSON.stringify(s.result)}
`
).join('\n')}

As an Execution Agent, your goal is to:
1. Synthesize the information from all previous steps
2. Create a comprehensive and coherent final response to the original task
3. Ensure all key points from the previous steps are included
4. Format the response in a clear and organized manner

Provide a detailed final response that addresses the original task.`;

    const synthesisResult = await geminiService.generateResponse(synthesisPrompt, { temperature: 0.7 });

    // Update synthesis step
    synthesisStep.status = 'completed';
    synthesisStep.completedAt = new Date().toISOString();
    synthesisStep.result = synthesisResult;

    // Update step in database if connected
    if (dbConnected) {
      await taskDbService.updateTaskStep(task.id, synthesisStep.id, {
        status: 'completed',
        completedAt: synthesisStep.completedAt,
        result: synthesisResult,
      });

      // Reset agent status
      await agentDbService.updateAgentStatus('executor', 'idle');

      // Add task to agent history
      await agentDbService.addTaskToAgentHistory('executor', {
        id: task.id,
        query: 'Synthesize final response',
        result: synthesisResult.content,
      });
    }

    // Update task status and result
    task.status = 'completed';
    task.result = synthesisResult;
    task.progress = 100;
    task.updatedAt = new Date().toISOString();

    // Update task in database if connected
    if (dbConnected) {
      await taskDbService.setTaskResult(task.id, synthesisResult);

      // Store the task in memory for future reference
      await memoryDbService.storeMemory({
        id: task.id,
        type: 'task',
        query: task.query,
        result: synthesisResult.content,
        metadata: {
          taskId: task.id,
          steps: task.steps.length,
          agents: task.steps.map(s => s.agentId).filter((v, i, a) => a.indexOf(v) === i), // Unique agents
        },
      });
    }

    return task;
  } catch (error) {
    console.error(`Error processing task ${task.id}:`, error);

    // Update task status
    task.status = 'failed';
    task.error = error.message;
    task.updatedAt = new Date().toISOString();

    // Update task in database if connected
    if (dbConnected) {
      await taskDbService.updateTask(task.id, {
        status: 'failed',
        error: error.message,
        updatedAt: new Date().toISOString(),
      });
    }

    throw error;
  }
}

/**
 * Extract steps from the plan generated by the planner agent
 * @param {string} planContent - The content of the plan
 * @returns {Array} - Array of steps with description and agentId
 */
function extractStepsFromPlan(planContent) {
  const steps = [];

  // Look for numbered steps (e.g., "1. Research the market")
  const stepRegex = /(\d+)\s*\.\s*([^\n]+)(?:[^\n]*agent:\s*([^\n\.,]+)|[^\n]*\(([^\n\)]+)\))?/gi;

  let match;
  while ((match = stepRegex.exec(planContent)) !== null) {
    const description = match[2].trim();
    let agentId = (match[3] || match[4] || '').toLowerCase().trim();

    // Map agent mentions to our agent IDs
    if (agentId.includes('research')) {
      agentId = 'researcher';
    } else if (agentId.includes('plan')) {
      agentId = 'planner';
    } else if (agentId.includes('creat')) {
      agentId = 'creative';
    } else if (agentId.includes('critic') || agentId.includes('evaluat')) {
      agentId = 'critic';
    } else if (agentId.includes('execut') || agentId.includes('implement')) {
      agentId = 'executor';
    } else if (agentId.includes('data') || agentId.includes('analy')) {
      agentId = 'data-analyst';
    } else if (agentId.includes('writ') || agentId.includes('content')) {
      agentId = 'writer';
    } else if (agentId.includes('summar') || agentId.includes('condens')) {
      agentId = 'summarizer';
    } else if (agentId.includes('code') || agentId.includes('program')) {
      agentId = 'code-assistant';
    } else if (agentId.includes('translat') || agentId.includes('language')) {
      agentId = 'translator';
    } else {
      // Default to researcher if no agent is specified
      agentId = 'researcher';
    }

    // Verify that the agent exists
    const agentExists = agents.some(a => a.id === agentId);
    if (!agentExists) {
      agentId = 'researcher'; // Fall back to researcher if agent doesn't exist
    }

    steps.push({
      description,
      agentId,
    });
  }

  // If no steps were found, create a default step
  if (steps.length === 0) {
    steps.push({
      description: 'Research and gather information',
      agentId: 'researcher',
    });
    steps.push({
      description: 'Generate creative solutions',
      agentId: 'creative',
    });
    steps.push({
      description: 'Evaluate and refine the solution',
      agentId: 'critic',
    });
  }

  return steps;
}

/**
 * Generate a prompt for a specific agent type
 * @param {string} agentId - The ID of the agent
 * @param {string} stepDescription - The description of the step
 * @param {string} originalQuery - The original query
 * @param {Object} context - Additional context
 * @returns {string} - The generated prompt
 */
function generateAgentPrompt(agentId, stepDescription, originalQuery, context = {}) {
  const previousStepsText = context.previousSteps && context.previousSteps.length > 0
    ? `Previous steps and their results:\n${context.previousSteps.map(s =>
        `Step: ${s.description} (${s.agentId})\nResult: ${s.result}\n`
      ).join('\n')}`
    : '';

  // Find the agent by ID
  const agent = agents.find(a => a.id === agentId);

  // If agent has a custom prompt, use it
  if (agent && agent.prompt) {
    return `${agent.prompt}\n\nTask: ${stepDescription}\n\nOriginal Query: ${originalQuery}\n\n${previousStepsText}\n\nProvide a detailed response that addresses the task.`;
  }

  // Default prompts for backward compatibility
  switch (agentId) {
    case 'researcher':
      return `You are a Research Agent that specializes in gathering and analyzing information from various sources.\n\nTask: ${stepDescription}\n\nOriginal Query: ${originalQuery}\n\n${previousStepsText}\n\nAs a Research Agent, your goal is to:\n1. Thoroughly investigate the topic or question\n2. Gather relevant information from multiple sources\n3. Evaluate the credibility and reliability of sources\n4. Synthesize the information into a comprehensive analysis\n5. Identify any gaps in knowledge or areas of uncertainty\n\nProvide a detailed research report that addresses the task.`;

    case 'planner':
      return `You are a Planning Agent that specializes in breaking down complex tasks into manageable steps.\n\nTask: ${stepDescription}\n\nOriginal Query: ${originalQuery}\n\n${previousStepsText}\n\nAs a Planning Agent, your goal is to:\n1. Analyze the overall task and identify its components\n2. Break down the task into clear, actionable steps\n3. Determine the logical sequence of steps\n4. Identify dependencies between steps\n5. Estimate time and resources needed for each step\n\nProvide a detailed plan that addresses the task.`;

    case 'creative':
      return `You are a Creative Agent that specializes in generating innovative ideas and solutions.\n\nTask: ${stepDescription}\n\nOriginal Query: ${originalQuery}\n\n${previousStepsText}\n\nAs a Creative Agent, your goal is to:\n1. Think outside the box and generate novel ideas\n2. Approach problems from multiple perspectives\n3. Develop innovative solutions or concepts\n4. Combine ideas in unexpected ways\n5. Push beyond conventional thinking\n\nProvide creative ideas and solutions that address the task.`;

    case 'critic':
      return `You are a Critic Agent that specializes in evaluating solutions and identifying potential issues.\n\nTask: ${stepDescription}\n\nOriginal Query: ${originalQuery}\n\n${previousStepsText}\n\nAs a Critic Agent, your goal is to:\n1. Carefully analyze the proposed solution or information\n2. Identify potential issues, flaws, or weaknesses\n3. Assess risks and limitations\n4. Evaluate the quality and effectiveness\n5. Suggest improvements or alternatives\n\nProvide a detailed critique that addresses the task.`;

    case 'executor':
      return `You are an Execution Agent that specializes in implementing solutions and executing tasks.\n\nTask: ${stepDescription}\n\nOriginal Query: ${originalQuery}\n\n${previousStepsText}\n\nAs an Execution Agent, your goal is to:\n1. Understand the task requirements and objectives\n2. Implement the most effective solution\n3. Execute the necessary actions to complete the task\n4. Synthesize results from previous steps\n5. Evaluate the outcome and ensure it meets the requirements\n\nProvide a detailed response that addresses the task.`;

    default:
      return `You are an AI assistant helping with the following task: ${stepDescription}\n\nOriginal Query: ${originalQuery}\n\n${previousStepsText}\n\nPlease provide a detailed response that addresses this task.`;
  }
}

// Serve static files and the index.html for all routes
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for specific frontend routes
const frontendRoutes = ['/', '/agents', '/tasks', '/tasks/create'];
frontendRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
});

// Handle task detail routes
app.get('/tasks/:taskId', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialize services
const geminiInitialized = geminiService.initialize(process.env.GEMINI_API_KEY);

// Connect to MongoDB
let dbConnected = false;
dbService.connect(process.env.MONGODB_URI)
  .then(connected => {
    dbConnected = connected;
    if (connected) {
      // Initialize default agents in the database
      return agentDbService.initializeDefaultAgents(agents);
    }
  })
  .catch(error => {
    console.error('Error initializing database:', error);
  });

// Add LLM API endpoint
app.post('/api/llm/generate', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await geminiService.generateResponse(prompt, options);

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error generating LLM response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate response',
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Gemini API ${geminiInitialized ? 'initialized successfully' : 'using mock responses'}`);
});
