import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTaskById, getTaskResult } from '../services/api';
import TaskStepsList from '../components/TaskStepsList';

function TaskDetail() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [taskResult, setTaskResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setLoading(true);
        
        // Fetch task status
        const taskData = await getTaskById(taskId);
        setTask(taskData);
        
        // If task is completed, fetch the result
        if (taskData.status === 'completed') {
          try {
            const resultData = await getTaskResult(taskId);
            setTaskResult(resultData);
          } catch (resultErr) {
            console.error('Error fetching task result:', resultErr);
            // Don't set an error here, as we still have the task status
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError('Failed to load task details. Please try again later.');
        setLoading(false);
      }
    };

    fetchTaskData();
    
    // Poll for updates if task is in progress
    let intervalId;
    if (task && task.status === 'in_progress') {
      intervalId = setInterval(fetchTaskData, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId, task?.status]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4">
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

  if (!task) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Task not found.</p>
        <Link to="/tasks" className="btn btn-primary mt-4">
          Back to Tasks
        </Link>
      </div>
    );
  }

  // Define colors for different task statuses
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  // Get color based on task status, or use a default
  const statusColorClass = statusColors[task.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center">
          <Link to="/tasks" className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
            Task Details
          </h1>
          <span className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorClass}`}>
            {task.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Created: {formatDate(task.createdAt)}
        </p>
      </div>

      {/* Task Query */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Query</h2>
        <p className="text-gray-700 dark:text-gray-300">{task.query}</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('steps')}
              className={`${
                activeTab === 'steps'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Steps
            </button>
            {task.status === 'completed' && (
              <button
                onClick={() => setActiveTab('result')}
                className={`${
                  activeTab === 'result'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Result
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {activeTab === 'overview' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{task.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{task.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(task.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(task.updatedAt)}</p>
                </div>
              </div>
            </div>

            {task.progress !== undefined && (
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Progress</h2>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">Completion</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Steps Summary</h2>
              {task.steps && task.steps.length > 0 ? (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Step</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Agent</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      {task.steps.map((step) => (
                        <tr key={step.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{step.id}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{step.description}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{step.agentId}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              step.status === 'completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : step.status === 'in_progress' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                  : step.status === 'failed'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {step.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No steps available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'steps' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Steps</h2>
            {task.steps && task.steps.length > 0 ? (
              <TaskStepsList steps={task.steps} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No steps available.</p>
            )}
          </div>
        )}

        {activeTab === 'result' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Result</h2>
            {taskResult ? (
              <div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Final Response</h3>
                  <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-600 whitespace-pre-wrap">
                    {taskResult.result.content}
                  </div>
                </div>
                
                {taskResult.result.recommendations && taskResult.result.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                      {taskResult.result.recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metadata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Completed At</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(taskResult.completedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Confidence</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {taskResult.result.confidence !== undefined 
                          ? `${Math.round(taskResult.result.confidence * 100)}%` 
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Final Agent</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {taskResult.result.metadata?.agent || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                {task.status === 'completed' 
                  ? 'Result data not available.' 
                  : 'Task has not been completed yet.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDetail;
