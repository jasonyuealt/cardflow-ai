/**
 * 模块加载器
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ModuleSummary, ModuleDefinition, ModuleIdentity } from '../../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ModuleLoader {
  private registryPath: string;
  private modulesCache: Map<string, ModuleDefinition>;

  constructor() {
    this.registryPath = path.join(__dirname, 'registry');
    this.modulesCache = new Map();
  }

  /**
   * 加载所有模块摘要
   */
  loadAllModuleSummaries(): ModuleSummary[] {
    try {
      const summariesPath = path.join(this.registryPath, 'all-modules.json');
      const content = fs.readFileSync(summariesPath, 'utf-8');
      const data = JSON.parse(content);
      
      const modules = data.modules || data;
      
      return modules.map((s: any) => new ModuleSummary(
        s.id, 
        s.name, 
        s.description, 
        s.keywords,
        s.recommendedLayout,
        undefined // 初始化时没有 APIs 详情
      ));
    } catch (error: any) {
      console.error('加载模块摘要失败:', error.message);
      return [];
    }
  }

  /**
   * 加载指定模块的详细定义
   */
  loadModuleDefinition(moduleId: string): ModuleDefinition | null {
    // 检查缓存
    if (this.modulesCache.has(moduleId)) {
      return this.modulesCache.get(moduleId)!;
    }

    try {
      const modulePath = path.join(this.registryPath, `${moduleId}.json`);
      const content = fs.readFileSync(modulePath, 'utf-8');
      const json = JSON.parse(content);

      // 构建 ModuleDefinition 实例
      // 注意：我们的 JSON 文件结构可能与类的构造函数不完全一一对应，这里手动映射
      const identity = new ModuleIdentity(
        json.id,
        json.name,
        json.description,
        json.keywords
      );

      // APIs 的处理，目前保持原样，或者转换 ApiDefinition
      // 假设 apis 是 Record<string, ApiDefinition>
      const module = new ModuleDefinition(
        identity,
        json.recommendedLayout,
        json.apis
      );

      // 缓存
      this.modulesCache.set(moduleId, module);

      return module;
    } catch (error: any) {
      console.error(`加载模块 ${moduleId} 失败:`, error.message);
      return null;
    }
  }

  /**
   * 批量加载模块定义
   */
  loadModuleDefinitions(moduleIds: string[]): Map<string, ModuleDefinition> {
    const modules = new Map<string, ModuleDefinition>();

    for (const moduleId of moduleIds) {
      const module = this.loadModuleDefinition(moduleId);
      if (module) {
        modules.set(moduleId, module);
      }
    }

    return modules;
  }
}
