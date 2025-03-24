const BaseAgent = require('./BaseAgent');
const { PromptTemplate } = require('@langchain/core/prompts');
const knowledgeService = require('../knowledge/knowledgeService');

/**
 * Research Agent specializes in gathering and analyzing information
 */
class ResearchAgent extends BaseAgent {
  constructor(agentConfig) {
    super(agentConfig);

    this.capabilities = [
      'information retrieval',
      'data analysis',
      'fact verification',
      'source evaluation',
      'knowledge synthesis',
    ];
  }

  /**
   * Create a specialized prompt template for the research agent
   */
  createPromptTemplate() {
    return new PromptTemplate({
      template: `You are a Research Agent, an AI specialized in gathering, analyzing, and synthesizing information from various sources.

Task: {query}

Context: {context}

As a Research Agent, your goal is to:
1. Thoroughly investigate the topic or question
2. Gather relevant information from multiple sources
3. Evaluate the credibility and reliability of sources
4. Synthesize the information into a comprehensive analysis
5. Identify any gaps in knowledge or areas of uncertainty
6. Provide well-supported conclusions based on the evidence

Provide a detailed research report that addresses the task. Include:
- Key findings
- Analysis of information
- Reliability assessment of sources
- Potential biases or limitations in the information
- Areas where more research is needed
- Conclusions based on available evidence

Be thorough, accurate, and objective in your analysis.`,
      inputVariables: ['query', 'context'],
    });
  }

  /**
   * Process a task with additional research capabilities
   */
  async processTask(task, context = {}) {
    // Enhance the task with relevant knowledge from the knowledge base
    const enhancedContext = { ...context };

    try {
      const relevantKnowledge = await knowledgeService.retrieveRelevantKnowledge(task.query);
      enhancedContext.relevantKnowledge = relevantKnowledge;
    } catch (error) {
      console.error('Error retrieving knowledge:', error);
      // Continue even if knowledge retrieval fails
    }

    // Process the task with the enhanced context
    return super.processTask(task, enhancedContext);
  }

  /**
   * Process the response with research-specific enhancements
   */
  processResponse(response) {
    const baseResult = super.processResponse(response);

    // Extract key findings and sources if possible
    const keyFindings = this.extractKeyFindings(response.content);
    const sources = this.extractSources(response.content);

    return {
      ...baseResult,
      keyFindings,
      sources,
      confidence: this.assessConfidence(response.content),
    };
  }

  /**
   * Extract key findings from the response
   */
  extractKeyFindings(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const findings = [];

    // Look for bullet points or numbered lists
    const bulletMatches = content.match(/[•\-\*]\s+(.*?)(?=\n|$)/g);
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        findings.push(match.replace(/[•\-\*]\s+/, '').trim());
      });
    }

    // Look for numbered points
    const numberedMatches = content.match(/\d+\.\s+(.*?)(?=\n|$)/g);
    if (numberedMatches) {
      numberedMatches.forEach(match => {
        findings.push(match.replace(/\d+\.\s+/, '').trim());
      });
    }

    // If no structured findings, take the first few sentences
    if (findings.length === 0) {
      const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
      findings.push(...sentences.slice(0, 3).map(s => s.trim()));
    }

    return findings.slice(0, 5); // Return at most 5 key findings
  }

  /**
   * Extract sources from the response
   */
  extractSources(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const sources = [];

    // Look for URLs
    const urlMatches = content.match(/https?:\/\/[^\s)]+/g);
    if (urlMatches) {
      sources.push(...urlMatches);
    }

    // Look for citations in various formats
    const citationMatches = content.match(/\(\d{4}\)/g); // (YYYY) format
    if (citationMatches) {
      sources.push(...citationMatches);
    }

    return sources;
  }

  /**
   * Assess the confidence level of the response
   */
  assessConfidence(content) {
    // Simple heuristic based on length, detail, and hedging language
    // In a real implementation, this would be more sophisticated

    // Length heuristic
    const lengthScore = Math.min(content.length / 1000, 1); // Max score at 1000 chars

    // Detail heuristic (presence of numbers, dates, specific terms)
    const hasNumbers = /\d+/.test(content);
    const hasDates = /\b(19|20)\d{2}\b/.test(content);
    const detailScore = (hasNumbers ? 0.3 : 0) + (hasDates ? 0.2 : 0);

    // Hedging language heuristic (lower confidence)
    const hedgingTerms = ['possibly', 'perhaps', 'maybe', 'might', 'could be', 'uncertain'];
    const hedgingCount = hedgingTerms.reduce((count, term) => {
      return count + (content.toLowerCase().includes(term) ? 1 : 0);
    }, 0);
    const hedgingPenalty = Math.min(hedgingCount * 0.1, 0.5);

    // Calculate overall confidence
    let confidence = 0.5 + (lengthScore * 0.3) + detailScore - hedgingPenalty;

    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }
}

module.exports = ResearchAgent;
