const { v4: uuidv4 } = require('uuid');
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const config = require('../config');
const memoryService = require('../memory/memoryService');

/**
 * Base Agent class that all specialized agents will extend
 */
class BaseAgent {
  constructor(agentConfig) {
    this.id = agentConfig.id;
    this.name = agentConfig.name;
    this.description = agentConfig.description;
    this.model = agentConfig.model || 'gpt-4';
    this.status = 'idle';
    this.capabilities = [];
    this.taskHistory = [];

    // Initialize the LLM (or use a mock if API key is not available)
    try {
      if (!config.openai.apiKey || config.openai.apiKey === 'your_openai_api_key_here') {
        console.warn(`OpenAI API key not configured for ${this.name}, using mock LLM`);
        this.llm = this.createMockLLM();
      } else {
        this.llm = new ChatOpenAI({
          modelName: this.model,
          temperature: 0.7,
          openAIApiKey: config.openai.apiKey,
        });
      }
    } catch (error) {
      console.warn(`Error initializing LLM for ${this.name}:`, error.message);
      this.llm = this.createMockLLM();
    }
  }

  /**
   * Create a mock LLM for demo purposes when OpenAI API is not available
   * @returns {Object} - A mock LLM object
   */
  createMockLLM() {
    return {
      invoke: async (prompt) => {
        // Generate a response based on the agent type
        let content = `This is a mock response from the ${this.name}.\n\n`;

        // Add some agent-specific content
        if (this.id === 'researcher') {
          content += 'Based on my research, I found the following information:\n\n';
          content += '1. The topic has been studied extensively in recent years.\n';
          content += '2. Several key findings have emerged from the literature.\n';
          content += '3. There are still some gaps in our understanding.\n\n';
          content += 'Sources:\n- Academic Journal (2023)\n- Research Institute Report (2022)';
        } else if (this.id === 'planner') {
          content += 'Here is a step-by-step plan:\n\n';
          content += '1. First, analyze the requirements carefully.\n';
          content += '2. Then, break down the task into smaller components.\n';
          content += '3. Allocate resources appropriately.\n';
          content += '4. Execute each step in sequence.\n';
          content += '5. Review and adjust as needed.\n\n';
          content += 'Estimated timeline: 3-5 days';
        } else if (this.id === 'critic') {
          content += 'After careful analysis, I have the following critique:\n\n';
          content += 'Strengths:\n- The approach is well-structured.\n- The methodology is sound.\n\n';
          content += 'Weaknesses:\n- There are some potential edge cases not addressed.\n- The solution might not scale well.\n\n';
          content += 'Suggestions for improvement:\n- Consider alternative approaches for better scalability.\n- Add more robust error handling.';
        } else if (this.id === 'creative') {
          content += 'Here are some creative ideas:\n\n';
          content += '1. A novel approach combining existing technologies in a new way.\n';
          content += '2. An unconventional solution that challenges traditional thinking.\n';
          content += '3. A hybrid model that leverages the strengths of multiple approaches.\n\n';
          content += 'These ideas could be combined or implemented separately depending on the specific requirements.';
        } else if (this.id === 'executor') {
          content += 'I have executed the task with the following results:\n\n';
          content += 'Implementation details:\n- Used the most efficient algorithm for the task.\n- Optimized for performance and reliability.\n\n';
          content += 'Results:\n- Task completed successfully.\n- All success criteria met.\n\n';
          content += 'Next steps:\n- Monitor performance.\n- Prepare for potential scaling needs.';
        } else {
          content += 'I have processed your request and here is my response:\n\n';
          content += 'The task has been analyzed and completed according to the specified requirements.\n';
          content += 'Please let me know if you need any clarification or have additional questions.';
        }

        return { content };
      }
    };
  }

  /**
   * Process a task with this agent
   * @param {Object} task - The task to process
   * @param {Object} context - Additional context for the task
   * @returns {Promise<Object>} - The result of the task
   */
  async processTask(task, context = {}) {
    try {
      this.status = 'busy';

      // Get relevant memory for this task
      const relevantMemory = await memoryService.getRelevantMemory(task.query);

      // Combine task, context, and memory
      const fullContext = {
        ...context,
        relevantMemory,
        agentRole: this.description,
      };

      // Create a prompt template based on the agent's role
      const promptTemplate = this.createPromptTemplate();

      // Format the prompt with the task and context
      const formattedPrompt = await promptTemplate.format({
        query: task.query,
        context: JSON.stringify(fullContext),
      });

      // Call the LLM
      const response = await this.llm.invoke(formattedPrompt);

      // Process the response
      const result = this.processResponse(response);

      // Store the task in history
      this.taskHistory.unshift({
        id: task.id,
        query: task.query,
        timestamp: new Date().toISOString(),
        result: result.summary || 'Task completed',
      });

      // Limit task history size
      if (this.taskHistory.length > 100) {
        this.taskHistory = this.taskHistory.slice(0, 100);
      }

      this.status = 'idle';
      return result;
    } catch (error) {
      console.error(`Error in ${this.name} processing task:`, error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Create a prompt template for this agent
   * @returns {PromptTemplate} - The prompt template
   */
  createPromptTemplate() {
    // This is a base template that specialized agents will override
    return new PromptTemplate({
      template: `You are a ${this.name}, an AI agent that ${this.description}.

Task: {query}

Context: {context}

Provide a detailed response based on your expertise. Be thorough, accurate, and helpful.`,
      inputVariables: ['query', 'context'],
    });
  }

  /**
   * Process the response from the LLM
   * @param {Object} response - The response from the LLM
   * @returns {Object} - The processed result
   */
  processResponse(response) {
    // Basic processing - specialized agents will override this
    return {
      content: response.content,
      summary: response.content.substring(0, 100) + '...',
      confidence: 0.8,
      metadata: {
        agent: this.id,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

module.exports = BaseAgent;
