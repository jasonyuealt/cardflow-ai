/**
 * AI 服务 - 包含 Planner 和 Mapper
 */

import { ExecutionPlan, ModuleSummary, ExecutionModuleConfig } from '../../shared/types';
import { CerebrasClient, ChatMessage } from './cerebras-client';
import { PromptBuilder } from './prompt-builder';
import { VectorRetriever } from './vector-retriever';

import { ModuleLoader } from '../modules/loader';

export class AIExecutor {
  private cerebrasClient: CerebrasClient;
  private vectorRetriever: VectorRetriever;
  private moduleLoader: ModuleLoader;

  constructor() {
    this.cerebrasClient = new CerebrasClient();
    this.vectorRetriever = new VectorRetriever();
    this.moduleLoader = new ModuleLoader();
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
        console.log('   ⚠️ 未找到匹配模块，启用通用兜底策略 (General Info Fallback)');
        // Fallback: 使用 info_card 进行通用搜索
        return this.createFallbackPlan(userInput);
      }

      // 1.5 注入详细 API 定义 (NEW)
      // 在构建 Prompt 前，加载这些候选模块的详细定义，把 apis 塞进去
      const relevantModuleIds = relevantModules.map(m => m.id);
      const detailedModulesMap = this.moduleLoader.loadModuleDefinitions(relevantModuleIds);
      
      // 更新 relevantModules 中的 apis 字段
      relevantModules.forEach(summary => {
        const detail = detailedModulesMap.get(summary.id);
        if (detail) {
          summary.apis = detail.apis;
        }
      });

      // 2. 构建 Planner Prompt
      const messages = PromptBuilder.buildPlannerMessages(userInput, relevantModules);

      // 3. 调用 Cerebras
      const response = await this.cerebrasClient.chatCompletion(messages);

      // 4. 解析响应
      const planData = this.parseJson(response);
      console.log('   Planner 决策:', JSON.stringify(planData, null, 2));

      // 5. 转换为 ExecutionPlan 格式
      const plan = this.convertToExecutionPlan(planData);

      // 6. 二次兜底：如果 Planner 也没生成任何模块（可能是觉得不匹配），强制兜底
      if (plan.modules.length === 0) {
        console.log('   ⚠️ Planner 返回空计划，启用通用兜底策略 (General Info Fallback)');
        return this.createFallbackPlan(userInput);
      }
      
      return plan;

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
    // 支持新的多模块格式 { modules: [...] } 或旧的单模块格式
    const modulesData = planData.modules || [planData];

    const moduleConfigs = modulesData.map((mod: any, index: number) => {
      return new ExecutionModuleConfig(
        `${mod.targetModuleId}-${Date.now()}-${index}`,
        mod.targetModuleId,
        index + 1, // 优先级按顺序排列
        index === 0, // 只有第一个默认展开
        {
          layout: mod.targetLayout,
          cardStyle: index === 0 ? 'elevated' : 'flat',
          colorScheme: 'auto',
          density: 'comfortable'
        },
        {
          apiId: mod.apiCall.id,
          endpoint: '', 
        method: 'POST',
          parameters: mod.apiCall.params || {}
        },
        {},
        mod.reason
      );
    });

    return {
      globalStyle: {
        theme: 'light',
        accentColor: 'blue',
        pageLayout: 'vertical'
      },
      modules: moduleConfigs
    };
  }

  /**
   * 创建兜底计划
   */
  private createFallbackPlan(userInput: string): ExecutionPlan {
    const fallbackModule = new ExecutionModuleConfig(
      `fallback-${Date.now()}`,
      'general_knowledge', // 优先使用 General Knowledge 模块
      1,
      true,
      {
        layout: 'info-display',
        cardStyle: 'elevated',
        colorScheme: 'auto',
        density: 'comfortable'
      },
      {
        apiId: 'ask', // general/ask
        endpoint: '',
        method: 'POST',
        parameters: {
          query: userInput
        }
      },
      {},
      '未找到精确匹配的工具，使用通用知识库回答'
    );

    return {
      globalStyle: {
        theme: 'light',
        accentColor: 'gray',
        pageLayout: 'vertical'
      },
      modules: [fallbackModule]
    };
  }
}
