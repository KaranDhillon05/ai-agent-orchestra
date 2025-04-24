const orchestrationService = require('../orchestration/orchestrationService');
const agentService = require('../agents/agentService');

// Mock dependencies
jest.mock('../agents/agentService');
jest.mock('../memory/memoryService');

describe('Orchestration Service', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock agent instances
    const mockAgent = {
      processTask: jest.fn().mockResolvedValue({
        content: 'Mock agent response',
        summary: 'Mock summary',
        confidence: 0.8,
      }),
    };
    
    // Mock agent service
    agentService.getAgentInstance.mockImplementation((agentId) => {
      return mockAgent;
    });
  });
  
  test('createTask should return a new task with correct structure', async () => {
    const query = 'Test query';
    const context = { testKey: 'testValue' };
    
    const task = await orchestrationService.createTask(query, context);
    
    expect(task).toHaveProperty('id');
    expect(task).toHaveProperty('query', query);
    expect(task).toHaveProperty('context', context);
    expect(task).toHaveProperty('status', 'pending');
    expect(task).toHaveProperty('createdAt');
    expect(task).toHaveProperty('updatedAt');
  });
  
  test('getTaskStatus should return the status of a task', async () => {
    // Create a task first
    const task = await orchestrationService.createTask('Test query');
    
    // Get the status
    const status = await orchestrationService.getTaskStatus(task.id);
    
    expect(status).toHaveProperty('id', task.id);
    expect(status).toHaveProperty('status');
    expect(status).toHaveProperty('progress');
    expect(status).toHaveProperty('steps');
  });
  
  test('getTaskResult should return null for non-completed tasks', async () => {
    // Create a task
    const task = await orchestrationService.createTask('Test query');
    
    // Get the result
    const result = await orchestrationService.getTaskResult(task.id);
    
    // Task is not completed yet, so result should be null
    expect(result).toBeNull();
  });
});
