/**
 * API 执行器 - 支持 Mock 和真实 API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { delay } from '../utils/delay';
import { modeConfig } from '../config/mode.config';
import { ApiCallConfig, ApiResponse } from '../../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class APIExecutor {
  private mockDataPath: string;

  constructor() {
    this.mockDataPath = path.join(__dirname, '../mock-data');
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

