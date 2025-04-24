import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTask } from '../services/api';

function CreateTask() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Query is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Parse context as JSON if provided
      let contextObj = {};
      if (context.trim()) {
        try {
          contextObj = JSON.parse(context);
        } catch (err) {
          setError('Context must be valid JSON');
          setLoading(false);
          return;
        }
      }
      
      const response = await createTask({
        query,
        context: contextObj,
        priority,
      });
      
      setLoading(false);
      
      // Navigate to the task detail page
      navigate(`/tasks/${response.taskId}`);
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.error || 'Failed to create task. Please try again.');
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Task</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Submit a new task to be processed by the AI Agent Orchestra
        </p>
      </div>

      {error && (
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
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="query" className="label">
              Query <span className="text-red-500">*</span>
            </label>
            <textarea
              id="query"
              name="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your task or question here..."
              className="textarea"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Describe the task you want the AI Agent Orchestra to process.
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="context" className="label">
              Context (Optional)
            </label>
            <textarea
              id="context"
              name="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder='{"key": "value"}'
              className="textarea"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Additional context in JSON format to help the agents understand the task better.
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="priority" className="label">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex justify-end">
            <Link to="/tasks" className="btn btn-secondary mr-4">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTask;
