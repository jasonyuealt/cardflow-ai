/**
 * 模块相关类型定义
 */

import { LayoutType, ModuleStyleConfig, StyleOptions } from './style';
import { ApiDefinition, ApiCallConfig } from './api';

// 模块基本信息
export class ModuleIdentity {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  usageScenarios: string;

  constructor(
    id: string,
    name: string,
    description: string,
    keywords: string[] = [],
    usageScenarios: string = ''
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.keywords = keywords;
    this.usageScenarios = usageScenarios;
  }
}

// 布局配置
export class LayoutConfig {
  layoutOptions: LayoutType[];
  defaultLayout: LayoutType;
  layoutDescriptions: Record<string, string>;

  constructor(
    layoutOptions: LayoutType[] = ['list-detail'],
    defaultLayout: LayoutType = 'list-detail',
    layoutDescriptions: Record<string, string> = {}
  ) {
    this.layoutOptions = layoutOptions;
    this.defaultLayout = defaultLayout;
    this.layoutDescriptions = layoutDescriptions;
  }
}

// 交互配置
export class InteractionConfig {
  onItemClick?: string;
  onBookClick?: string;
  onSubmit?: string;
  [key: string]: string | undefined;

  constructor(config: Record<string, string> = {}) {
    Object.assign(this, config);
  }
}

// 模块完整定义
export class ModuleDefinition {
  identity: ModuleIdentity;
  layoutConfig: LayoutConfig;
  styleOptions: StyleOptions;
  dataAdapter: string;
  apis: Record<string, string>;
  interactions: InteractionConfig;

  constructor(
    identity: ModuleIdentity,
    layoutConfig: LayoutConfig,
    styleOptions: StyleOptions,
    dataAdapter: string,
    apis: Record<string, string> = {},
    interactions: InteractionConfig = new InteractionConfig()
  ) {
    this.identity = identity;
    this.layoutConfig = layoutConfig;
    this.styleOptions = styleOptions;
    this.dataAdapter = dataAdapter;
    this.apis = apis;
    this.interactions = interactions;
  }
}

// 模块摘要（用于向量检索）
export class ModuleSummary {
  id: string;
  name: string;
  description: string;
  keywords: string[];

  constructor(id: string, name: string, description: string, keywords: string[] = []) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.keywords = keywords;
  }

  static fromModuleDefinition(module: ModuleDefinition): ModuleSummary {
    return new ModuleSummary(
      module.identity.id,
      module.identity.name,
      module.identity.description,
      module.identity.keywords
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

