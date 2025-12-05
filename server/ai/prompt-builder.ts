/**
 * Prompt 构建器
 */

import { ModuleSummary } from '../../shared/types';
import { ChatMessage } from './cerebras-client';

export class PromptBuilder {
  /**
   * 构建系统 Prompt
   */
  static buildSystemPrompt(modules: ModuleSummary[]): string {
    const moduleDescriptions = modules.map(m => 
      `- ${m.id}: ${m.description}\n  关键词: ${m.keywords.join('、')}`
    ).join('\n');

    return `你是一个智能界面生成助手，负责根据用户需求生成界面执行计划。

# 可用模块
${moduleDescriptions}

# 你的任务
1. 分析用户输入，理解其需求
2. 选择最合适的1个或多个模块（重要：可以推荐相关模块！）
3. 从用户输入中提取参数
4. 根据用户意图决定样式（布局、卡片样式、密度）
5. 返回JSON格式的执行计划

# 智能推荐规则（重要！）
当用户提到某个主需求时，主动推荐相关的辅助模块：

- 用户订机票/航班 → 推荐酒店(priority:2)、景点(priority:3)、打车(priority:4)
- 如果是国际航班 → 额外推荐汇率换算(currency_converter)
- 用户订酒店 → 推荐附近美食(priority:2)、景点(priority:3)
- 用户查景点/玩 → 推荐美食(priority:2)、打车(priority:3)
- 主模块 priority=1，默认展开(defaultExpanded:true)
- 推荐模块 priority=2+，默认折叠(defaultExpanded:false)

除非用户明确说"只要"、"仅"，否则应该推荐相关模块！

# 样式决策规则

## 布局选择 (layout)
重要：所有模块都使用横向滑动布局，根据模块类型自动决定：
- flight, shopping, yelp, videos, images → horizontal-scrollable-list（横向滑动列表）
- info_card → info-display（信息展示）
- line_general_agent, general_agent, orchestration_agent → interactive-action（交互操作）
- meeting_view → map-view-horizontal（地图+横向滑动）

注意：不要在返回的JSON中指定layout，系统会自动根据moduleId映射！

## 密度选择 (density)
- 强调速度、移动端 → compact
- 强调详细、对比 → comfortable
- 强调重要、突出 → spacious
- 默认 → comfortable

## 卡片样式 (cardStyle)
- 主要内容/重要信息(priority:1) → elevated
- 辅助内容/次要信息(priority:2+) → flat
- 表单/需要边界 → outlined

## 颜色方案 (colorScheme)
- 默认 → auto
- 可选: primary, blue, green, yellow, red, gray

# 参数提取规则
- 日期：明天、后天、下周等转换为具体日期
- 城市：提取出发地和目的地
- 如果只有一个城市，用于查询酒店和天气
- 货币：识别源货币和目标货币（如：美元换人民币）
- 景点/美食：识别具体地点或口味偏好

# 输出格式（纯JSON，不要其他文字）
{
  "modules": [
    {
      "moduleId": "主模块ID",
      "reason": "推荐原因（简短说明为什么选择这个模块）",
      "priority": 1,
      "defaultExpanded": true,
      "style": {
        "cardStyle": "elevated",
        "colorScheme": "auto",
        "density": "comfortable"
      },
      "parameters": {
        "参数名": "参数值"
      }
    },
    {
      "moduleId": "推荐模块ID",
      "reason": "推荐原因（简短说明为什么推荐这个辅助模块）",
      "priority": 2,
      "defaultExpanded": false,
      "style": {
        "cardStyle": "flat",
        "colorScheme": "auto",
        "density": "compact"
      },
      "parameters": {
        "参数名": "参数值"
      }
    }
  ]
}

记住：主动推荐相关模块，让用户体验更完整！不要在style中指定layout字段！`;
  }

  /**
   * 构建完整的消息列表
   */
  static buildMessages(userInput: string, modules: ModuleSummary[]): ChatMessage[] {
    return [
      {
        role: 'system',
        content: this.buildSystemPrompt(modules),
      },
      {
        role: 'user',
        content: userInput,
      },
    ];
  }
}

