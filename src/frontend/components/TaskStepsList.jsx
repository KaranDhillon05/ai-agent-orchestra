import React from 'react';

function TaskStepsList({ steps }) {
  // Define colors for different agent types
  const agentColors = {
    researcher: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    planner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    critic: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    creative: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    executor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  // Define colors for different step statuses
  const statusColors = {
    pending: 'border-gray-300 dark:border-gray-600',
    in_progress: 'border-blue-500 dark:border-blue-400',
    completed: 'border-green-500 dark:border-green-400',
    failed: 'border-red-500 dark:border-red-400',
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => {
          // Get color based on agent ID, or use a default
          const agentColorClass = agentColors[step.agentId] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
          
          // Get color based on step status, or use a default
          const statusColorClass = statusColors[step.status] || 'border-gray-300 dark:border-gray-600';
          
          return (
            <li key={step.id}>
              <div className="relative pb-8">
                {stepIdx !== steps.length - 1 ? (
                  <span
                    className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                      step.status === 'completed' ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900 ${statusColorClass} bg-white dark:bg-gray-800 border-2`}
                    >
                      {step.status === 'completed' ? (
                        <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : step.status === 'in_progress' ? (
                        <svg className="h-5 w-5 text-blue-500 dark:text-blue-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : step.status === 'failed' ? (
                        <svg className="h-5 w-5 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{step.id}</span>
                      )}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{step.description}</p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agentColorClass}`}>
                        {step.agentId}
                      </span>
                    </div>
                  </div>
                </div>
                
                {step.result && step.status === 'completed' && (
                  <div className="ml-11 mt-2">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      {step.result.content ? (
                        <div className="whitespace-pre-wrap">{step.result.content.substring(0, 200)}
                          {step.result.content.length > 200 && '...'}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{JSON.stringify(step.result, null, 2)}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TaskStepsList;
