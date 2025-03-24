require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API keys
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  
  // Vector database configuration
  vectorDb: {
    provider: 'pinecone', // or 'chroma'
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
      indexName: 'agent-orchestra',
    },
    chroma: {
      path: './chroma-db',
    },
  },
  
  // Agent configuration
  agents: {
    maxAgents: parseInt(process.env.MAX_AGENTS || '5', 10),
    types: [
      {
        id: 'researcher',
        name: 'Research Agent',
        description: 'Specializes in gathering and analyzing information from various sources',
        model: 'gpt-4',
      },
      {
        id: 'planner',
        name: 'Planning Agent',
        description: 'Specializes in breaking down complex tasks into manageable steps',
        model: 'gpt-4',
      },
      {
        id: 'critic',
        name: 'Critic Agent',
        description: 'Specializes in evaluating solutions and identifying potential issues',
        model: 'gpt-4',
      },
      {
        id: 'creative',
        name: 'Creative Agent',
        description: 'Specializes in generating innovative ideas and solutions',
        model: 'gpt-4',
      },
      {
        id: 'executor',
        name: 'Execution Agent',
        description: 'Specializes in implementing solutions and executing tasks',
        model: 'gpt-4',
      },
    ],
  },
  
  // Memory configuration
  memory: {
    retentionLimit: parseInt(process.env.MEMORY_RETENTION_LIMIT || '100', 10),
  },
};
