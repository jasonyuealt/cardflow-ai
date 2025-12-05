/**
 * AI 路由 - 生成执行计划
 */

import { Router, Request, Response } from 'express';
import {
  GeneratePlanRequest,
  GeneratePlanResponse,
  ExecuteInteractionRequest,
  ExecuteInteractionResponse,
} from '../../shared/types';
import { AIExecutor } from '../ai/executor';
import { ModuleLoader } from '../modules/loader';
import { PlanExecutor } from '../orchestrator/plan-executor';

const router = Router();
const aiExecutor = new AIExecutor();
const moduleLoader = new ModuleLoader();
const planExecutor = new PlanExecutor();

/**
 * POST /api/ai/generate-plan
 * 生成执行计划并返回渲染数据
 */
router.post('/generate-plan', async (req: Request, res: Response) => {
  try {
    const request = req.body as GeneratePlanRequest;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 收到生成计划请求');
    console.log('   用户输入:', request.userInput);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. 加载所有可用模块摘要
    const availableModules = moduleLoader.loadAllModuleSummaries();
    console.log(`📦 加载了 ${availableModules.length} 个可用模块`);

    // 2. AI 生成执行计划
    const executionPlan = await aiExecutor.generateExecutionPlan(
      request.userInput,
      availableModules
    );

    // 3. 执行计划，获取数据
    const moduleInstances = await planExecutor.execute(executionPlan);

    // 4. 返回完整的渲染数据
    const response: any = {
      success: true,
      globalStyle: executionPlan.globalStyle,
      modules: moduleInstances,
    };

    console.log('\n✓ 生成计划成功');
    console.log(`   返回 ${moduleInstances.length} 个模块实例`);
    console.log('   模块详情:');
    moduleInstances.forEach(m => {
      console.log(`     - ${m.moduleId} (layout: ${m.style.layout}, data: ${m.data ? Object.keys(m.data).length : 0})`);
    });
    console.log();

    res.json(response);
  } catch (error: any) {
    console.error('\n✗ 生成计划失败:', error.message, '\n');
    res.status(500).json(GeneratePlanResponse.error(error.message));
  }
});

/**
 * POST /api/ai/execute-interaction
 * 执行用户交互（点击、提交等）
 */
router.post('/execute-interaction', async (req: Request, res: Response) => {
  try {
    const request = req.body as ExecuteInteractionRequest;

    console.log(`\n🖱️  执行交互: ${request.instanceId} - ${request.action}`);

    const result = await planExecutor.executeInteraction(
      request.instanceId,
      request.action,
      request.context
    );

    res.json(ExecuteInteractionResponse.success(result));
  } catch (error: any) {
    console.error('✗ 交互执行失败:', error.message);
    res.status(500).json(ExecuteInteractionResponse.error(error.message));
  }
});

/**
 * GET /api/ai/test
 * 测试 AI 连接
 */
router.get('/test', async (req: Request, res: Response) => {
  try {
    const connected = await aiExecutor.testConnection();
    res.json({ success: connected, message: connected ? 'AI 连接正常' : 'AI 连接失败' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

