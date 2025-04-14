import React from 'react';

function AgentCard({ agent }) {
  // Define colors for different agent types
  const agentColors = {
    researcher: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    planner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    critic: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    creative: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    executor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  // Get color based on agent ID, or use a default
  const colorClass = agentColors[agent.id] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{agent.description}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {agent.status}
        </span>
      </div>
      
      {agent.capabilities && agent.capabilities.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capabilities</h4>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((capability, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {agent.taskHistory && agent.taskHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Tasks</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {agent.taskHistory.slice(0, 3).map((task, index) => (
              <li key={index} className="truncate">
                {task.query || task.result}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AgentCard;
