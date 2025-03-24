const BaseAgent = require('./BaseAgent');
const { PromptTemplate } = require('@langchain/core/prompts');

/**
 * Planner Agent specializes in breaking down complex tasks into manageable steps
 */
class PlannerAgent extends BaseAgent {
  constructor(agentConfig) {
    super(agentConfig);

    this.capabilities = [
      'task decomposition',
      'step sequencing',
      'dependency analysis',
      'resource allocation',
      'timeline estimation',
    ];
  }

  /**
   * Create a specialized prompt template for the planner agent
   */
  createPromptTemplate() {
    return new PromptTemplate({
      template: `You are a Planning Agent, an AI specialized in breaking down complex tasks into manageable steps and creating structured plans.

Task: {query}

Context: {context}

As a Planning Agent, your goal is to:
1. Analyze the overall task and identify its components
2. Break down the task into clear, actionable steps
3. Determine the logical sequence of steps
4. Identify dependencies between steps
5. Estimate time and resources needed for each step
6. Create a comprehensive plan that can be followed to complete the task

Provide a detailed plan that addresses the task. Include:
- Overall goal and success criteria
- Step-by-step breakdown of the task
- Dependencies between steps
- Estimated time for each step
- Required resources or prerequisites
- Potential challenges and contingency plans
- Success metrics or evaluation criteria

Be thorough, practical, and clear in your planning.`,
      inputVariables: ['query', 'context'],
    });
  }

  /**
   * Process the response with planning-specific enhancements
   */
  processResponse(response) {
    const baseResult = super.processResponse(response);

    // Extract steps and timeline if possible
    const steps = this.extractSteps(response.content);
    const timeline = this.estimateTimeline(steps);

    return {
      ...baseResult,
      plan: {
        steps,
        timeline,
        dependencies: this.extractDependencies(response.content),
      },
      confidence: this.assessConfidence(response.content),
    };
  }

  /**
   * Extract steps from the response
   */
  extractSteps(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const steps = [];

    // Look for numbered steps
    const stepMatches = content.match(/\d+\.\s+(.*?)(?=\n|$)/g);
    if (stepMatches) {
      stepMatches.forEach((match, index) => {
        steps.push({
          id: index + 1,
          description: match.replace(/\d+\.\s+/, '').trim(),
        });
      });
    }

    // If no structured steps found, try to extract bullet points
    if (steps.length === 0) {
      const bulletMatches = content.match(/[•\-\*]\s+(.*?)(?=\n|$)/g);
      if (bulletMatches) {
        bulletMatches.forEach((match, index) => {
          steps.push({
            id: index + 1,
            description: match.replace(/[•\-\*]\s+/, '').trim(),
          });
        });
      }
    }

    // If still no steps, try to extract paragraphs
    if (steps.length === 0) {
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
      paragraphs.forEach((paragraph, index) => {
        steps.push({
          id: index + 1,
          description: paragraph.trim(),
        });
      });
    }

    return steps;
  }

  /**
   * Estimate timeline based on extracted steps
   */
  estimateTimeline(steps) {
    // Simple heuristic for timeline estimation
    // In a real implementation, this would be more sophisticated

    // Default to 1 hour per step if no better estimate is available
    const defaultStepDuration = 60; // minutes

    const timeline = steps.map(step => {
      // Look for time indicators in the step description
      const description = step.description.toLowerCase();
      let durationMinutes = defaultStepDuration;

      // Check for explicit time mentions
      const hourMatch = description.match(/(\d+)\s*hour/);
      const minuteMatch = description.match(/(\d+)\s*minute/);
      const dayMatch = description.match(/(\d+)\s*day/);

      if (hourMatch) {
        durationMinutes = parseInt(hourMatch[1], 10) * 60;
      } else if (minuteMatch) {
        durationMinutes = parseInt(minuteMatch[1], 10);
      } else if (dayMatch) {
        durationMinutes = parseInt(dayMatch[1], 10) * 60 * 8; // Assuming 8-hour workdays
      }

      // Adjust based on complexity indicators
      if (description.includes('complex') || description.includes('difficult')) {
        durationMinutes *= 1.5;
      } else if (description.includes('simple') || description.includes('easy')) {
        durationMinutes *= 0.5;
      }

      return {
        stepId: step.id,
        durationMinutes: Math.round(durationMinutes),
        startTime: null, // Would be calculated based on dependencies in a real implementation
        endTime: null,   // Would be calculated based on start time and duration in a real implementation
      };
    });

    return timeline;
  }

  /**
   * Extract dependencies between steps
   */
  extractDependencies(content) {
    // Simple extraction based on text patterns
    // In a real implementation, this would be more sophisticated
    const dependencies = [];

    // Look for dependency indicators
    const lines = content.split('\n');

    lines.forEach(line => {
      // Look for patterns like "Step X depends on Step Y" or "After Step X, proceed to Step Y"
      const dependencyMatch = line.match(/step\s*(\d+).*depends.*step\s*(\d+)/i);
      const sequenceMatch = line.match(/after\s*step\s*(\d+).*step\s*(\d+)/i);

      if (dependencyMatch) {
        dependencies.push({
          stepId: parseInt(dependencyMatch[1], 10),
          dependsOn: parseInt(dependencyMatch[2], 10),
        });
      } else if (sequenceMatch) {
        dependencies.push({
          stepId: parseInt(sequenceMatch[2], 10),
          dependsOn: parseInt(sequenceMatch[1], 10),
        });
      }
    });

    // If no explicit dependencies found, assume sequential dependencies
    if (dependencies.length === 0) {
      for (let i = 2; i <= 10; i++) { // Assume up to 10 steps
        dependencies.push({
          stepId: i,
          dependsOn: i - 1,
        });
      }
    }

    return dependencies;
  }

  /**
   * Assess the confidence level of the plan
   */
  assessConfidence(content) {
    // Simple heuristic based on plan completeness and detail
    // In a real implementation, this would be more sophisticated

    // Check for key planning elements
    const hasSteps = /\d+\.\s+/.test(content) || /[•\-\*]\s+/.test(content);
    const hasTimeline = /hour|minute|day|week|month/.test(content.toLowerCase());
    const hasDependencies = /depends|after|before|following|prerequisite/.test(content.toLowerCase());
    const hasResources = /resource|require|need|tool|material/.test(content.toLowerCase());
    const hasChallenges = /challenge|risk|issue|problem|difficulty/.test(content.toLowerCase());

    // Calculate completeness score
    const completenessScore = [
      hasSteps ? 0.3 : 0,
      hasTimeline ? 0.2 : 0,
      hasDependencies ? 0.2 : 0,
      hasResources ? 0.15 : 0,
      hasChallenges ? 0.15 : 0,
    ].reduce((sum, score) => sum + score, 0);

    // Length heuristic as a proxy for detail
    const lengthScore = Math.min(content.length / 2000, 0.2); // Max score of 0.2 at 2000 chars

    // Calculate overall confidence
    const confidence = 0.5 + completenessScore + lengthScore;

    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }
}

module.exports = PlannerAgent;
