/**
 * 模块渲染器 - 直接渲染模块内容（无容器包装）
 */

import React from 'react';
import { ModuleInstance } from '../../shared/types';
import { LayoutRenderer } from '../layouts/LayoutRenderer';

interface ModuleRendererProps {
  module: ModuleInstance;
}

export const ModuleRenderer: React.FC<ModuleRendererProps> = ({ module }) => {
  return <LayoutRenderer module={module} />;
};

