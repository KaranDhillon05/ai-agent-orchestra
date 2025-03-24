// API Service
const api = {
  // Base URL for API requests
  baseUrl: '/api',

  // Helper method for making API requests
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Get all agents
  async getAgents() {
    return this.request('/agents');
  },

  // Get agent details by ID
  async getAgentById(agentId) {
    return this.request(`/agents/${agentId}`);
  },

  // Get all tasks
  async getTasks() {
    return this.request('/tasks');
  },

  // Get task status by ID
  async getTaskById(taskId) {
    return this.request(`/tasks/${taskId}`);
  },

  // Get task result by ID
  async getTaskResult(taskId) {
    return this.request(`/tasks/${taskId}/result`);
  },

  // Create a new task
  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Get system health status
  async getHealthStatus() {
    return this.request('/health');
  },
};

// DOM Elements
const elements = {
  // Navigation
  navLinks: document.querySelectorAll('nav a'),
  
  // Pages
  pages: document.querySelectorAll('.page'),
  dashboardPage: document.getElementById('dashboard'),
  agentsPage: document.getElementById('agents'),
  tasksPage: document.getElementById('tasks'),
  createTaskPage: document.getElementById('create-task'),
  taskDetailPage: document.getElementById('task-detail'),
  
  // Dashboard elements
  agentCount: document.getElementById('agent-count'),
  taskCount: document.getElementById('task-count'),
  recentTasksList: document.getElementById('recent-tasks-list'),
  createTaskBtn: document.getElementById('create-task-btn'),
  viewAgentsBtn: document.getElementById('view-agents-btn'),
  viewTasksBtn: document.getElementById('view-tasks-btn'),
  
  // Agents elements
  agentsList: document.getElementById('agents-list'),
  agentModal: document.getElementById('agent-modal'),
  agentDetailContent: document.getElementById('agent-detail-content'),
  closeAgentModal: document.querySelector('.modal .close'),
  
  // Tasks elements
  tasksList: document.getElementById('tasks-list'),
  createTaskBtn2: document.getElementById('create-task-btn-2'),
  taskFilters: document.querySelectorAll('.filter'),
  
  // Create task elements
  taskForm: document.getElementById('task-form'),
  queryInput: document.getElementById('query'),
  contextInput: document.getElementById('context'),
  priorityInput: document.getElementById('priority'),
  submitTaskBtn: document.getElementById('submit-task-btn'),
  cancelTaskBtn: document.getElementById('cancel-task-btn'),
  
  // Task detail elements
  taskDetailContent: document.getElementById('task-detail-content'),
};

// App State
const state = {
  currentPage: 'dashboard',
  agents: [],
  tasks: [],
  currentTaskId: null,
  taskFilter: 'all',
};

// Navigation
function navigateTo(page) {
  // Hide all pages
  elements.pages.forEach(pageEl => {
    pageEl.classList.remove('active');
  });
  
  // Show the selected page
  const pageEl = document.getElementById(page);
  if (pageEl) {
    pageEl.classList.add('active');
    state.currentPage = page;
    
    // Update navigation
    elements.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-page') === page) {
        link.classList.add('active');
      }
    });
    
    // Load page-specific data
    if (page === 'dashboard') {
      loadDashboard();
    } else if (page === 'agents') {
      loadAgents();
    } else if (page === 'tasks') {
      loadTasks();
    } else if (page === 'task-detail' && state.currentTaskId) {
      loadTaskDetail(state.currentTaskId);
    }
  }
}

// Dashboard
async function loadDashboard() {
  try {
    // Load agents count
    const agentsData = await api.getAgents();
    state.agents = agentsData.agents || [];
    elements.agentCount.textContent = state.agents.length;
    
    // Load tasks count and recent tasks
    const tasksData = await api.getTasks();
    state.tasks = tasksData.tasks || [];
    elements.taskCount.textContent = state.tasks.length;
    
    // Display recent tasks
    const recentTasks = state.tasks.slice(0, 3);
    if (recentTasks.length > 0) {
      elements.recentTasksList.innerHTML = recentTasks.map(task => createTaskItemHTML(task)).join('');
    } else {
      elements.recentTasksList.innerHTML = '<div class="card">No tasks found. Create your first task to get started.</div>';
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError('Failed to load dashboard data. Please try again later.');
  }
}

// Agents
async function loadAgents() {
  try {
    // Load agents if not already loaded
    if (state.agents.length === 0) {
      const agentsData = await api.getAgents();
      state.agents = agentsData.agents || [];
    }
    
    // Display agents
    if (state.agents.length > 0) {
      elements.agentsList.innerHTML = state.agents.map(agent => createAgentCardHTML(agent)).join('');
      
      // Add click event listeners to agent cards
      document.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('click', () => {
          const agentId = card.getAttribute('data-agent-id');
          showAgentDetails(agentId);
        });
      });
    } else {
      elements.agentsList.innerHTML = '<div class="card">No agents found.</div>';
    }
  } catch (error) {
    console.error('Error loading agents:', error);
    showError('Failed to load agents. Please try again later.');
  }
}

// Show agent details in modal
async function showAgentDetails(agentId) {
  try {
    elements.agentDetailContent.innerHTML = '<div class="loading">Loading agent details...</div>';
    elements.agentModal.style.display = 'block';
    
    const agent = await api.getAgentById(agentId);
    
    elements.agentDetailContent.innerHTML = `
      <h2>${agent.name}</h2>
      <p class="agent-description">${agent.description}</p>
      
      <div class="agent-detail-info">
        <div class="detail-item">
          <h3>ID</h3>
          <p>${agent.id}</p>
        </div>
        <div class="detail-item">
          <h3>Status</h3>
          <p>${agent.status}</p>
        </div>
        <div class="detail-item">
          <h3>Model</h3>
          <p>${agent.model || 'N/A'}</p>
        </div>
      </div>
      
      ${agent.capabilities && agent.capabilities.length > 0 ? `
        <div class="agent-capabilities">
          <h3>Capabilities</h3>
          <div class="capability-tags">
            ${agent.capabilities.map(capability => `
              <span class="capability-tag">${capability}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${agent.taskHistory && agent.taskHistory.length > 0 ? `
        <div class="agent-task-history">
          <h3>Recent Tasks</h3>
          <ul class="task-history-list">
            ${agent.taskHistory.map(task => `
              <li class="task-history-item">
                <div class="task-history-content">${task.query || task.result}</div>
                <div class="task-history-date">${formatDate(task.timestamp)}</div>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    `;
  } catch (error) {
    console.error('Error loading agent details:', error);
    elements.agentDetailContent.innerHTML = '<div class="error">Failed to load agent details. Please try again later.</div>';
  }
}

// Tasks
async function loadTasks() {
  try {
    // Load tasks if not already loaded
    const tasksData = await api.getTasks();
    state.tasks = tasksData.tasks || [];
    
    // Apply filter
    const filteredTasks = state.taskFilter === 'all' 
      ? state.tasks 
      : state.tasks.filter(task => task.status === state.taskFilter);
    
    // Display tasks
    if (filteredTasks.length > 0) {
      elements.tasksList.innerHTML = filteredTasks.map(task => createTaskItemHTML(task)).join('');
      
      // Add click event listeners to task items
      document.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', () => {
          const taskId = item.getAttribute('data-task-id');
          state.currentTaskId = taskId;
          navigateTo('task-detail');
        });
      });
    } else {
      elements.tasksList.innerHTML = `
        <div class="card">
          <p>No ${state.taskFilter !== 'all' ? state.taskFilter : ''} tasks found.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
    showError('Failed to load tasks. Please try again later.');
  }
}

// Task Detail
async function loadTaskDetail(taskId) {
  try {
    elements.taskDetailContent.innerHTML = '<div class="loading">Loading task details...</div>';
    
    // Get task status
    const task = await api.getTaskById(taskId);
    
    // Get task result if completed
    let taskResult = null;
    if (task.status === 'completed') {
      try {
        taskResult = await api.getTaskResult(taskId);
      } catch (error) {
        console.error('Error loading task result:', error);
      }
    }
    
    // Display task details
    elements.taskDetailContent.innerHTML = `
      <div class="task-detail-header">
        <h2 class="task-detail-title">Task Details</h2>
        <span class="task-status ${task.status}">${task.status}</span>
      </div>
      
      <div class="task-detail-query card">
        <h3>Query</h3>
        <p>${task.query}</p>
      </div>
      
      <div class="task-detail-info card">
        <h3>Task Information</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <h4>ID</h4>
            <p>${task.id}</p>
          </div>
          <div class="detail-item">
            <h4>Created At</h4>
            <p>${formatDate(task.createdAt)}</p>
          </div>
          <div class="detail-item">
            <h4>Updated At</h4>
            <p>${formatDate(task.updatedAt)}</p>
          </div>
          <div class="detail-item">
            <h4>Status</h4>
            <p>${task.status}</p>
          </div>
        </div>
        
        ${task.progress !== undefined ? `
          <div class="task-progress">
            <h4>Progress</h4>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${task.progress}%"></div>
            </div>
            <div class="progress-text">${task.progress}%</div>
          </div>
        ` : ''}
      </div>
      
      ${task.steps && task.steps.length > 0 ? `
        <div class="task-detail-section">
          <h3>Steps</h3>
          <div class="task-steps-timeline">
            ${task.steps.map(step => `
              <div class="timeline-item">
                <div class="timeline-marker ${step.status}"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <div class="timeline-title">${step.description}</div>
                    <div class="timeline-agent">${step.agentId}</div>
                  </div>
                  <div class="timeline-status">${step.status}</div>
                  ${step.result && step.status === 'completed' ? `
                    <div class="timeline-result">
                      ${step.result.content ? step.result.content.substring(0, 200) + (step.result.content.length > 200 ? '...' : '') : JSON.stringify(step.result)}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${taskResult ? `
        <div class="task-detail-section">
          <h3>Result</h3>
          <div class="card">
            <div class="task-result-content">
              ${taskResult.result.content}
            </div>
            
            ${taskResult.result.recommendations && taskResult.result.recommendations.length > 0 ? `
              <div class="task-recommendations">
                <h4>Recommendations</h4>
                <ul>
                  ${taskResult.result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            <div class="task-result-metadata">
              <div class="metadata-item">
                <h4>Completed At</h4>
                <p>${formatDate(taskResult.completedAt)}</p>
              </div>
              <div class="metadata-item">
                <h4>Confidence</h4>
                <p>${taskResult.result.confidence !== undefined ? Math.round(taskResult.result.confidence * 100) + '%' : 'N/A'}</p>
              </div>
              <div class="metadata-item">
                <h4>Final Agent</h4>
                <p>${taskResult.result.metadata?.agent || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      ` : ''}
    `;
    
    // Poll for updates if task is in progress
    if (task.status === 'in_progress') {
      setTimeout(() => {
        if (state.currentPage === 'task-detail' && state.currentTaskId === taskId) {
          loadTaskDetail(taskId);
        }
      }, 5000); // Poll every 5 seconds
    }
  } catch (error) {
    console.error('Error loading task details:', error);
    elements.taskDetailContent.innerHTML = '<div class="error">Failed to load task details. Please try again later.</div>';
  }
}

// Create Task
async function createTask(event) {
  event.preventDefault();
  
  const query = elements.queryInput.value.trim();
  if (!query) {
    showError('Query is required');
    return;
  }
  
  // Parse context as JSON if provided
  let contextObj = {};
  const contextValue = elements.contextInput.value.trim();
  if (contextValue) {
    try {
      contextObj = JSON.parse(contextValue);
    } catch (error) {
      showError('Context must be valid JSON');
      return;
    }
  }
  
  const priority = elements.priorityInput.value;
  
  try {
    elements.submitTaskBtn.disabled = true;
    elements.submitTaskBtn.textContent = 'Creating...';
    
    const response = await api.createTask({
      query,
      context: contextObj,
      priority,
    });
    
    // Reset form
    elements.taskForm.reset();
    
    // Navigate to task detail
    state.currentTaskId = response.taskId;
    navigateTo('task-detail');
  } catch (error) {
    console.error('Error creating task:', error);
    showError('Failed to create task. Please try again.');
  } finally {
    elements.submitTaskBtn.disabled = false;
    elements.submitTaskBtn.textContent = 'Create Task';
  }
}

// Helper Functions
function createTaskItemHTML(task) {
  return `
    <div class="task-item" data-task-id="${task.id}">
      <div class="task-header">
        <h3 class="task-title">${task.query}</h3>
        <span class="task-status ${task.status}">${task.status}</span>
      </div>
      <div class="task-date">Created: ${formatDate(task.createdAt)}</div>
      
      ${task.progress !== undefined ? `
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${task.progress}%"></div>
        </div>
      ` : ''}
      
      ${task.steps && task.steps.length > 0 ? `
        <div class="task-steps">
          ${task.steps.slice(0, 3).map(step => `
            <div class="step-item">
              <span class="step-indicator ${step.status}"></span>
              <span class="step-description">${step.description}</span>
            </div>
          `).join('')}
          ${task.steps.length > 3 ? `<div class="more-steps">+${task.steps.length - 3} more steps</div>` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

function createAgentCardHTML(agent) {
  return `
    <div class="agent-card" data-agent-id="${agent.id}">
      <div class="agent-header">
        <h3 class="agent-name">${agent.name}</h3>
        <span class="agent-status">${agent.status}</span>
      </div>
      <p class="agent-description">${agent.description}</p>
      
      ${agent.capabilities && agent.capabilities.length > 0 ? `
        <div class="agent-capabilities">
          ${agent.capabilities.slice(0, 3).map(capability => `
            <span class="capability-tag">${capability}</span>
          `).join('')}
          ${agent.capabilities.length > 3 ? `<span class="capability-tag">+${agent.capabilities.length - 3} more</span>` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function showError(message) {
  // Simple error display - in a real app, you'd use a toast or notification system
  alert(message);
}

// Event Listeners
function setupEventListeners() {
  // Navigation
  elements.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigateTo(page);
    });
  });
  
  // Dashboard buttons
  elements.createTaskBtn.addEventListener('click', () => navigateTo('create-task'));
  elements.viewAgentsBtn.addEventListener('click', () => navigateTo('agents'));
  elements.viewTasksBtn.addEventListener('click', () => navigateTo('tasks'));
  
  // Tasks page
  elements.createTaskBtn2.addEventListener('click', () => navigateTo('create-task'));
  elements.taskFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      elements.taskFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      state.taskFilter = filter.getAttribute('data-filter');
      loadTasks();
    });
  });
  
  // Create task form
  elements.taskForm.addEventListener('submit', createTask);
  elements.cancelTaskBtn.addEventListener('click', () => navigateTo('tasks'));
  
  // Agent modal
  elements.closeAgentModal.addEventListener('click', () => {
    elements.agentModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === elements.agentModal) {
      elements.agentModal.style.display = 'none';
    }
  });
  
  // Task detail back link
  document.querySelectorAll('.back-link a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigateTo(page);
    });
  });
}

// Initialize App
function initApp() {
  setupEventListeners();
  navigateTo('dashboard');
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
