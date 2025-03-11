const BaseAgent = require('./BaseAgent');
const { PromptTemplate } = require('@langchain/core/prompts');

/**
 * Critic Agent specializes in evaluating solutions and identifying potential issues
 */
class CriticAgent extends BaseAgent {
  constructor(agentConfig) {
    super(agentConfig);
    
    this.capabilities = [
      'solution evaluation',
      'issue identification',
      'risk assessment',
      'quality control',
      'improvement suggestions',
    ];
  }
  
  /**
   * Create a specialized prompt template for the critic agent
   */
  createPromptTemplate() {
    return new PromptTemplate({
      template: `You are a Critic Agent, an AI specialized in evaluating solutions and identifying potential issues.

Task: {query}

Context: {context}

As a Critic Agent, your goal is to:
1. Carefully analyze the proposed solution or information
2. Identify potential issues, flaws, or weaknesses
3. Assess risks and limitations
4. Evaluate the quality and effectiveness
5. Suggest improvements or alternatives
6. Provide a balanced assessment that acknowledges both strengths and weaknesses

Provide a detailed critique that addresses the task. Include:
- Strengths of the current approach
- Weaknesses, issues, or limitations
- Potential risks or edge cases
- Quality assessment
- Specific improvement suggestions
- Alternative approaches to consider

Be thorough, balanced, and constructive in your criticism. Focus on improving the solution rather than simply finding faults.`,
      inputVariables: ['query', 'context'],
    });
  }
  
  /**
   * Process the response with critic-specific enhancements
   */
  processResponse(response) {
    const baseResult = super.processResponse(response);
    
    // Extract issues and suggestions if possible
    const issues = this.extractIssues(response.content);
    const suggestions = this.extractSuggestions(response.content);
    
    return {
      ...baseResult,
      critique: {
        issues,
        suggestions,
        strengths: this.extractStrengths(response.content),
      },
      confidence: this.assessConfidence(response.content),
    };
  }
  
  /**
   * Extract issues from the response
   */
  extractIssues(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const issues = [];
    
    // Look for issues, weaknesses, or limitations sections
    const issueSection = content.match(/(?:issues|weaknesses|limitations|problems|concerns):.*?(?=\n\n|\n#|\n\*\*|$)/is);
    if (issueSection) {
      const issueText = issueSection[0].replace(/(?:issues|weaknesses|limitations|problems|concerns):/i, '').trim();
      
      // Split by bullet points or numbered items
      const issueItems = issueText.split(/\n[•\-\*\d]\s+/).filter(item => item.trim().length > 0);
      
      if (issueItems.length > 0) {
        issues.push(...issueItems.map(item => item.trim()));
      } else {
        issues.push(issueText);
      }
    }
    
    // Look for risk sections
    if (issues.length === 0) {
      const riskSection = content.match(/risks?:.*?(?=\n\n|\n#|\n\*\*|$)/is);
      if (riskSection) {
        const riskText = riskSection[0].replace(/risks?:/i, '').trim();
        issues.push(riskText);
      }
    }
    
    return issues;
  }
  
  /**
   * Extract suggestions from the response
   */
  extractSuggestions(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const suggestions = [];
    
    // Look for suggestions or improvements sections
    const suggestionSection = content.match(/(?:suggestions|improvements|recommendations):.*?(?=\n\n|\n#|\n\*\*|$)/is);
    if (suggestionSection) {
      const suggestionText = suggestionSection[0].replace(/(?:suggestions|improvements|recommendations):/i, '').trim();
      
      // Split by bullet points or numbered items
      const suggestionItems = suggestionText.split(/\n[•\-\*\d]\s+/).filter(item => item.trim().length > 0);
      
      if (suggestionItems.length > 0) {
        suggestions.push(...suggestionItems.map(item => item.trim()));
      } else {
        suggestions.push(suggestionText);
      }
    }
    
    // Look for alternatives sections
    if (suggestions.length === 0) {
      const alternativeSection = content.match(/alternatives?:.*?(?=\n\n|\n#|\n\*\*|$)/is);
      if (alternativeSection) {
        const alternativeText = alternativeSection[0].replace(/alternatives?:/i, '').trim();
        suggestions.push(alternativeText);
      }
    }
    
    return suggestions;
  }
  
  /**
   * Extract strengths from the response
   */
  extractStrengths(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const strengths = [];
    
    // Look for strengths or positives sections
    const strengthSection = content.match(/(?:strengths|positives|advantages):.*?(?=\n\n|\n#|\n\*\*|$)/is);
    if (strengthSection) {
      const strengthText = strengthSection[0].replace(/(?:strengths|positives|advantages):/i, '').trim();
      
      // Split by bullet points or numbered items
      const strengthItems = strengthText.split(/\n[•\-\*\d]\s+/).filter(item => item.trim().length > 0);
      
      if (strengthItems.length > 0) {
        strengths.push(...strengthItems.map(item => item.trim()));
      } else {
        strengths.push(strengthText);
      }
    }
    
    return strengths;
  }
  
  /**
   * Assess the confidence level of the critique
   */
  assessConfidence(content) {
    // Simple heuristic based on critique completeness and balance
    // In a real implementation, this would be more sophisticated
    
    // Check for key critique elements
    const hasStrengths = /strengths|positives|advantages|good|well/i.test(content);
    const hasWeaknesses = /weaknesses|issues|problems|limitations|concerns/i.test(content);
    const hasSuggestions = /suggestions|improvements|recommendations|alternatives/i.test(content);
    const hasRisks = /risks|dangers|threats|challenges/i.test(content);
    
    // Calculate completeness score
    const completenessScore = [
      hasStrengths ? 0.2 : 0,
      hasWeaknesses ? 0.3 : 0,
      hasSuggestions ? 0.3 : 0,
      hasRisks ? 0.2 : 0,
    ].reduce((sum, score) => sum + score, 0);
    
    // Check for balance (both strengths and weaknesses)
    const balanceScore = (hasStrengths && hasWeaknesses) ? 0.2 : 0;
    
    // Length heuristic as a proxy for detail
    const lengthScore = Math.min(content.length / 1500, 0.1); // Max score of 0.1 at 1500 chars
    
    // Calculate overall confidence
    const confidence = 0.5 + completenessScore + balanceScore + lengthScore;
    
    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }
}

module.exports = CriticAgent;
