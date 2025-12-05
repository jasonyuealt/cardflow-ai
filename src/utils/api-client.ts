/**
 * API 客户端
 */

import axios from 'axios';
import {
  GeneratePlanRequest,
  ExecuteInteractionRequest,
  ModuleInstance,
  GlobalStyleConfig,
} from '../../shared/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface GeneratePlanResponseData {
  success: boolean;
  globalStyle: GlobalStyleConfig;
  modules: ModuleInstance[];
  error?: string;
}

/**
 * 生成执行计划
 */
export async function generatePlan(
  userInput: string,
  context?: any
): Promise<GeneratePlanResponseData> {
  const request: GeneratePlanRequest = {
    userInput,
    context,
  };

  const response = await client.post<GeneratePlanResponseData>('/api/ai/generate-plan', request);
  return response.data;
}

/**
 * 执行交互
 */
export async function executeInteraction(
  instanceId: string,
  action: string,
  context: Record<string, any>
): Promise<any> {
  const request: ExecuteInteractionRequest = {
    instanceId,
    action,
    context,
  };

  const response = await client.post('/api/ai/execute-interaction', request);
  return response.data;
}

/**
 * 测试 AI 连接
 */
export async function testAIConnection(): Promise<boolean> {
  try {
    const response = await client.get('/api/ai/test');
    return response.data.success;
  } catch (error) {
    return false;
  }
}

