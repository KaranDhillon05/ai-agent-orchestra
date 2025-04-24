import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agent API
export const getAgents = async () => {
  const response = await api.get('/agents');
  return response.data;
};

export const getAgentById = async (agentId) => {
  const response = await api.get(`/agents/${agentId}`);
  return response.data;
};

// Task API
export const getTasks = async () => {
  // This endpoint doesn't exist in our backend yet, but we'll implement it
  // For now, we'll use the task results we have
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { tasks: [] };
  }
};

export const getTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

export const getTaskResult = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/result`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

// Health check
export const getHealthStatus = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default {
  getAgents,
  getAgentById,
  getTasks,
  getTaskById,
  getTaskResult,
  createTask,
  getHealthStatus,
};
