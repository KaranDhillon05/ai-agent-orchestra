const BaseAgent = require('./BaseAgent');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const config = require('../config');

class BackendEngineerAgent extends BaseAgent {
  constructor(agentConfig = {}) {
    super({
      ...agentConfig,
      name: agentConfig.name || 'Backend Engineer Agent',
      description: agentConfig.description || 'Specialized in backend development and API implementation',
      capabilities: [
        'API development',
        'database integration',
        'authentication implementation',
        'business logic implementation',
        'caching implementation',
        'queue management',
        'background jobs',
        'file handling',
        'security implementation',
        'testing implementation'
      ]
    });

    this.frameworks = agentConfig.frameworks || [
      'Node.js',
      'Express',
      'NestJS',
      'Fastify',
      'Python',
      'Django',
      'Flask',
      'Java',
      'Spring Boot'
    ];
  }

  async implementAPI(apiSpec, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Implement an API endpoint based on the following specification:
      API: {apiSpec}
      
      Context: {context}
      
      Requirements:
      - Follow best practices
      - Implement proper error handling
      - Add input validation
      - Consider security
      - Handle edge cases
      
      Provide:
      1. API Implementation
         - Route definition
         - Request handling
         - Response formatting
         - Error handling
      
      2. Input Validation
         - Validation rules
         - Error messages
         - Sanitization
      
      3. Documentation
         - API documentation
         - Example requests
         - Example responses
         - Error codes
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ apiSpec, context });
  }

  async implementDatabaseIntegration(dbSpec, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Implement database integration for the following specification:
      Database: {dbSpec}
      
      Context: {context}
      
      Requirements:
      - Follow best practices
      - Implement proper error handling
      - Handle transactions
      - Consider performance
      - Handle migrations
      
      Provide:
      1. Database Connection
         - Connection setup
         - Connection pooling
         - Error handling
      
      2. Data Access Layer
         - Models/Entities
         - Repositories
         - Queries
         - Transactions
      
      3. Implementation
         - CRUD operations
         - Complex queries
         - Data validation
         - Error handling
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ dbSpec, context });
  }

  async implementAuthentication(authSpec, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Implement authentication for the following specification:
      Authentication: {authSpec}
      
      Context: {context}
      
      Requirements:
      - Follow best practices
      - Implement proper security
      - Handle tokens
      - Consider OAuth
      - Handle sessions
      
      Provide:
      1. Authentication Flow
         - Registration
         - Login
         - Password reset
         - Email verification
      
      2. Security Implementation
         - Password hashing
         - Token management
         - Session handling
         - CSRF protection
      
      3. Integration
         - Middleware
         - Protected routes
         - User context
         - Error handling
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ authSpec, context });
  }

  async implementBusinessLogic(logicSpec, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Implement business logic for the following specification:
      Logic: {logicSpec}
      
      Context: {context}
      
      Requirements:
      - Follow best practices
      - Implement proper error handling
      - Handle edge cases
      - Consider performance
      - Make it maintainable
      
      Provide:
      1. Business Logic
         - Core logic
         - Validation rules
         - Error handling
         - Edge cases
      
      2. Implementation
         - Service layer
         - Data transformation
         - Business rules
         - Error handling
      
      3. Integration
         - API integration
         - Database integration
         - Error handling
         - Logging
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ logicSpec, context });
  }

  async implementCaching(cacheSpec, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Implement caching for the following specification:
      Caching: {cacheSpec}
      
      Context: {context}
      
      Requirements:
      - Follow best practices
      - Implement proper invalidation
      - Handle cache misses
      - Consider performance
      - Handle distributed caching
      
      Provide:
      1. Cache Strategy
         - Cache keys
         - Cache duration
         - Invalidation rules
         - Cache levels
      
      2. Implementation
         - Cache setup
         - Cache operations
         - Cache invalidation
         - Error handling
      
      3. Integration
         - API integration
         - Database integration
         - Performance monitoring
         - Error handling
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ cacheSpec, context });
  }

  async implementQueue(queueSpec, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Implement a message queue for the following specification:
      Queue: {queueSpec}
      
      Context: {context}
      
      Requirements:
      - Follow best practices
      - Implement proper error handling
      - Handle retries
      - Consider performance
      - Handle dead letters
      
      Provide:
      1. Queue Setup
         - Queue configuration
         - Message format
         - Error handling
         - Retry strategy
      
      2. Implementation
         - Producer
         - Consumer
         - Message handling
         - Error handling
      
      3. Integration
         - API integration
         - Database integration
         - Monitoring
         - Error handling
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ queueSpec, context });
  }

  async implementBackgroundJobs(jobSpec, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Implement background jobs for the following specification:
      Jobs: {jobSpec}
      
      Context: {context}
      
      Requirements:
      - Follow best practices
      - Implement proper error handling
      - Handle retries
      - Consider performance
      - Handle job scheduling
      
      Provide:
      1. Job Setup
         - Job configuration
         - Scheduling rules
         - Error handling
         - Retry strategy
      
      2. Implementation
         - Job definition
         - Job execution
         - Error handling
         - Logging
      
      3. Integration
         - API integration
         - Database integration
         - Monitoring
         - Error handling
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ jobSpec, context });
  }

  async implementFileHandling(fileSpec, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Implement file handling for the following specification:
      File: {fileSpec}
      
      Context: {context}
      
      Requirements:
      - Follow best practices
      - Implement proper error handling
      - Handle large files
      - Consider security
      - Handle different file types
      
      Provide:
      1. File Handling
         - Upload handling
         - Download handling
         - File validation
         - Error handling
      
      2. Implementation
         - File operations
         - Storage integration
         - Security measures
         - Error handling
      
      3. Integration
         - API integration
         - Storage integration
         - Security integration
         - Error handling
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ fileSpec, context });
  }

  async implementTesting(testSpec, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Implement testing for the following specification:
      Testing: {testSpec}
      
      Context: {context}
      
      Requirements:
      - Follow best practices
      - Implement unit tests
      - Implement integration tests
      - Implement API tests
      - Consider edge cases
      
      Provide:
      1. Test Setup
         - Test configuration
         - Test utilities
         - Mock setup
      
      2. Test Implementation
         - Unit tests
         - Integration tests
         - API tests
         - Database tests
      
      3. Test Examples
         - Test cases
         - Edge cases
         - Error cases
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ testSpec, context });
  }
}

module.exports = BackendEngineerAgent; 