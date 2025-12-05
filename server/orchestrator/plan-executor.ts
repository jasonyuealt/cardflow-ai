/**
 * 执行计划执行器
 */

import { ExecutionPlan, ModuleInstance, GeneratePlanResponse } from '../../shared/types';
import { APIExecutor } from './api-executor';
import { ModuleLoader } from '../modules/loader';

export class PlanExecutor {
  private apiExecutor: APIExecutor;
  private moduleLoader: ModuleLoader;

  constructor() {
    this.apiExecutor = new APIExecutor();
    this.moduleLoader = new ModuleLoader();
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

    // 并行执行所有模块的初始 API
    for (const moduleConfig of plan.modules) {
      try {
        // 加载模块定义
        const moduleDef = moduleDefinitions.get(moduleConfig.moduleId);
        if (!moduleDef) {
          console.error(`模块定义未找到: ${moduleConfig.moduleId}`);
          continue;
        }

        // 执行初始 API
        console.log(`   加载模块: ${moduleConfig.moduleId}`);
        const apiResponse = await this.apiExecutor.execute(moduleConfig.initialApi);

        if (!apiResponse.success) {
          console.error(`   API 执行失败: ${moduleConfig.initialApi.apiId}`);
          continue;
        }

        // 创建模块实例
        const instance = new ModuleInstance(
          moduleConfig.instanceId,
          moduleConfig.moduleId,
          moduleConfig.priority,
          moduleConfig.defaultExpanded,
          moduleConfig.style,
          apiResponse.data, // 初始数据
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

    // 这里需要从某个地方获取模块实例的交互 API 配置
    // 简化实现：直接构造 API 调用
    // 实际应该从缓存或状态中获取

    return { success: true, message: '交互执行成功（简化实现）' };
  }
}

