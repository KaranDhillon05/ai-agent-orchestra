const BaseAgent = require('./BaseAgent');
const { PromptTemplate } = require('@langchain/core/prompts');

/**
 * Creative Agent specializes in generating innovative ideas and solutions
 */
class CreativeAgent extends BaseAgent {
  constructor(agentConfig) {
    super(agentConfig);
    
    this.capabilities = [
      'idea generation',
      'creative problem solving',
      'innovative thinking',
      'concept development',
      'divergent thinking',
    ];
  }
  
  /**
   * Create a specialized prompt template for the creative agent
   */
  createPromptTemplate() {
    return new PromptTemplate({
      template: `You are a Creative Agent, an AI specialized in generating innovative ideas and solutions.

Task: {query}

Context: {context}

As a Creative Agent, your goal is to:
1. Think outside the box and generate novel ideas
2. Approach problems from multiple perspectives
3. Develop innovative solutions or concepts
4. Combine ideas in unexpected ways
5. Push beyond conventional thinking
6. Create original and valuable outputs

Provide a creative response that addresses the task. Include:
- Multiple innovative ideas or approaches
- Unique perspectives on the problem
- Novel combinations of existing concepts
- Unconventional solutions
- Creative frameworks or methodologies
- Imaginative scenarios or possibilities

Be bold, original, and imaginative in your thinking. Don't be constrained by conventional approaches.`,
      inputVariables: ['query', 'context'],
    });
  }
  
  /**
   * Process the response with creative-specific enhancements
   */
  processResponse(response) {
    const baseResult = super.processResponse(response);
    
    // Extract ideas and concepts if possible
    const ideas = this.extractIdeas(response.content);
    const concepts = this.extractConcepts(response.content);
    
    return {
      ...baseResult,
      creative: {
        ideas,
        concepts,
        approaches: this.extractApproaches(response.content),
      },
      noveltyScore: this.assessNovelty(response.content),
      confidence: this.assessConfidence(response.content),
    };
  }
  
  /**
   * Extract ideas from the response
   */
  extractIdeas(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const ideas = [];
    
    // Look for idea sections
    const ideaSection = content.match(/ideas?:.*?(?=\n\n|\n#|\n\*\*|$)/is);
    if (ideaSection) {
      const ideaText = ideaSection[0].replace(/ideas?:/i, '').trim();
      
      // Split by bullet points or numbered items
      const ideaItems = ideaText.split(/\n[•\-\*\d]\s+/).filter(item => item.trim().length > 0);
      
      if (ideaItems.length > 0) {
        ideas.push(...ideaItems.map(item => item.trim()));
      } else {
        ideas.push(ideaText);
      }
    }
    
    // Look for solution sections
    if (ideas.length === 0) {
      const solutionSection = content.match(/solutions?:.*?(?=\n\n|\n#|\n\*\*|$)/is);
      if (solutionSection) {
        const solutionText = solutionSection[0].replace(/solutions?:/i, '').trim();
        
        // Split by bullet points or numbered items
        const solutionItems = solutionText.split(/\n[•\-\*\d]\s+/).filter(item => item.trim().length > 0);
        
        if (solutionItems.length > 0) {
          ideas.push(...solutionItems.map(item => item.trim()));
        } else {
          ideas.push(solutionText);
        }
      }
    }
    
    return ideas;
  }
  
  /**
   * Extract concepts from the response
   */
  extractConcepts(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const concepts = [];
    
    // Look for concept sections
    const conceptSection = content.match(/concepts?:.*?(?=\n\n|\n#|\n\*\*|$)/is);
    if (conceptSection) {
      const conceptText = conceptSection[0].replace(/concepts?:/i, '').trim();
      
      // Split by bullet points or numbered items
      const conceptItems = conceptText.split(/\n[•\-\*\d]\s+/).filter(item => item.trim().length > 0);
      
      if (conceptItems.length > 0) {
        concepts.push(...conceptItems.map(item => item.trim()));
      } else {
        concepts.push(conceptText);
      }
    }
    
    // Look for framework sections
    if (concepts.length === 0) {
      const frameworkSection = content.match(/frameworks?:.*?(?=\n\n|\n#|\n\*\*|$)/is);
      if (frameworkSection) {
        const frameworkText = frameworkSection[0].replace(/frameworks?:/i, '').trim();
        concepts.push(frameworkText);
      }
    }
    
    return concepts;
  }
  
  /**
   * Extract approaches from the response
   */
  extractApproaches(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const approaches = [];
    
    // Look for approach sections
    const approachSection = content.match(/approaches?:.*?(?=\n\n|\n#|\n\*\*|$)/is);
    if (approachSection) {
      const approachText = approachSection[0].replace(/approaches?:/i, '').trim();
      
      // Split by bullet points or numbered items
      const approachItems = approachText.split(/\n[•\-\*\d]\s+/).filter(item => item.trim().length > 0);
      
      if (approachItems.length > 0) {
        approaches.push(...approachItems.map(item => item.trim()));
      } else {
        approaches.push(approachText);
      }
    }
    
    // Look for methodology sections
    if (approaches.length === 0) {
      const methodologySection = content.match(/methodolog(?:y|ies):.*?(?=\n\n|\n#|\n\*\*|$)/is);
      if (methodologySection) {
        const methodologyText = methodologySection[0].replace(/methodolog(?:y|ies):/i, '').trim();
        approaches.push(methodologyText);
      }
    }
    
    return approaches;
  }
  
  /**
   * Assess the novelty of the creative output
   */
  assessNovelty(content) {
    // Simple heuristic based on creative language and unconventional ideas
    // In a real implementation, this would be more sophisticated
    
    // Check for creative language
    const creativeTerms = [
      'innovative', 'novel', 'unique', 'original', 'creative',
      'unconventional', 'unexpected', 'surprising', 'imaginative',
      'revolutionary', 'groundbreaking', 'cutting-edge', 'pioneering',
    ];
    
    const creativeTermCount = creativeTerms.reduce((count, term) => {
      return count + (content.toLowerCase().includes(term) ? 1 : 0);
    }, 0);
    
    // Normalize to a score between 0 and 0.5
    const creativeLanguageScore = Math.min(creativeTermCount / 10, 0.5);
    
    // Check for idea diversity (number of distinct ideas or approaches)
    const ideaCount = (content.match(/\n[•\-\*\d]\s+/g) || []).length;
    const ideaDiversityScore = Math.min(ideaCount / 10, 0.3);
    
    // Check for unconventional combinations
    const combinationTerms = ['combine', 'blend', 'merge', 'integrate', 'fusion', 'hybrid'];
    const hasCombinations = combinationTerms.some(term => content.toLowerCase().includes(term));
    const combinationScore = hasCombinations ? 0.2 : 0;
    
    // Calculate overall novelty score
    const noveltyScore = creativeLanguageScore + ideaDiversityScore + combinationScore;
    
    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, noveltyScore));
  }
  
  /**
   * Assess the confidence level of the creative output
   */
  assessConfidence(content) {
    // For creative outputs, confidence is less about correctness and more about
    // the richness, diversity, and development of the ideas
    
    // Check for key creative elements
    const hasMultipleIdeas = (content.match(/\n[•\-\*\d]\s+/g) || []).length >= 3;
    const hasDetailedExplanations = content.length > 1000;
    const hasDiverseApproaches = this.extractApproaches(content).length > 1;
    
    // Calculate richness score
    const richnessScore = [
      hasMultipleIdeas ? 0.3 : 0,
      hasDetailedExplanations ? 0.3 : 0,
      hasDiverseApproaches ? 0.2 : 0,
    ].reduce((sum, score) => sum + score, 0);
    
    // Novelty contributes to confidence for creative outputs
    const noveltyContribution = this.assessNovelty(content) * 0.2;
    
    // Calculate overall confidence
    const confidence = 0.5 + richnessScore + noveltyContribution;
    
    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }
}

module.exports = CreativeAgent;
