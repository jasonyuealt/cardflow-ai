/**
 * 模块相关类型定义
 */

import { LayoutType, ModuleStyleConfig } from './style';
import { ApiDefinition, ApiCallConfig } from './api';

// 模块基本信息
export class ModuleIdentity {
  id: string;
  name: string;
  description: string;
  keywords: string[];

  constructor(
    id: string,
    name: string,
    description: string,
    keywords: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.keywords = keywords;
  }
}

// 模块完整定义
export class ModuleDefinition {
  identity: ModuleIdentity;
  recommendedLayout: LayoutType;
  apis: Record<string, ApiDefinition>;

  constructor(
    identity: ModuleIdentity,
    recommendedLayout: LayoutType,
    apis: Record<string, ApiDefinition> = {}
  ) {
    this.identity = identity;
    this.recommendedLayout = recommendedLayout;
    this.apis = apis;
  }
}

// 模块摘要（用于向量检索）
export class ModuleSummary {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  recommendedLayout: LayoutType;

  apis?: Record<string, ApiDefinition>;

  constructor(id: string, name: string, description: string, keywords: string[] = [], recommendedLayout: LayoutType, apis?: Record<string, ApiDefinition>) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.keywords = keywords;
    this.recommendedLayout = recommendedLayout;
    this.apis = apis;
  }

  static fromModuleDefinition(module: ModuleDefinition): ModuleSummary {
    return new ModuleSummary(
      module.identity.id,
      module.identity.name,
      module.identity.description,
      module.identity.keywords,
      module.recommendedLayout,
      module.apis
    );
  }
}

// 模块实例（渲染时的具体实例）
export class ModuleInstance {
  instanceId: string;
  moduleId: string;
  priority: number;
  defaultExpanded: boolean;
  style: ModuleStyleConfig;
  data: any;
  moduleConfig: ModuleDefinition;
  interactionApis: Record<string, ApiCallConfig>;
  expanded?: boolean;
  loading?: boolean;
  error?: string;
  reason?: string; // AI 推荐该模块的原因

  constructor(
    instanceId: string,
    moduleId: string,
    priority: number,
    defaultExpanded: boolean,
    style: ModuleStyleConfig,
    data: any,
    moduleConfig: ModuleDefinition,
    interactionApis: Record<string, ApiCallConfig> = {},
    expanded?: boolean,
    loading?: boolean,
    error?: string,
    reason?: string
  ) {
    this.instanceId = instanceId;
    this.moduleId = moduleId;
    this.priority = priority;
    this.defaultExpanded = defaultExpanded;
    this.style = style;
    this.data = data;
    this.moduleConfig = moduleConfig;
    this.interactionApis = interactionApis;
    this.expanded = expanded ?? defaultExpanded;
    this.loading = loading ?? false;
    this.error = error;
    this.reason = reason;
  }
}
