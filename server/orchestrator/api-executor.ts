/**
 * API 执行器 - 支持 Mock 和真实 API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { delay } from '../utils/delay';
import { modeConfig } from '../config/mode.config';
import { ApiCallConfig, ApiResponse } from '../../shared/types';
import { CerebrasClient } from '../ai/cerebras-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class APIExecutor {
  private mockDataPath: string;
  private cerebrasClient: CerebrasClient;

  constructor() {
    this.mockDataPath = path.join(__dirname, '../mock-data');
    this.cerebrasClient = new CerebrasClient();
  }

  /**
   * 执行 API 调用
   */
  async execute(apiCall: ApiCallConfig): Promise<ApiResponse> {
    console.log(`📡 执行 API: ${apiCall.apiId}`);

    if (modeConfig.apiMock) {
      return await this.executeMock(apiCall);
    } else {
      return await this.executeReal(apiCall);
    }
  }

  /**
   * 执行 Mock API
   */
  private async executeMock(apiCall: ApiCallConfig): Promise<ApiResponse> {
    try {
      // 特殊处理：General Knowledge 模块直接调用真实的 AI
      if (apiCall.apiId === 'general/ask') {
        // 增强参数提取：尝试 query, question, text, message 等常见字段，或直接使用参数值
        const params = apiCall.parameters || {};
        const query = params.query || params.question || params.text || params.message || Object.values(params)[0] || 'Hello';
        
        console.log(`🧠 调用 AI 回答通用问题: "${query}"`);

        const aiResponse = await this.cerebrasClient.chatCompletion([
          {
            role: 'system',
            content: '你是一个知识渊博的助手。请用中文简明扼要地回答用户的问题。如果问题是"你是谁"，请回答你是 CardFlow AI。'
          },
          {
            role: 'user',
            content: query
          }
        ]);

        return ApiResponse.success({
          title: `关于 "${query}" 的回答`,
          summary: aiResponse,
          metadata: [
            { "label": "来源", "value": "AI Knowledge Base" },
            { "label": "类型", "value": "Direct Answer" }
          ]
        });
      }

      // 根据 apiId 找到对应的 mock 文件
      const mockFile = this.getMockFilePath(apiCall.apiId);
      
      if (!fs.existsSync(mockFile)) {
        return ApiResponse.error(`Mock 文件不存在: ${mockFile}`);
      }

      // 读取 mock 数据
      const content = fs.readFileSync(mockFile, 'utf-8');
      const mockData = JSON.parse(content);

      // 模拟网络延迟
      await delay(mockData.delay || 300);

      // 处理参数占位符
      let response = this.processTemplate(mockData.response, apiCall.parameters);

      console.log(`✓ Mock API 成功: ${apiCall.apiId}`);
      return ApiResponse.success(response);
    } catch (error: any) {
      console.error(`✗ Mock API 失败: ${apiCall.apiId}`, error.message);
      return ApiResponse.error(error.message);
    }
  }

  /**
   * 执行真实 API
   */
  private async executeReal(apiCall: ApiCallConfig): Promise<ApiResponse> {
    try {
      // TODO: 实现真实 API 调用
      // 这里应该根据 endpoint 和 method 发起真实的 HTTP 请求
      console.log('执行真实 API 调用（未实现）');
      
      // 临时降级到 Mock
      return await this.executeMock(apiCall);
    } catch (error: any) {
      console.error(`✗ 真实 API 失败: ${apiCall.apiId}`, error.message);
      return ApiResponse.error(error.message);
    }
  }

  /**
   * 获取 Mock 文件路径
   */
  private getMockFilePath(apiId: string): string {
    // flights/search → flights-search.json
    const fileName = apiId.replace('/', '-') + '.json';
    return path.join(this.mockDataPath, fileName);
  }

  /**
   * 处理模板字符串（替换占位符）
   */
  private processTemplate(template: any, params: Record<string, any>): any {
    if (typeof template !== 'string') {
      // 如果是对象或数组，递归处理
      if (Array.isArray(template)) {
        return template.map(item => this.processTemplate(item, params));
      } else if (typeof template === 'object' && template !== null) {
        const result: any = {};
        for (const key in template) {
          result[key] = this.processTemplate(template[key], params);
        }
        return result;
      }
      return template;
    }

    // 替换 ${params.xxx} 占位符
    let str = template;
    for (const [key, value] of Object.entries(params)) {
      const placeholder = `\${params.${key}}`;
      str = str.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
    }

    return str;
  }

  /**
   * 批量执行 API（并行）
   */
  async executeBatch(apiCalls: ApiCallConfig[]): Promise<Map<string, ApiResponse>> {
    const results = new Map<string, ApiResponse>();

    // 并行执行所有 API
    const promises = apiCalls.map(async (apiCall) => {
      const response = await this.execute(apiCall);
      return { apiCall, response };
    });

    const settled = await Promise.all(promises);

    settled.forEach(({ apiCall, response }) => {
      results.set(apiCall.apiId, response);
    });

    return results;
  }
}

