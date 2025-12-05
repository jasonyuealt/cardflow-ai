/**
 * AI 配置
 */

export class AIConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;

  constructor() {
    this.baseURL = process.env.CEREBRAS_BASE_URL || 'https://api.cerebras.ai/v1';
    this.apiKey = process.env.CEREBRAS_API_KEY || '';
    this.model = process.env.CEREBRAS_MODEL || 'llama3.1-70b';
    this.temperature = 0.7;
    this.maxTokens = 4000;
  }
}

export const aiConfig = new AIConfig();

