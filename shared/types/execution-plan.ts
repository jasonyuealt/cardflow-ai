/**
 * 执行计划类型定义
 */

import { GlobalStyleConfig, ModuleStyleConfig } from './style';
import { ApiCallConfig } from './api';

// 执行计划中的模块配置
export class ExecutionModuleConfig {
  instanceId: string;
  moduleId: string;
  priority: number;
  defaultExpanded: boolean;
  style: ModuleStyleConfig;
  initialApi: ApiCallConfig;
  interactionApis: Record<string, ApiCallConfig>;
  reason?: string;

  constructor(
    instanceId: string,
    moduleId: string,
    priority: number,
    defaultExpanded: boolean,
    style: ModuleStyleConfig,
    initialApi: ApiCallConfig,
    interactionApis: Record<string, ApiCallConfig> = {},
    reason?: string
  ) {
    this.instanceId = instanceId;
    this.moduleId = moduleId;
    this.priority = priority;
    this.defaultExpanded = defaultExpanded;
    this.style = style;
    this.initialApi = initialApi;
    this.interactionApis = interactionApis;
    this.reason = reason;
  }
}

// 完整执行计划
export class ExecutionPlan {
  globalStyle: GlobalStyleConfig;
  modules: ExecutionModuleConfig[];

  constructor(globalStyle: GlobalStyleConfig, modules: ExecutionModuleConfig[] = []) {
    this.globalStyle = globalStyle;
    this.modules = modules;
  }
}

// 用户请求上下文
export class RequestContext {
  deviceType?: 'desktop' | 'mobile';
  previousModules?: string[];
  userPreferences?: Record<string, any>;
  userId?: string;

  constructor(
    deviceType?: 'desktop' | 'mobile',
    previousModules?: string[],
    userPreferences?: Record<string, any>,
    userId?: string
  ) {
    this.deviceType = deviceType;
    this.previousModules = previousModules;
    this.userPreferences = userPreferences;
    this.userId = userId;
  }
}

// AI 生成计划请求
export class GeneratePlanRequest {
  userInput: string;
  context?: RequestContext;

  constructor(userInput: string, context?: RequestContext) {
    this.userInput = userInput;
    this.context = context;
  }
}

// AI 生成计划响应
export class GeneratePlanResponse {
  success: boolean;
  executionPlan?: ExecutionPlan;
  error?: string;

  constructor(success: boolean, executionPlan?: ExecutionPlan, error?: string) {
    this.success = success;
    this.executionPlan = executionPlan;
    this.error = error;
  }

  static success(executionPlan: ExecutionPlan): GeneratePlanResponse {
    return new GeneratePlanResponse(true, executionPlan);
  }

  static error(error: string): GeneratePlanResponse {
    return new GeneratePlanResponse(false, undefined, error);
  }
}

// 执行交互请求
export class ExecuteInteractionRequest {
  instanceId: string;
  action: string;
  context: Record<string, any>;

  constructor(instanceId: string, action: string, context: Record<string, any> = {}) {
    this.instanceId = instanceId;
    this.action = action;
    this.context = context;
  }
}

// 执行交互响应
export class ExecuteInteractionResponse {
  success: boolean;
  data?: any;
  error?: string;

  constructor(success: boolean, data?: any, error?: string) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static success(data: any): ExecuteInteractionResponse {
    return new ExecuteInteractionResponse(true, data);
  }

  static error(error: string): ExecuteInteractionResponse {
    return new ExecuteInteractionResponse(false, undefined, error);
  }
}

