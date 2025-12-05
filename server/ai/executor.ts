/**
 * AI 服务 - 包含 Planner 和 Mapper
 */

import { ExecutionPlan, ModuleSummary, ExecutionModuleConfig } from '../../shared/types';
import { CerebrasClient, ChatMessage } from './cerebras-client';
import { PromptBuilder } from './prompt-builder';
import { VectorRetriever } from './vector-retriever';

export class AIExecutor {
  private cerebrasClient: CerebrasClient;
  private vectorRetriever: VectorRetriever;

  constructor() {
    this.cerebrasClient = new CerebrasClient();
    this.vectorRetriever = new VectorRetriever();
  }

  /**
   * Stage 1: Planner - 生成执行计划
   */
  async generateExecutionPlan(
    userInput: string,
    availableModules: ModuleSummary[]
  ): Promise<ExecutionPlan> {
    try {
      console.log('🧠 Stage 1: Planner AI Working...');

      // 1. 向量检索
      const relevantModules = this.vectorRetriever.search(userInput, availableModules, 5);
      console.log(`   向量检索候选: ${relevantModules.map(m => m.id).join(', ')}`);

      if (relevantModules.length === 0) {
        throw new Error('没有找到匹配的模块');
      }

      // 2. 构建 Planner Prompt
      const messages = PromptBuilder.buildPlannerMessages(userInput, relevantModules);

      // 3. 调用 Cerebras
      const response = await this.cerebrasClient.chatCompletion(messages);

      // 4. 解析响应
      const planData = this.parseJson(response);
      console.log('   Planner 决策:', JSON.stringify(planData, null, 2));

      // 5. 转换为 ExecutionPlan 格式
      return this.convertToExecutionPlan(planData);

    } catch (error: any) {
      console.error('Planner Error:', error.message);
      throw error;
    }
  }

  /**
   * Stage 2: Mapper - 数据映射
   */
  async mapToUI(rawData: any, layout: string): Promise<any> {
    try {
      console.log(`🎨 Stage 2: Mapper AI Working (Layout: ${layout})...`);
      
      // 1. 构建 Mapper Prompt
      const messages = PromptBuilder.buildMapperMessages(rawData, layout);

      // 2. 调用 Cerebras
      const response = await this.cerebrasClient.chatCompletion(messages);

      // 3. 解析响应
      const uiData = this.parseJson(response);
      console.log('   Mapper 输出:', JSON.stringify(uiData, null, 2).substring(0, 200) + '...');

      return uiData;

    } catch (error: any) {
      console.error('Mapper Error:', error.message);
      // 降级：如果 Mapper 失败，直接返回 Raw Data，前端可能无法渲染但至少不崩
      return rawData;
    }
  }

  private parseJson(text: string): any {
    try {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON found in response');
      return JSON.parse(match[0]);
    } catch (e) {
      console.error('JSON Parse Error. Raw text:', text);
      throw e;
    }
  }

  private convertToExecutionPlan(planData: any): ExecutionPlan {
    const moduleConfig = new ExecutionModuleConfig(
      `${planData.targetModuleId}-${Date.now()}`,
      planData.targetModuleId,
      1,
      true,
      {
        layout: planData.targetLayout,
        cardStyle: 'elevated',
        colorScheme: 'auto',
        density: 'comfortable'
      },
      {
        apiId: planData.apiCall.id,
        endpoint: '', // 暂时留空，由 PlanExecutor 填充或查找
        method: 'POST',
        parameters: planData.apiCall.params || {}
      },
      {}, // interactionApis 暂时留空，由 Loader 填充
      planData.reason
    );

    return {
      globalStyle: {
        theme: 'light',
        accentColor: 'blue',
        pageLayout: 'vertical'
      },
      modules: [moduleConfig]
    };
  }
}
