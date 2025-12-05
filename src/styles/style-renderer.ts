/**
 * 样式渲染器
 */

import { ModuleStyleConfig } from '../../shared/types';
import {
  DENSITY_CLASSES,
  CARD_STYLE_CLASSES,
  COLOR_SCHEME_CLASSES,
} from '../../shared/constants';

/**
 * 根据样式配置生成 CSS 类名
 */
export function getStyleClasses(style: ModuleStyleConfig): string {
  const densityClass = DENSITY_CLASSES[style.density] || DENSITY_CLASSES.comfortable;
  const cardStyleClass = CARD_STYLE_CLASSES[style.cardStyle] || CARD_STYLE_CLASSES.elevated;
  const colorClass = COLOR_SCHEME_CLASSES[style.colorScheme] || COLOR_SCHEME_CLASSES.auto;

  return `${densityClass} ${cardStyleClass} ${colorClass}`;
}

/**
 * 获取卡片基础样式
 */
export function getCardBaseClasses(): string {
  return 'bg-white rounded-lg overflow-hidden transition-all duration-300';
}

/**
 * 获取卡片容器样式
 */
export function getCardContainerClasses(expanded: boolean): string {
  return expanded ? 'mb-4' : 'mb-2';
}

