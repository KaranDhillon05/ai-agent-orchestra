const BaseAgent = require('./BaseAgent');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const config = require('../config');

class ArchitectAgent extends BaseAgent {
  constructor(agentConfig = {}) {
    super({
      ...agentConfig,
      name: agentConfig.name || 'Architect Agent',
      description: agentConfig.description || 'Specialized in designing full-stack application architectures',
      capabilities: [
        'system architecture design',
        'technology stack selection',
        'database schema design',
        'API design',
        'scalability planning',
        'security architecture',
        'deployment architecture',
        'microservices design',
        'cloud architecture',
        'performance optimization'
      ]
    });

    this.architecturePatterns = agentConfig.architecturePatterns || [
      'monolithic',
      'microservices',
      'serverless',
      'event-driven',
      'layered',
      'hexagonal'
    ];
  }

  async designSystemArchitecture(requirements) {
    const prompt = PromptTemplate.fromTemplate(`
      Design a comprehensive system architecture for the following requirements:
      {requirements}
      
      Consider:
      - Scalability requirements
      - Security needs
      - Performance expectations
      - Cost efficiency
      - Technology stack preferences
      - Team expertise
      - Future growth
      
      Provide:
      1. Architecture Overview
         - Architecture pattern
         - System components
         - Data flow
         - Communication patterns
      
      2. Technology Stack
         - Frontend framework
         - Backend framework
         - Database systems
         - Caching strategy
         - Message queues
         - Search engines
         - Monitoring tools
      
      3. Database Design
         - Database type
         - Schema design
         - Indexing strategy
         - Replication plan
         - Backup strategy
      
      4. API Design
         - API architecture
         - Endpoint structure
         - Authentication/Authorization
         - Rate limiting
         - Versioning strategy
      
      5. Security Architecture
         - Authentication system
         - Authorization model
         - Data encryption
         - Network security
         - Compliance requirements
      
      6. Deployment Architecture
         - Infrastructure requirements
         - CI/CD pipeline
         - Monitoring setup
         - Logging strategy
         - Scaling approach
      
      7. Performance Considerations
         - Caching strategy
         - Load balancing
         - Database optimization
         - API optimization
         - Frontend optimization
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ requirements });
  }

  async selectTechnologyStack(requirements) {
    const prompt = PromptTemplate.fromTemplate(`
      Select the optimal technology stack for the following requirements:
      {requirements}
      
      Consider:
      - Project complexity
      - Team expertise
      - Community support
      - Performance needs
      - Scalability requirements
      - Security needs
      - Cost constraints
      
      Provide recommendations for:
      1. Frontend Stack
         - Framework
         - State management
         - UI libraries
         - Build tools
         - Testing frameworks
      
      2. Backend Stack
         - Framework
         - Language
         - API tools
         - Authentication
         - Testing tools
      
      3. Database Stack
         - Primary database
         - Caching solution
         - Search engine
         - ORM/ODM
      
      4. DevOps Stack
         - CI/CD tools
         - Containerization
         - Monitoring
         - Logging
         - Cloud services
      
      5. Security Stack
         - Authentication
         - Authorization
         - Encryption
         - Security tools
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ requirements });
  }

  async designDatabaseSchema(requirements) {
    const prompt = PromptTemplate.fromTemplate(`
      Design a comprehensive database schema for the following requirements:
      {requirements}
      
      Consider:
      - Data relationships
      - Query patterns
      - Performance needs
      - Scalability requirements
      - Security requirements
      
      Provide:
      1. Entity Relationship Diagram
         - Tables/Collections
         - Relationships
         - Cardinality
         - Attributes
      
      2. Schema Details
         - Table/Collection structures
         - Field types
         - Constraints
         - Indexes
         - Validation rules
      
      3. Data Access Patterns
         - Common queries
         - Optimization strategies
         - Caching approach
      
      4. Migration Strategy
         - Version control
         - Rollback plan
         - Data migration
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ requirements });
  }

  async designAPIs(requirements) {
    const prompt = PromptTemplate.fromTemplate(`
      Design a comprehensive API architecture for the following requirements:
      {requirements}
      
      Consider:
      - API style (REST, GraphQL, gRPC)
      - Authentication needs
      - Rate limiting
      - Versioning
      - Documentation
      
      Provide:
      1. API Overview
         - API style
         - Base URL structure
         - Versioning approach
         - Authentication method
      
      2. Endpoint Design
         - Resource endpoints
         - Request/Response formats
         - Error handling
         - Status codes
      
      3. Authentication/Authorization
         - Authentication flow
         - Token management
         - Role-based access
         - Permission model
      
      4. API Documentation
         - OpenAPI/Swagger spec
         - Example requests
         - Error responses
         - Rate limits
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ requirements });
  }

  async designSecurityArchitecture(requirements) {
    const prompt = PromptTemplate.fromTemplate(`
      Design a comprehensive security architecture for the following requirements:
      {requirements}
      
      Consider:
      - Authentication needs
      - Authorization requirements
      - Data protection
      - Network security
      - Compliance needs
      
      Provide:
      1. Authentication System
         - Authentication flow
         - Token management
         - Session handling
         - Multi-factor auth
      
      2. Authorization Model
         - Role-based access
         - Permission system
         - Resource access control
      
      3. Data Security
         - Encryption strategy
         - Key management
         - Data masking
         - Backup security
      
      4. Network Security
         - Firewall rules
         - Network segmentation
         - SSL/TLS setup
         - DDoS protection
      
      5. Compliance
         - Security standards
         - Audit logging
         - Incident response
         - Security monitoring
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ requirements });
  }

  async designDeploymentArchitecture(requirements) {
    const prompt = PromptTemplate.fromTemplate(`
      Design a comprehensive deployment architecture for the following requirements:
      {requirements}
      
      Consider:
      - Scalability needs
      - High availability
      - Disaster recovery
      - Cost efficiency
      - Monitoring needs
      
      Provide:
      1. Infrastructure Design
         - Cloud provider
         - Server configuration
         - Network setup
         - Load balancing
      
      2. Deployment Strategy
         - CI/CD pipeline
         - Environment setup
         - Deployment process
         - Rollback plan
      
      3. Monitoring Setup
         - Metrics collection
         - Logging strategy
         - Alerting system
         - Performance monitoring
      
      4. Scaling Strategy
         - Auto-scaling rules
         - Load distribution
         - Resource optimization
         - Cost management
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ requirements });
  }
}

module.exports = ArchitectAgent; 