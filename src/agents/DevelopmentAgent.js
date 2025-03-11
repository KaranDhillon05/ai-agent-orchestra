const BaseAgent = require('./BaseAgent');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const config = require('../config');

class DevelopmentAgent extends BaseAgent {
  constructor(agentConfig = {}) {
    super({
      ...agentConfig,
      name: agentConfig.name || 'Development Agent',
      description: agentConfig.description || 'Specialized in software development tasks',
      capabilities: [
        'code generation',
        'code review',
        'architecture design',
        'dependency management',
        'testing implementation',
        'documentation',
        'debugging',
        'refactoring',
        'full-stack development',
        'API design',
        'database design',
        'deployment configuration'
      ]
    });

    this.technicalStack = agentConfig.technicalStack || [];
    this.frameworkKnowledge = agentConfig.frameworkKnowledge || [];
    this.deploymentExperience = agentConfig.deploymentExperience || [];
  }

  async createProjectStructure(requirements) {
    const prompt = PromptTemplate.fromTemplate(`
      As a development expert, create a project structure for the following requirements:
      {requirements}
      
      Consider:
      - Best practices for the specified tech stack
      - Scalability and maintainability
      - Security considerations
      - Testing strategy
      - Documentation needs
      
      Provide a detailed directory structure and explain the purpose of each component.
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ requirements });
  }

  async generateCode(component, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Generate code for the following component:
      Component: {component}
      Context: {context}
      
      Requirements:
      - Follow best practices
      - Include proper error handling
      - Add necessary comments
      - Consider security
      - Make it maintainable
      
      Provide complete, production-ready code.
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ component, context });
  }

  async reviewCode(code, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Review the following code:
      {code}
      
      Context: {context}
      
      Provide a detailed code review covering:
      - Code quality
      - Potential bugs
      - Security vulnerabilities
      - Performance considerations
      - Best practices
      - Suggested improvements
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ code, context });
  }

  async designArchitecture(requirements) {
    const prompt = PromptTemplate.fromTemplate(`
      Design a system architecture for the following requirements:
      {requirements}
      
      Consider:
      - Scalability
      - Security
      - Performance
      - Maintainability
      - Cost efficiency
      - Technology choices
      
      Provide:
      - System diagram
      - Component descriptions
      - Data flow
      - API specifications
      - Database schema
      - Deployment strategy
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ requirements });
  }

  async implementTests(code, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Create comprehensive tests for the following code:
      {code}
      
      Context: {context}
      
      Include:
      - Unit tests
      - Integration tests
      - Edge cases
      - Error scenarios
      - Performance tests if applicable
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ code, context });
  }

  async debugIssue(error, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Debug the following issue:
      Error: {error}
      
      Context: {context}
      
      Provide:
      - Root cause analysis
      - Solution approach
      - Code fixes
      - Prevention strategies
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ error, context });
  }

  async refactorCode(code, context) {
    const prompt = PromptTemplate.fromTemplate(`
      Refactor the following code:
      {code}
      
      Context: {context}
      
      Goals:
      - Improve code quality
      - Enhance performance
      - Increase maintainability
      - Follow best practices
      
      Provide the refactored code with explanations of changes.
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ code, context });
  }

  async setupDeployment(config) {
    const prompt = PromptTemplate.fromTemplate(`
      Create deployment configuration for:
      {config}
      
      Include:
      - Environment setup
      - CI/CD pipeline
      - Monitoring
      - Scaling configuration
      - Security measures
      - Backup strategy
    `);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser()
    ]);

    return await chain.invoke({ config });
  }
}

module.exports = DevelopmentAgent; 