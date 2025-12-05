/**
 * 样式相关常量
 */

import { CardStyleType, DensityType, ColorSchemeType } from '../types/style';

export const CARD_STYLE_NAMES: Record<CardStyleType, string> = {
  elevated: '浮起',
  flat: '扁平',
  outlined: '边框',
};

export const DENSITY_NAMES: Record<DensityType, string> = {
  comfortable: '舒适',
  compact: '紧凑',
  spacious: '宽松',
};

export const COLOR_SCHEME_NAMES: Record<ColorSchemeType, string> = {
  auto: '自动',
  primary: '主色',
  blue: '蓝色',
  green: '绿色',
  yellow: '黄色',
  red: '红色',
  gray: '灰色',
};

// 密度对应的 Tailwind 类名
export const DENSITY_CLASSES: Record<DensityType, string> = {
  comfortable: 'space-y-4 p-4',
  compact: 'space-y-2 p-2',
  spacious: 'space-y-6 p-6',
};

// 卡片样式对应的 Tailwind 类名
export const CARD_STYLE_CLASSES: Record<CardStyleType, string> = {
  elevated: 'shadow-lg hover:shadow-xl transition-shadow',
  flat: 'shadow-none bg-gray-50',
  outlined: 'shadow-none border-2 border-gray-200',
};

// 颜色方案对应的 Tailwind 类名
export const COLOR_SCHEME_CLASSES: Record<ColorSchemeType, string> = {
  auto: 'border-gray-300',
  primary: 'border-blue-500',
  blue: 'border-blue-500',
  green: 'border-green-500',
  yellow: 'border-yellow-500',
  red: 'border-red-500',
  gray: 'border-gray-500',
};

