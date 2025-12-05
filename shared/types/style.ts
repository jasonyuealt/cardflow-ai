/**
 * 样式相关类型定义
 */

// 布局类型 - 横向滑动布局
export type LayoutType =
  | 'horizontal-scrollable-list'  // 横向滑动列表（Flight, Shopping, Yelp, Videos, Images）
  | 'info-display'                // 信息展示卡片（InfoCard）
  | 'interactive-action'          // 交互操作卡片（LineGeneralAgent, GeneralAgent, OrchestrationAgent）
  | 'map-view-horizontal';        // 横向滑动地图视图（MeetingView）

// 卡片样式类型
export type CardStyleType =
  | 'elevated'   // 浮起效果
  | 'flat'       // 扁平样式
  | 'outlined';  // 边框样式

// 主题类型
export type ThemeType = 'light' | 'dark' | 'auto';

// 主题色方案
export type ColorSchemeType =
  | 'auto'      // 自动
  | 'primary'   // 主色
  | 'blue'      // 蓝色
  | 'green'     // 绿色
  | 'yellow'    // 黄色
  | 'red'       // 红色
  | 'gray';     // 灰色

// 内容密度
export type DensityType =
  | 'comfortable'  // 舒适
  | 'compact'      // 紧凑
  | 'spacious';    // 宽松

// 模块样式配置
export class ModuleStyleConfig {
  layout: LayoutType;
  cardStyle: CardStyleType;
  colorScheme: ColorSchemeType;
  density: DensityType;

  constructor(
    layout: LayoutType = 'list-detail',
    cardStyle: CardStyleType = 'elevated',
    colorScheme: ColorSchemeType = 'auto',
    density: DensityType = 'comfortable'
  ) {
    this.layout = layout;
    this.cardStyle = cardStyle;
    this.colorScheme = colorScheme;
    this.density = density;
  }
}

// 全局样式配置
export class GlobalStyleConfig {
  theme: ThemeType;
  accentColor: string;
  pageLayout: 'vertical' | 'horizontal';

  constructor(
    theme: ThemeType = 'light',
    accentColor: string = 'blue',
    pageLayout: 'vertical' | 'horizontal' = 'vertical'
  ) {
    this.theme = theme;
    this.accentColor = accentColor;
    this.pageLayout = pageLayout;
  }
}

// 样式选项（模块声明支持的样式选项）
export class StyleOptions {
  cardStyle: CardStyleType[];
  colorScheme: ColorSchemeType[];
  density: DensityType[];

  constructor(
    cardStyle: CardStyleType[] = ['elevated', 'flat', 'outlined'],
    colorScheme: ColorSchemeType[] = ['auto', 'primary', 'blue'],
    density: DensityType[] = ['comfortable', 'compact', 'spacious']
  ) {
    this.cardStyle = cardStyle;
    this.colorScheme = colorScheme;
    this.density = density;
  }
}

