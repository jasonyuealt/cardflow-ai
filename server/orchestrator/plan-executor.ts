/**
 * 执行计划执行器
 */

import { ExecutionPlan, ModuleInstance } from '../../shared/types';
import { APIExecutor } from './api-executor';
import { ModuleLoader } from '../modules/loader';
import { AIExecutor } from '../ai/executor';

export class PlanExecutor {
  private apiExecutor: APIExecutor;
  private moduleLoader: ModuleLoader;
  private aiExecutor: AIExecutor;

  constructor() {
    this.apiExecutor = new APIExecutor();
    this.moduleLoader = new ModuleLoader();
    this.aiExecutor = new AIExecutor();
  }

  /**
   * 执行计划，返回带数据的模块实例列表
   */
  async execute(plan: ExecutionPlan): Promise<ModuleInstance[]> {
    console.log('🔄 执行计划中...');
    console.log(`   模块数量: ${plan.modules.length}`);

    const instances: ModuleInstance[] = [];

    // 加载所有模块的详细定义
    const moduleIds = plan.modules.map(m => m.moduleId);
    const moduleDefinitions = this.moduleLoader.loadModuleDefinitions(moduleIds);

    // 串行执行所有模块（为了更好的日志和流程控制，虽然并行更快）
    for (const moduleConfig of plan.modules) {
      try {
        // 加载模块定义
        const moduleDef = moduleDefinitions.get(moduleConfig.moduleId);
        if (!moduleDef) {
          console.error(`模块定义未找到: ${moduleConfig.moduleId}`);
          continue;
        }

        // 1. 执行初始 API 获取 Raw Data
        console.log(`   加载模块: ${moduleConfig.moduleId}`);
        console.log(`   调用 API: ${moduleConfig.initialApi.apiId}`);
        
        const apiResponse = await this.apiExecutor.execute(moduleConfig.initialApi);

        if (!apiResponse.success) {
          console.error(`   API 执行失败: ${moduleConfig.initialApi.apiId}`);
          continue;
        }

        const rawData = apiResponse.data;
        console.log(`   Raw Data 获取成功，记录数: ${Array.isArray(rawData) ? rawData.length : 'Object'}`);

        // 2. 调用 Mapper AI 转换数据
        const targetLayout = moduleConfig.style.layout;
        console.log(`   调用 Mapper AI 转换数据 (Target: ${targetLayout})...`);
        
        const uiData = await this.aiExecutor.mapToUI(rawData, targetLayout);
        console.log(`   UI Data 转换成功`);

        // 创建模块实例
        const instance = new ModuleInstance(
          moduleConfig.instanceId,
          moduleConfig.moduleId,
          moduleConfig.priority,
          moduleConfig.defaultExpanded,
          moduleConfig.style,
          uiData, // 使用转换后的数据
          moduleDef,
          moduleConfig.interactionApis,
          moduleConfig.defaultExpanded,
          false,
          undefined,
          moduleConfig.reason // 传递 reason
        );

        instances.push(instance);
      } catch (error: any) {
        console.error(`模块执行失败: ${moduleConfig.moduleId}`, error.message);
      }
    }

    console.log(`✓ 执行计划完成，成功加载 ${instances.length} 个模块`);

    // 按优先级排序
    instances.sort((a, b) => a.priority - b.priority);

    return instances;
  }

  /**
   * 执行交互（用户点击等操作）
   */
  async executeInteraction(
    instanceId: string,
    action: string,
    context: Record<string, any>
  ): Promise<any> {
    console.log(`🖱️  执行交互: ${instanceId} - ${action}`);

    // 这里的实现也应该经过 Mapper，但暂时保持简单
    return { success: true, message: '交互执行成功（简化实现）' };
  }
}
