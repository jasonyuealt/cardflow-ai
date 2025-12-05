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
  "modules": [
    {
      "targetModuleId": "string",
      "targetLayout": "string",
      "apiCall": {
        "id": "string",
        "params": { "key": "value" }
      },
      "reason": "string"
    }
  ]
}

# Rules
1. Analyze user input for MULTIPLE intents.
2. Select ALL relevant modules from the available list.
3. CRITICAL: Even if the user only asks for one thing (e.g., "flight"), YOU MUST RECOMMEND RELATED MODULES if they make sense in the context (e.g., "hotel" or "transport" for a trip).
4. If specific parameters are missing for recommended modules, use reasonable defaults (e.g. destination city from flight).
5. If the user intent implies a sequence (e.g., "book flight then hotel"), preserve the logical order.
6. Extract parameters for each API call independently.
7. Return ONLY JSON. The root object must contain a "modules" array.
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
