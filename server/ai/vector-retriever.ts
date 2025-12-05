/**
 * 向量检索器 - 模拟实现
 * 使用简单的关键词相似度算法，无需真实向量数据库
 */

import { ModuleSummary } from '../../shared/types';

export class VectorRetriever {
  /**
   * 模拟向量检索 - 基于关键词相似度
   */
  search(query: string, modules: ModuleSummary[], topK: number = 5): ModuleSummary[] {
    console.log(`🔍 向量检索: "${query}"`);
    
    // 计算每个模块的相关度分数
    const scored = modules.map(module => ({
      module,
      score: this.calculateSimilarity(query, module),
    }));

    // 按分数排序
    scored.sort((a, b) => b.score - a.score);

    // 过滤掉分数为0的模块
    const filtered = scored.filter(item => item.score > 0);

    // 返回 top-K 个最相关的模块
    const results = filtered.slice(0, topK).map(item => item.module);
    
    console.log(`   找到 ${results.length} 个相关模块:`, results.map(m => m.id).join(', '));
    
    return results;
  }

  /**
   * 计算查询与模块的相似度（0-1）
   */
  private calculateSimilarity(query: string, module: ModuleSummary): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    // 1. 检查关键词匹配（最重要）
    for (const keyword of module.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 10; // 关键词匹配权重高
      }
    }

    // 2. 检查模块名称匹配
    if (queryLower.includes(module.name.toLowerCase())) {
      score += 5;
    }

    // 3. 检查描述中的词汇匹配
    const descWords = module.description.split(/[\s，。、]/);
    for (const word of descWords) {
      if (word.length > 1 && queryLower.includes(word.toLowerCase())) {
        score += 1;
      }
    }

    // 4. 语义关联规则（基于常识）
    score += this.getSemanticBonus(query, module.id);

    return score;
  }

  /**
   * 语义关联加分 - 模拟语义理解
   */
  private getSemanticBonus(query: string, moduleId: string): number {
    const queryLower = query.toLowerCase();

    // 定义模块间的语义关联
    const semanticRules: Record<string, { triggers: string[]; bonus: number }> = {
      // 航班
      flight: {
        triggers: ['机票', '航班', '飞机', '订票', '飞', '出差', '旅行', '去', 'fly', 'flight', 'travel'],
        bonus: 8,
      },
      // 购物
      shopping: {
        triggers: ['买', '购物', '特产', '装备', '商品', '带点', '价格', '多少钱', 'buy', 'shop', 'price', 'cost'],
        bonus: 7,
      },
      // 餐厅/美食
      yelp: {
        triggers: ['吃', '饿', '餐', '美食', '饭', '附近', 'cafe', 'bar', 'drink', 'eat', 'food', 'restaurant'],
        bonus: 8,
      },
      // 视频
      videos: {
        triggers: ['视频', '播放', '观看', '看', 'video', 'watch', 'play'],
        bonus: 7,
      },
      // 图片
      images: {
        triggers: ['图片', '照片', '图', '相片', 'image', 'photo', 'picture'],
        bonus: 7,
      },
      // 信息/百科/天气
      info_card: {
        triggers: ['搜索', '查询', '天气', '气温', '汇率', '新闻', '是谁', '什么', 'search', 'info', 'weather', 'news'],
        bonus: 6,
      },
      // 聊天
      line_general_agent: {
        triggers: ['聊天', '消息', '询问', 'Line', 'WhatsApp', '问一下', '联系', 'chat', 'message', 'ask'],
        bonus: 8,
      },
      // 应用控制
      general_agent: {
        triggers: ['邮件', '日历', '地图', 'Gmail', 'Calendar', 'Maps', 'google', '发邮件', 'email'],
        bonus: 7,
      },
      // 工作流
      orchestration_agent: {
        triggers: ['编排', '工作流', '多步骤', '安排', '计划', 'workflow', 'arrange', 'plan'],
        bonus: 6,
      },
      // 会面地图
      meeting_view: {
        triggers: ['地图', '位置', '会面', '约会', '见面', '哪里见', 'meet', 'date', 'location'],
        bonus: 8,
      }
    };

    const rule = semanticRules[moduleId];
    if (!rule) return 0;

    for (const trigger of rule.triggers) {
      if (queryLower.includes(trigger)) {
        return rule.bonus;
      }
    }

    return 0;
  }
}
