/**
 * 布局相关常量
 */

import { LayoutType } from '../types/style';

export const LAYOUT_NAMES: Record<LayoutType, string> = {
  'horizontal-scrollable-list': '横向滑动列表',
  'info-display': '信息展示卡片',
  'interactive-action': '交互操作卡片',
  'map-view-horizontal': '横向滑动地图',
};

export const LAYOUT_DESCRIPTIONS: Record<LayoutType, string> = {
  'horizontal-scrollable-list': '多个选项横向排列，当前项完整展示，待看项简略展示，适用于航班、商品、餐厅、视频、图片等列表',
  'info-display': '信息片段横向滑动展示，适用于新闻、搜索结果、实时数据等',
  'interactive-action': '操作选项或对话横向滑动，适用于聊天、应用控制、工作流程等',
  'map-view-horizontal': '地图和地点信息横向滑动展示，适用于会面地点选择等',
};

// 横向滑动布局的宽度配置
export const HORIZONTAL_LAYOUT_CONFIG = {
  currentItemWidthPercent: 70,  // 当前项占屏幕宽度的70%
  previewItemWidthPercent: 30,  // 待看项占屏幕宽度的30%
};


