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

    // 返回 top-K 个最相关的模块
    const results = scored.slice(0, topK).map(item => item.module);
    
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
      // 机票相关
      flight_search: {
        triggers: ['机票', '航班', '飞机', '订票', '飞', '出差', '旅行', '去'],
        bonus: 8,
      },
      // 酒店
      hotel_search: {
        triggers: ['机票', '航班', '飞机', '旅行', '出差', '去', '酒店', '住宿', '订房'],
        bonus: queryLower.match(/机票|航班|飞机/) ? 3 : 8,
      },
      // 天气
      weather_info: {
        triggers: ['机票', '航班', '去', '旅行', '天气', '气温', '出门', '玩'],
        bonus: queryLower.match(/机票|航班/) ? 2 : 8,
      },
      // 景点
      attraction_guide: {
        triggers: ['玩', '逛', '旅行', '去', '景点', '攻略', '行程'],
        bonus: queryLower.match(/机票|酒店/) ? 4 : 8,
      },
      // 打车
      ride_hailing: {
        triggers: ['去', '怎么走', '打车', '接机', '送机', '路线', '交通'],
        bonus: 5,
      },
      // 美食
      restaurant_finder: {
        triggers: ['吃', '饿', '餐', '美食', '饭', '附近'],
        bonus: 6,
      },
      // 汇率
      currency_converter: {
        triggers: ['美元', '欧元', '日元', '汇率', '换算', '钱', '出国'],
        bonus: 7,
      },
      // 活动
      event_ticket: {
        triggers: ['周末', '活动', '展览', '演出', '票', '玩'],
        bonus: 5,
      },
      // 行程
      schedule: {
        triggers: ['行程', '日程', '安排', '计划', 'timeline', 'day1'],
        bonus: 9,
      },
      // 购物
      shopping: {
        triggers: ['买', '购物', '特产', '装备', '商品', '带点'],
        bonus: 7,
      },
      // 地图
      map_view: {
        triggers: ['地图', '位置', '在哪里', '分布', '导航', '定位'],
        bonus: 6,
      },
      // 灵感
      idea_guide: {
        triggers: ['攻略', '灵感', '推荐', '去哪玩', '什么好玩', '指南'],
        bonus: 6,
      },
      // 分享
      share_card: {
        triggers: ['分享', '发给', '转发', '告诉', '截图'],
        bonus: 8,
      },
      // 网页
      web_widget: {
        triggers: ['官网', '打开', '链接', '查看'],
        bonus: 5,
      },
      // 完成
      completion: {
        triggers: ['完成', '搞定', '预订成功', '支付成功'],
        bonus: 10,
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

  /**
   * 检查是否应该推荐相关模块
   */
  shouldRecommendRelated(query: string): boolean {
    const queryLower = query.toLowerCase();
    
    // 如果用户明确只要一个东西，不推荐
    if (/只|仅|单独|只要/.test(queryLower)) {
      return false;
    }

    // 如果是旅行相关，推荐关联模块
    if (/机票|航班|飞机|去.*旅行|出差/.test(queryLower)) {
      return true;
    }

    return false;
  }

  /**
   * 获取相关模块（根据主模块推荐）
   */
  getRelatedModules(primaryModuleId: string, allModules: ModuleSummary[]): ModuleSummary[] {
    const relatedMap: Record<string, string[]> = {
      flight_search: ['hotel_search', 'attraction_guide', 'ride_hailing', 'weather_info', 'currency_converter'],
      hotel_search: ['attraction_guide', 'restaurant_finder', 'ride_hailing', 'weather_info'],
      attraction_guide: ['restaurant_finder', 'ride_hailing', 'hotel_search', 'map_view', 'idea_guide'],
      event_ticket: ['restaurant_finder', 'ride_hailing', 'share_card'],
      restaurant_finder: ['ride_hailing', 'event_ticket', 'map_view'],
      weather_info: [],
      ride_hailing: ['map_view'],
      currency_converter: [],
      schedule: ['map_view', 'share_card', 'weather_info'],
      shopping: ['currency_converter'],
      idea_guide: ['flight_search', 'hotel_search', 'attraction_guide'],
      map_view: ['ride_hailing'],
      completion: ['share_card', 'schedule'],
      share_card: [],
      web_widget: []
    };

    const relatedIds = relatedMap[primaryModuleId] || [];
    return allModules.filter(m => relatedIds.includes(m.id));
  }
}

