import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAgents, getTasks, getHealthStatus } from '../services/api';
import TaskCard from '../components/TaskCard';
import AgentCard from '../components/AgentCard';

function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [systemStatus, setSystemStatus] = useState({ status: 'loading' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch agents
        const agentsData = await getAgents();
        setAgents(agentsData.agents || []);
        
        // Fetch recent tasks
        const tasksData = await getTasks();
        setRecentTasks(tasksData.tasks || []);
        
        // Fetch system status
        const statusData = await getHealthStatus();
        setSystemStatus(statusData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your AI Agent Orchestra system
        </p>
      </div>

      {/* System Status */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
              <div className="mt-2 flex items-center">
                <span className={`inline-block h-3 w-3 rounded-full mr-2 ${
                  systemStatus.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {systemStatus.status === 'ok' ? 'Operational' : 'Issue Detected'}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Agents</h3>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{agents.length}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Tasks</h3>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{recentTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/tasks/create" className="btn btn-primary">
              Create New Task
            </Link>
            <Link to="/agents" className="btn btn-secondary">
              View All Agents
            </Link>
            <Link to="/tasks" className="btn btn-secondary">
              View All Tasks
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Tasks</h2>
          <Link to="/tasks" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            View all
          </Link>
        </div>
        {recentTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {recentTasks.slice(0, 3).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No tasks found. Create your first task to get started.</p>
            <Link to="/tasks/create" className="btn btn-primary mt-4">
              Create New Task
            </Link>
          </div>
        )}
      </div>

      {/* Agents Overview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Agents</h2>
          <Link to="/agents" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
