const { v4: uuidv4 } = require('uuid');
const agentService = require('../agents/agentService');
const memoryService = require('../memory/memoryService');
const config = require('../config');
const DevelopmentAgent = require('../agents/DevelopmentAgent');
const ArchitectAgent = require('../agents/ArchitectAgent');
const FrontendEngineerAgent = require('../agents/FrontendEngineerAgent');
const BackendEngineerAgent = require('../agents/BackendEngineerAgent');
const PlannerAgent = require('../agents/PlannerAgent');
const ExecutorAgent = require('../agents/ExecutorAgent');
const CriticAgent = require('../agents/CriticAgent');
const ResearchAgent = require('../agents/ResearchAgent');
const CreativeAgent = require('../agents/CreativeAgent');

// In-memory store for tasks (in a production app, this would be a database)
const tasks = {};

class OrchestrationService {
  constructor() {
    this.agents = {
      architect: new ArchitectAgent(),
      frontend: new FrontendEngineerAgent(),
      backend: new BackendEngineerAgent(),
      development: new DevelopmentAgent(),
      planner: new PlannerAgent(),
      executor: new ExecutorAgent(),
      critic: new CriticAgent(),
      research: new ResearchAgent(),
      creative: new CreativeAgent()
    };
    
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.taskHistory = [];
  }

  async initialize() {
    // Initialize all agents
    for (const [name, agent] of Object.entries(this.agents)) {
      await agent.initialize();
    }
  }

  async handleDevelopmentRequest(request) {
    const {
      type,
      requirements,
      context = {},
      priority = 'normal',
      dependencies = []
    } = request;

    // Create a task ID
    const taskId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create task object
    const task = {
      id: taskId,
      type,
      requirements,
      context,
      priority,
      dependencies,
      status: 'pending',
      created: new Date(),
      updated: new Date(),
      steps: [],
      results: {}
    };

    // Add to queue
    this.taskQueue.push(task);
    
    // Process the task
    return this.processDevelopmentTask(task);
  }

  async processDevelopmentTask(task) {
    try {
      task.status = 'processing';
      this.activeTasks.set(task.id, task);

      // Step 1: Planning
      const plan = await this.agents.planner.createPlan(task.requirements);
      task.steps.push({ name: 'planning', result: plan });

      // Step 2: Research
      const research = await this.agents.research.gatherInformation(plan);
      task.steps.push({ name: 'research', result: research });

      // Step 3: Architecture Design
      const architecture = await this.agents.architect.designSystemArchitecture({
        ...task.requirements,
        research
      });
      task.steps.push({ name: 'architecture', result: architecture });

      // Step 4: Technology Stack Selection
      const techStack = await this.agents.architect.selectTechnologyStack({
        ...task.requirements,
        architecture
      });
      task.steps.push({ name: 'tech_stack', result: techStack });

      // Step 5: Database Design
      const database = await this.agents.architect.designDatabaseSchema({
        ...task.requirements,
        architecture
      });
      task.steps.push({ name: 'database', result: database });

      // Step 6: API Design
      const api = await this.agents.architect.designAPIs({
        ...task.requirements,
        architecture
      });
      task.steps.push({ name: 'api', result: api });

      // Step 7: Frontend Implementation
      const frontend = await this.agents.frontend.createComponent({
        ...task.requirements,
        architecture,
        techStack
      });
      task.steps.push({ name: 'frontend', result: frontend });

      // Step 8: Backend Implementation
      const backend = await this.agents.backend.implementAPI({
        ...task.requirements,
        architecture,
        techStack,
        api
      });
      task.steps.push({ name: 'backend', result: backend });

      // Step 9: Database Integration
      const dbIntegration = await this.agents.backend.implementDatabaseIntegration({
        ...task.requirements,
        architecture,
        techStack,
        database
      });
      task.steps.push({ name: 'db_integration', result: dbIntegration });

      // Step 10: Authentication Implementation
      const auth = await this.agents.backend.implementAuthentication({
        ...task.requirements,
        architecture,
        techStack
      });
      task.steps.push({ name: 'authentication', result: auth });

      // Step 11: Testing Implementation
      const tests = await this.agents.backend.implementTesting({
        ...task.requirements,
        architecture,
        techStack,
        components: {
          frontend,
          backend,
          database: dbIntegration,
          auth
        }
      });
      task.steps.push({ name: 'testing', result: tests });

      // Step 12: Deployment Configuration
      const deployment = await this.agents.architect.designDeploymentArchitecture({
        ...task.requirements,
        architecture,
        techStack
      });
      task.steps.push({ name: 'deployment', result: deployment });

      // Step 13: Final Review
      const finalReview = await this.agents.critic.reviewCompleteSolution({
        architecture,
        techStack,
        frontend,
        backend,
        database: dbIntegration,
        auth,
        tests,
        deployment,
        requirements: task.requirements
      });
      task.steps.push({ name: 'final_review', result: finalReview });

      // Update task status
      task.status = 'completed';
      task.updated = new Date();
      task.results = {
        architecture,
        techStack,
        frontend,
        backend,
        database: dbIntegration,
        auth,
        tests,
        deployment,
        reviews: [finalReview]
      };

      // Store in memory
      await memoryService.storeTask(task);

      return task;
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.updated = new Date();
      throw error;
    } finally {
      this.activeTasks.delete(task.id);
    }
  }

  async handleComplexTask(task) {
    // Break down complex task into smaller subtasks
    const subtasks = await this.agents.planner.breakdownTask(task);
    
    // Process each subtask
    const results = await Promise.all(
      subtasks.map(async (subtask) => {
        if (subtask.type === 'development') {
          return this.handleDevelopmentRequest(subtask);
        }
        // Handle other types of tasks
        return this.processTask(subtask);
      })
    );

    // Combine results
    return this.agents.planner.combineResults(results);
  }

  async getTaskStatus(taskId) {
    const task = this.activeTasks.get(taskId) || 
                 this.taskHistory.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    return {
      id: task.id,
      status: task.status,
      progress: this.calculateProgress(task),
      steps: task.steps,
      error: task.error
    };
  }

  calculateProgress(task) {
    if (task.status === 'completed') return 100;
    if (task.status === 'failed') return 0;
    
    const totalSteps = 13; // Total number of steps in processDevelopmentTask
    const completedSteps = task.steps.length;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  async getTaskHistory() {
    return this.taskHistory;
  }

  async clearTaskHistory() {
    this.taskHistory = [];
  }
}

module.exports = new OrchestrationService();

/**
 * Get a list of all tasks
 * @returns {Array} - Array of tasks
 */
exports.listTasks = async () => {
  // Convert tasks object to array and sort by creation date (newest first)
  return Object.values(tasks).sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

/**
 * Create a new task for the agent orchestra to process
 * @param {string} query - The user's query or task description
 * @param {Object} context - Additional context for the task
 * @param {string} priority - Task priority (low, normal, high)
 * @returns {Object} - The created task
 */
exports.createTask = async (query, context = {}, priority = 'normal') => {
  const taskId = uuidv4();

  const task = {
    id: taskId,
    query,
    context,
    priority,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    agentAssignments: [],
    steps: [],
    result: null,
  };

  tasks[taskId] = task;

  // Start processing the task asynchronously
  this.processTask(taskId).catch(error => {
    console.error(`Error processing task ${taskId}:`, error);
    tasks[taskId].status = 'failed';
    tasks[taskId].error = error.message;
    tasks[taskId].updatedAt = new Date().toISOString();
  });

  return task;
};

/**
 * Get the status of a specific task
 * @param {string} taskId - The ID of the task
 * @returns {Object} - The task status
 */
exports.getTaskStatus = async (taskId) => {
  const task = tasks[taskId];

  if (!task) {
    return null;
  }

  return {
    id: task.id,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    steps: task.steps.map(step => ({
      id: step.id,
      description: step.description,
      status: step.status,
      agentId: step.agentId,
    })),
    progress: calculateTaskProgress(task),
  };
};

/**
 * Get the result of a completed task
 * @param {string} taskId - The ID of the task
 * @returns {Object} - The task result
 */
exports.getTaskResult = async (taskId) => {
  const task = tasks[taskId];

  if (!task || task.status !== 'completed') {
    return null;
  }

  return {
    id: task.id,
    query: task.query,
    result: task.result,
    steps: task.steps.map(step => ({
      id: step.id,
      description: step.description,
      agentId: step.agentId,
      result: step.result,
    })),
    createdAt: task.createdAt,
    completedAt: task.updatedAt,
  };
};

/**
 * Process a task through the agent orchestra
 * @param {string} taskId - The ID of the task to process
 */
exports.processTask = async (taskId) => {
  const task = tasks[taskId];

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  try {
    // Update task status
    task.status = 'in_progress';
    task.updatedAt = new Date().toISOString();

    // Step 1: Analyze the task with the planner agent
    const plannerAgent = agentService.getAgentInstance('planner');
    if (!plannerAgent) {
      throw new Error('Planner agent not available');
    }

    // Add planning step
    const planningStep = {
      id: 1,
      description: 'Analyze task and create execution plan',
      status: 'in_progress',
      agentId: 'planner',
      startedAt: new Date().toISOString(),
    };
    task.steps.push(planningStep);

    // Process with planner agent
    const planResult = await plannerAgent.processTask({
      id: `${taskId}-plan`,
      query: `Create a plan to address the following task: ${task.query}`,
    }, task.context);

    // Update planning step
    planningStep.status = 'completed';
    planningStep.completedAt = new Date().toISOString();
    planningStep.result = planResult;

    // Extract plan steps
    const planSteps = planResult.plan?.steps || [];

    // Step 2: Execute each step of the plan with appropriate agents
    for (let i = 0; i < planSteps.length; i++) {
      const planStep = planSteps[i];

      // Determine the best agent for this step
      const agentId = determineAgentForStep(planStep);
      const agent = agentService.getAgentInstance(agentId);

      if (!agent) {
        throw new Error(`Agent ${agentId} not available for step ${planStep.id}`);
      }

      // Add execution step
      const executionStep = {
        id: i + 2, // +2 because we already have the planning step
        description: planStep.description,
        status: 'in_progress',
        agentId,
        startedAt: new Date().toISOString(),
      };
      task.steps.push(executionStep);

      // Process with selected agent
      const stepResult = await agent.processTask({
        id: `${taskId}-step-${planStep.id}`,
        query: planStep.description,
      }, {
        ...task.context,
        previousSteps: task.steps.filter(s => s.status === 'completed').map(s => ({
          description: s.description,
          result: s.result?.content || s.result,
          agentId: s.agentId,
        })),
      });

      // Update execution step
      executionStep.status = 'completed';
      executionStep.completedAt = new Date().toISOString();
      executionStep.result = stepResult;
    }

    // Step 3: Synthesize results with the executor agent
    const executorAgent = agentService.getAgentInstance('executor');
    if (!executorAgent) {
      throw new Error('Executor agent not available');
    }

    // Add synthesis step
    const synthesisStep = {
      id: task.steps.length + 1,
      description: 'Synthesize results and create final response',
      status: 'in_progress',
      agentId: 'executor',
      startedAt: new Date().toISOString(),
    };
    task.steps.push(synthesisStep);

    // Process with executor agent
    const synthesisResult = await executorAgent.processTask({
      id: `${taskId}-synthesis`,
      query: `Synthesize the results of the following steps to create a comprehensive response to the original task: ${task.query}`,
    }, {
      ...task.context,
      steps: task.steps.filter(s => s.status === 'completed').map(s => ({
        description: s.description,
        result: s.result?.content || s.result,
        agentId: s.agentId,
      })),
    });

    // Update synthesis step
    synthesisStep.status = 'completed';
    synthesisStep.completedAt = new Date().toISOString();
    synthesisStep.result = synthesisResult;

    // Update task status and result
    task.status = 'completed';
    task.result = synthesisResult;
    task.updatedAt = new Date().toISOString();

    // Store the task in memory for future reference
    await memoryService.storeMemory({
      type: 'task',
      query: task.query,
      result: synthesisResult.content,
      metadata: {
        taskId: task.id,
        steps: task.steps.length,
        agents: task.steps.map(s => s.agentId).filter((v, i, a) => a.indexOf(v) === i), // Unique agents
      },
    });

    return task;
  } catch (error) {
    console.error(`Error processing task ${taskId}:`, error);
    task.status = 'failed';
    task.error = error.message;
    task.updatedAt = new Date().toISOString();
    throw error;
  }
};

/**
 * Calculate the progress percentage of a task
 * @param {Object} task - The task object
 * @returns {number} - Progress percentage (0-100)
 */
function calculateTaskProgress(task) {
  if (task.status === 'pending') {
    return 0;
  }

  if (task.status === 'completed') {
    return 100;
  }

  if (task.status === 'failed') {
    // Calculate progress based on completed steps
    const totalSteps = task.steps.length || 1;
    const completedSteps = task.steps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  // For in_progress tasks, calculate based on steps
  const totalSteps = Math.max(task.steps.length, 1);
  const completedSteps = task.steps.filter(step => step.status === 'completed').length;
  const inProgressSteps = task.steps.filter(step => step.status === 'in_progress').length;

  // Count in-progress steps as half-completed
  return Math.round(((completedSteps + (inProgressSteps * 0.5)) / totalSteps) * 100);
}

/**
 * Determine the most appropriate agent for a given step
 * @param {Object} step - The step to assign an agent to
 * @returns {string} - The ID of the selected agent
 */
function determineAgentForStep(step) {
  const description = step.description.toLowerCase();

  // Simple keyword matching for agent selection
  // In a real implementation, this would be more sophisticated
  if (description.includes('research') ||
      description.includes('gather') ||
      description.includes('analyze') ||
      description.includes('information')) {
    return 'researcher';
  }

  if (description.includes('evaluate') ||
      description.includes('assess') ||
      description.includes('review') ||
      description.includes('critique')) {
    return 'critic';
  }

  if (description.includes('create') ||
      description.includes('generate') ||
      description.includes('design') ||
      description.includes('develop')) {
    return 'creative';
  }

  if (description.includes('implement') ||
      description.includes('execute') ||
      description.includes('perform') ||
      description.includes('carry out')) {
    return 'executor';
  }

  // Default to executor agent if no clear match
  return 'executor';
}
