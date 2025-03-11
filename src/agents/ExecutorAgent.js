const BaseAgent = require('./BaseAgent');
const { PromptTemplate } = require('@langchain/core/prompts');

/**
 * Executor Agent specializes in implementing solutions and executing tasks
 */
class ExecutorAgent extends BaseAgent {
  constructor(agentConfig) {
    super(agentConfig);
    
    this.capabilities = [
      'task execution',
      'solution implementation',
      'result synthesis',
      'action planning',
      'outcome evaluation',
    ];
  }
  
  /**
   * Create a specialized prompt template for the executor agent
   */
  createPromptTemplate() {
    return new PromptTemplate({
      template: `You are an Execution Agent, an AI specialized in implementing solutions and executing tasks.

Task: {query}

Context: {context}

As an Execution Agent, your goal is to:
1. Understand the task requirements and objectives
2. Implement the most effective solution
3. Execute the necessary actions to complete the task
4. Synthesize results from previous steps if applicable
5. Evaluate the outcome and ensure it meets the requirements
6. Provide a clear, actionable result

Provide a detailed response that addresses the task. Include:
- A clear understanding of the task objectives
- The implemented solution or executed actions
- Results and outcomes
- Evaluation of success criteria
- Any follow-up actions or recommendations

Be thorough, practical, and results-oriented in your execution.`,
      inputVariables: ['query', 'context'],
    });
  }
  
  /**
   * Process the response with execution-specific enhancements
   */
  processResponse(response) {
    const baseResult = super.processResponse(response);
    
    // Extract results and recommendations if possible
    const results = this.extractResults(response.content);
    const recommendations = this.extractRecommendations(response.content);
    
    return {
      ...baseResult,
      results,
      recommendations,
      confidence: this.assessConfidence(response.content),
    };
  }
  
  /**
   * Extract results from the response
   */
  extractResults(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const results = [];
    
    // Look for result sections
    const resultSection = content.match(/results?:.*?(?=\n\n|\n#|\n\*\*|$)/is);
    if (resultSection) {
      const resultText = resultSection[0].replace(/results?:/i, '').trim();
      
      // Split by bullet points or numbered items
      const resultItems = resultText.split(/\n[•\-\*\d]\s+/).filter(item => item.trim().length > 0);
      
      if (resultItems.length > 0) {
        results.push(...resultItems.map(item => item.trim()));
      } else {
        results.push(resultText);
      }
    }
    
    // If no structured results found, look for outcome or conclusion sections
    if (results.length === 0) {
      const outcomeSection = content.match(/(?:outcome|conclusion):.*?(?=\n\n|\n#|\n\*\*|$)/is);
      if (outcomeSection) {
        results.push(outcomeSection[0].replace(/(?:outcome|conclusion):/i, '').trim());
      }
    }
    
    // If still no results, take the last paragraph as a fallback
    if (results.length === 0) {
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
      if (paragraphs.length > 0) {
        results.push(paragraphs[paragraphs.length - 1].trim());
      }
    }
    
    return results;
  }
  
  /**
   * Extract recommendations from the response
   */
  extractRecommendations(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const recommendations = [];
    
    // Look for recommendation sections
    const recommendationSection = content.match(/recommendations?:.*?(?=\n\n|\n#|\n\*\*|$)/is);
    if (recommendationSection) {
      const recommendationText = recommendationSection[0].replace(/recommendations?:/i, '').trim();
      
      // Split by bullet points or numbered items
      const recommendationItems = recommendationText.split(/\n[•\-\*\d]\s+/).filter(item => item.trim().length > 0);
      
      if (recommendationItems.length > 0) {
        recommendations.push(...recommendationItems.map(item => item.trim()));
      } else {
        recommendations.push(recommendationText);
      }
    }
    
    // Look for next steps or follow-up sections
    if (recommendations.length === 0) {
      const nextStepsSection = content.match(/(?:next steps|follow-up):.*?(?=\n\n|\n#|\n\*\*|$)/is);
      if (nextStepsSection) {
        recommendations.push(nextStepsSection[0].replace(/(?:next steps|follow-up):/i, '').trim());
      }
    }
    
    return recommendations;
  }
  
  /**
   * Assess the confidence level of the execution
   */
  assessConfidence(content) {
    // Simple heuristic based on completeness and detail
    // In a real implementation, this would be more sophisticated
    
    // Check for key execution elements
    const hasObjectives = /objectives?|goals?|requirements?/i.test(content);
    const hasSolution = /solution|implementation|execution/i.test(content);
    const hasResults = /results?|outcomes?|output/i.test(content);
    const hasEvaluation = /evaluation|assessment|success criteria/i.test(content);
    
    // Calculate completeness score
    const completenessScore = [
      hasObjectives ? 0.2 : 0,
      hasSolution ? 0.3 : 0,
      hasResults ? 0.3 : 0,
      hasEvaluation ? 0.2 : 0,
    ].reduce((sum, score) => sum + score, 0);
    
    // Detail heuristic based on length and specificity
    const lengthScore = Math.min(content.length / 1500, 0.2); // Max score of 0.2 at 1500 chars
    
    // Check for specific details that indicate thoroughness
    const hasSpecificDetails = /\d+%|\d+\s*(?:minutes|hours|days)|specific steps/i.test(content);
    const detailScore = hasSpecificDetails ? 0.1 : 0;
    
    // Calculate overall confidence
    const confidence = 0.5 + completenessScore + lengthScore + detailScore;
    
    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }
}

module.exports = ExecutorAgent;
