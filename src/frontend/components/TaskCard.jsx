import React from 'react';
import { Link } from 'react-router-dom';

function TaskCard({ task }) {
  // Define colors for different task statuses
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  // Get color based on task status, or use a default
  const colorClass = statusColors[task.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Link to={`/tasks/${task.id}`} className="block">
      <div className="card hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{task.query}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Created: {formatDate(task.createdAt)}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {task.status}
          </span>
        </div>
        
        {task.progress !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {task.steps && task.steps.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Steps</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {task.steps.slice(0, 3).map((step) => (
                <li key={step.id} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    step.status === 'completed' 
                      ? 'bg-green-500' 
                      : step.status === 'in_progress' 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}></span>
                  <span className="truncate">{step.description}</span>
                </li>
              ))}
              {task.steps.length > 3 && (
                <li className="text-primary-600 dark:text-primary-400">
                  +{task.steps.length - 3} more steps
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </Link>
  );
}

export default TaskCard;
