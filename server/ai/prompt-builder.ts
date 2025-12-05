/**
 * Prompt 构建器
 */

import { ModuleSummary } from '../../shared/types';
import { ChatMessage } from './cerebras-client';

export class PromptBuilder {
  /**
   * 构建 Planner 系统 Prompt
   */
  static buildPlannerSystemPrompt(modules: ModuleSummary[]): string {
    const moduleDescriptions = modules.map(m => 
      `- ${m.id}: ${m.description}\n  关键词: ${m.keywords.join('、')}\n  布局: ${m.recommendedLayout}`
    ).join('\n');

    return `You are a Planner AI for CardFlow.
Your goal is to analyze user input and create an execution plan using available modules.

# Available Modules
${moduleDescriptions}

# Your Output Format (JSON Only)
{
  "targetModuleId": "string (id of the chosen module)",
  "targetLayout": "string (the recommendedLayout of the module)",
  "apiCall": {
    "id": "string (the API operation to call, e.g., 'search')",
    "params": {
      "key": "value (extracted from user input)"
    }
  },
  "reason": "string (why you chose this module)"
}

# Rules
1. Select the most relevant module.
2. Extract parameters for the API.
3. If no parameters are provided, use reasonable defaults or leave empty if optional.
4. Return ONLY JSON. No markdown, no explanation.
`;
  }

  /**
   * 构建 Mapper 系统 Prompt
   */
  static buildMapperSystemPrompt(layout: string, schemaDescription: string): string {
    return `You are a Mapper AI for CardFlow.
Your goal is to transform Raw JSON Data into a specific UI Data Structure.

# Target Layout: ${layout}

# Target UI Schema
${schemaDescription}

# Rules
1. Analyze the Raw Data and extract relevant information.
2. Map fields to the Target UI Schema.
3. "hero" field: use an image URL if available, otherwise use a relevant emoji icon.
4. "highlight": formatted price, score, or key metric.
5. "actions": generate sensible actions based on the data (e.g., "Book", "View", "Call").
6. Return valid JSON matching the Schema.
7. Return ONLY JSON.
`;
  }

  /**
   * 构建 Planner 消息列表
   */
  static buildPlannerMessages(userInput: string, modules: ModuleSummary[]): ChatMessage[] {
    return [
      {
        role: 'system',
        content: this.buildPlannerSystemPrompt(modules),
      },
      {
        role: 'user',
        content: userInput,
      },
    ];
  }

  /**
   * 构建 Mapper 消息列表
   */
  static buildMapperMessages(rawData: any, layout: string): ChatMessage[] {
    const schemas: Record<string, string> = {
      'horizontal-scrollable-list': `
Array of items:
{
  "id": "string",
  "hero": { "type": "icon" | "image", "value": "string" },
  "title": "string",
  "subtitle": "string (optional)",
  "details": ["string"] (optional),
  "highlight": { "value": "string", "color": "primary" | "danger" | "success" } (optional),
  "actions": [{ "label": "string", "type": "api", "id": "string" }]
}
`,
      'info-display': `
Array of items:
{
  "title": "string",
  "summary": "string",
  "metadata": [{ "label": "string", "value": "string" }],
  "footer": "string (optional)",
  "link": "string (optional)"
}
`,
      'interactive-action': `
Array of items:
{
  "icon": "string (emoji)",
  "label": "string",
  "status": "idle" | "running" | "success" | "error",
  "description": "string",
  "primaryAction": { "label": "string", "type": "api", "id": "string" }
}
`,
      'map-view-horizontal': `
Array of items:
{
  "location": { "lat": number, "lng": number },
  "title": "string",
  "address": "string",
  "distance": "string",
  "tags": ["string"]
}
`
    };

    const schema = schemas[layout] || schemas['horizontal-scrollable-list'];

    return [
      {
        role: 'system',
        content: this.buildMapperSystemPrompt(layout, schema),
      },
      {
        role: 'user',
        content: `Raw Data: ${JSON.stringify(rawData)}`,
      },
    ];
  }
}
