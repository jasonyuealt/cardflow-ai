/**
 * Cerebras AI 客户端
 */

import axios from 'axios';
import { aiConfig } from '../config/ai.config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class CerebrasClient {
  private baseURL: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.baseURL = aiConfig.baseURL;
    this.apiKey = aiConfig.apiKey;
    this.model = aiConfig.model;
  }

  /**
   * 调用 Chat Completion API
   */
  async chatCompletion(messages: ChatMessage[]): Promise<string> {
    try {
      console.log('🤖 调用 Cerebras AI...');
      
      const response = await axios.post<ChatCompletionResponse>(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: messages,
          temperature: aiConfig.temperature,
          max_tokens: aiConfig.maxTokens,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000, // 30秒超时
        }
      );

      const content = response.data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('AI 返回内容为空');
      }

      console.log('✓ AI 响应成功');
      return content;
    } catch (error: any) {
      console.error('✗ AI 调用失败:', error.message);
      throw new Error(`Cerebras AI 调用失败: ${error.message}`);
    }
  }

  /**
   * 测试 API 连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 10000,
      });

      console.log('✓ Cerebras API 连接成功');
      console.log('可用模型:', response.data.data?.map((m: any) => m.id).join(', '));
      return true;
    } catch (error: any) {
      console.error('✗ Cerebras API 连接失败:', error.message);
      return false;
    }
  }
}

