/**
 * 模块状态管理
 */

import { create } from 'zustand';
import { ModuleInstance, GlobalStyleConfig } from '../../shared/types';
import { generatePlan } from '../utils/api-client';

interface ModulesState {
  // 状态
  globalStyle: GlobalStyleConfig | null;
  modules: ModuleInstance[];
  loading: boolean;
  error: string | null;

  // 操作
  loadModules: (userInput: string) => Promise<void>;
  toggleModule: (instanceId: string) => void;
  updateModuleData: (instanceId: string, data: any) => void;
  reset: () => void;
}

export const useModulesStore = create<ModulesState>((set, get) => ({
  // 初始状态
  globalStyle: null,
  modules: [],
  loading: false,
  error: null,

  // 加载模块
  loadModules: async (userInput: string) => {
    set({ loading: true, error: null });

    try {
      const response = await generatePlan(userInput);

      if (response.success) {
        set({
          globalStyle: response.globalStyle,
          modules: response.modules,
          loading: false,
          error: null,
        });
      } else {
        set({
          loading: false,
          error: response.error || '生成计划失败',
        });
      }
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || '网络请求失败',
      });
    }
  },

  // 切换模块展开/折叠
  toggleModule: (instanceId: string) => {
    set((state) => ({
      modules: state.modules.map((module) =>
        module.instanceId === instanceId
          ? { ...module, expanded: !module.expanded }
          : module
      ),
    }));
  },

  // 更新模块数据
  updateModuleData: (instanceId: string, data: any) => {
    set((state) => ({
      modules: state.modules.map((module) =>
        module.instanceId === instanceId
          ? { ...module, data, loading: false }
          : module
      ),
    }));
  },

  // 重置
  reset: () => {
    set({
      globalStyle: null,
      modules: [],
      loading: false,
      error: null,
    });
  },
}));

