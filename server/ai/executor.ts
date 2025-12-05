/**
 * AI 执行器 - 总调度
 */

import { ExecutionPlan, ModuleSummary } from '../../shared/types';
import { CerebrasClient, ChatMessage } from './cerebras-client';
import { PromptBuilder } from './prompt-builder';
import { VectorRetriever } from './vector-retriever';

export class AIExecutor {
  private cerebrasClient: CerebrasClient;
  private vectorRetriever: VectorRetriever;

  constructor() {
    this.cerebrasClient = new CerebrasClient();
    this.vectorRetriever = new VectorRetriever();
  }

  /**
   * 生成执行计划
   */
  async generateExecutionPlan(
    userInput: string,
    availableModules: ModuleSummary[]
  ): Promise<ExecutionPlan> {
    return await this.generateWithRealAI(userInput, availableModules);
  }

  /**
   * 使用真实 AI 生成执行计划
   */
  private async generateWithRealAI(
    userInput: string,
    availableModules: ModuleSummary[]
  ): Promise<ExecutionPlan> {
    try {
      console.log('🤖 使用真实 Cerebras AI 生成执行计划...');

      // 步骤1：向量检索最相关的模块
      const relevantModules = this.vectorRetriever.search(userInput, availableModules, 10);
      console.log(`   向量检索返回 ${relevantModules.length} 个候选模块`);

      // 步骤2：构建 Prompt（只发送相关模块给 AI，节省 token）
      const messages: ChatMessage[] = PromptBuilder.buildMessages(userInput, relevantModules);

      // 步骤3：调用 Cerebras AI
      const response = await this.cerebrasClient.chatCompletion(messages);

      // 步骤4：解析 AI 响应
      const plan = this.parseAIResponse(response);

      console.log('✓ 执行计划生成完成');
      console.log(`   AI 选择了 ${plan.modules.length} 个模块`);
      
      return plan;
    } catch (error: any) {
      console.error('✗ 真实 AI 调用失败:', error.message);
      console.error('   错误详情:', error.stack);
      throw error;
    }
  }

  /**
   * 解析 AI 响应
   */
  private parseAIResponse(response: string): ExecutionPlan {
    try {
      console.log('📝 解析 AI 响应...');
      console.log('   原始响应长度:', response.length);

      // 提取 JSON（AI 可能返回带解释的内容）
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('   AI 响应内容:', response.substring(0, 500));
        throw new Error('AI 响应中未找到 JSON 格式');
      }

      const jsonStr = jsonMatch[0];
      console.log('   提取的 JSON 长度:', jsonStr.length);

      const parsed = JSON.parse(jsonStr);

      // 验证必需字段
      if (!parsed.modules || !Array.isArray(parsed.modules)) {
        throw new Error('AI 响应缺少 modules 字段');
      }

      console.log('   解析成功，模块数量:', parsed.modules.length);

      // 转换为标准格式
      const plan: ExecutionPlan = {
        globalStyle: parsed.globalStyle || {
          theme: 'light',
          accentColor: 'blue',
          pageLayout: 'vertical',
        },
        modules: parsed.modules.map((m: any, index: number) => ({
          instanceId: `${m.moduleId}-${Date.now()}-${index}`,
          moduleId: m.moduleId,
          priority: m.priority || index + 1,
          defaultExpanded: m.defaultExpanded !== false && m.priority === 1,
          style: {
            layout: this.mapToNewLayout(m.moduleId),
            cardStyle: m.style?.cardStyle || (m.priority === 1 ? 'elevated' : 'flat'),
            colorScheme: m.style?.colorScheme || 'auto',
            density: m.style?.density || 'comfortable',
          },
          initialApi: this.buildApiCallFromParams(m.moduleId, m.parameters || {}),
          interactionApis: this.buildInteractionApis(m.moduleId),
          reason: m.reason,
        })),
      };

      return plan;
    } catch (error: any) {
      console.error('✗ 解析 AI 响应失败:', error.message);
      throw error;
    }
  }

  /**
   * 将模块ID映射到新的横向滑动布局类型
   */
  private mapToNewLayout(moduleId: string): string {
    // 横向滑动列表布局
    if (['flight', 'shopping', 'yelp', 'videos', 'images'].includes(moduleId)) {
      return 'horizontal-scrollable-list';
    }
    
    // 信息展示布局
    if (moduleId === 'info_card') {
      return 'info-display';
    }
    
    // 交互操作布局
    if (['line_general_agent', 'general_agent', 'orchestration_agent'].includes(moduleId)) {
      return 'interactive-action';
    }
    
    // 地图横向布局
    if (moduleId === 'meeting_view') {
      return 'map-view-horizontal';
    }
    
    // 默认使用横向滑动列表
    return 'horizontal-scrollable-list';
  }

  /**
   * 从参数构建 API 调用配置
   */
  private buildApiCallFromParams(moduleId: string, parameters: Record<string, any>): any {
    const apiMapping: Record<string, any> = {
      // 新的模块ID映射
      flight: {
        apiId: 'flights/search',
        endpoint: '/api/flights/search',
        method: 'POST',
        parameters: {
          from: parameters.from || parameters.departure || '北京',
          to: parameters.to || parameters.destination || parameters.arrival || '上海',
          date: parameters.date || new Date().toISOString().split('T')[0],
        },
      },
      shopping: {
        apiId: 'shopping/search',
        endpoint: '/api/shopping/search',
        method: 'POST',
        parameters: {
          keyword: parameters.keyword || parameters.query || parameters.item || '特产',
          city: parameters.city || '上海',
        },
      },
      yelp: {
        apiId: 'yelp/search',
        endpoint: '/api/yelp/search',
        method: 'POST',
        parameters: {
          query: parameters.query || parameters.keyword || '餐厅',
          city: parameters.city || '上海',
        },
      },
      videos: {
        apiId: 'videos/search',
        endpoint: '/api/videos/search',
        method: 'POST',
        parameters: {
          query: parameters.query || parameters.keyword || '视频',
        },
      },
      images: {
        apiId: 'images/search',
        endpoint: '/api/images/search',
        method: 'POST',
        parameters: {
          query: parameters.query || parameters.keyword || '图片',
        },
      },
      info_card: {
        apiId: 'info/search',
        endpoint: '/api/info/search',
        method: 'POST',
        parameters: {
          query: parameters.query || '信息',
        },
      },
      line_general_agent: {
        apiId: 'line/getContacts',
        endpoint: '/api/line/contacts',
        method: 'POST',
        parameters: {},
      },
      general_agent: {
        apiId: 'agent/getActions',
        endpoint: '/api/agent/actions',
        method: 'POST',
        parameters: {},
      },
      orchestration_agent: {
        apiId: 'orchestration/getWorkflows',
        endpoint: '/api/orchestration/workflows',
        method: 'POST',
        parameters: {},
      },
      meeting_view: {
        apiId: 'meeting/getRecommendations',
        endpoint: '/api/meeting/recommendations',
        method: 'POST',
        parameters: {
          location: parameters.location || parameters.city || '上海',
        },
      },
      
      // 保留旧的模块ID映射以支持降级
      flight_search: {
        apiId: 'flights/search',
        endpoint: '/api/flights/search',
        method: 'POST',
        parameters: {
          from: parameters.from || parameters.departure || '北京',
          to: parameters.to || parameters.destination || parameters.arrival || '上海',
          date: parameters.date || new Date().toISOString().split('T')[0],
        },
      },
      hotel_search: {
        apiId: 'hotels/search',
        endpoint: '/api/hotels/search',
        method: 'POST',
        parameters: {
          city: parameters.city || parameters.to || parameters.destination || '上海',
          checkIn: parameters.checkIn || parameters.date || new Date().toISOString().split('T')[0],
        },
      },
      weather_info: {
        apiId: 'weather/query',
        endpoint: '/api/weather/query',
        method: 'POST',
        parameters: {
          city: parameters.city || parameters.to || parameters.destination || '上海',
        },
      },
      attraction_guide: {
        apiId: 'attractions/search',
        endpoint: '/api/attractions/search',
        method: 'POST',
        parameters: {
          city: parameters.city || parameters.to || parameters.destination || '上海',
          type: parameters.type,
        },
      },
      ride_hailing: {
        apiId: 'ride/estimate',
        endpoint: '/api/ride/estimate',
        method: 'POST',
        parameters: {
          origin: parameters.from || '当前位置',
          destination: parameters.to || parameters.destination || '机场',
        },
      },
      restaurant_finder: {
        apiId: 'restaurants/search',
        endpoint: '/api/restaurants/search',
        method: 'POST',
        parameters: {
          location: parameters.city || parameters.location || '附近',
          cuisine: parameters.cuisine || parameters.keyword,
        },
      },
      event_ticket: {
        apiId: 'events/search',
        endpoint: '/api/events/search',
        method: 'POST',
        parameters: {
          city: parameters.city || '上海',
          date: parameters.date,
        },
      },
      currency_converter: {
        apiId: 'currency/rate',
        endpoint: '/api/currency/rate',
        method: 'POST',
        parameters: {
          from: parameters.fromCurrency || 'USD',
          to: parameters.toCurrency || 'CNY',
          amount: parameters.amount || 100,
        },
      },
      schedule: {
        apiId: 'schedule/get',
        endpoint: '/api/schedule/get',
        method: 'POST',
        parameters: {
            days: parameters.days || 3,
            destination: parameters.destination || '上海'
        }
      },
      completion: {
        apiId: 'completion/status',
        endpoint: '/api/completion/status',
        method: 'POST',
        parameters: {}
      },
      map_view: {
        apiId: 'map/getPois',
        endpoint: '/api/map/getPois',
        method: 'POST',
        parameters: {
            center: parameters.location || '上海'
        }
      },
      shopping: {
        apiId: 'shopping/search',
        endpoint: '/api/shopping/search',
        method: 'POST',
        parameters: {
            keyword: parameters.keyword || parameters.item || '特产'
        }
      },
      idea_guide: {
        apiId: 'idea/recommend',
        endpoint: '/api/idea/recommend',
        method: 'POST',
        parameters: {
            theme: parameters.theme || '城市攻略'
        }
      },
      share_card: {
        apiId: 'share/generate',
        endpoint: '/api/share/generate',
        method: 'POST',
        parameters: {}
      },
      web_widget: {
        apiId: 'web/load',
        endpoint: '/api/web/load',
        method: 'POST',
        parameters: {
            url: parameters.url
        }
      }
    };

    const config = apiMapping[moduleId] || apiMapping.flight;
    return {
      apiId: config.apiId,
      endpoint: config.endpoint,
      method: config.method,
      parameters: config.parameters,
    };
  }

  /**
   * 构建交互 APIs
   */
  private buildInteractionApis(moduleId: string): Record<string, any> {
    const interactionMapping: Record<string, any> = {
      flight: {
        onItemClick: {
          apiId: 'flights/detail',
          endpoint: '/api/flights/detail',
          method: 'POST',
          parameters: {},
        },
      },
      shopping: {
        onItemClick: {
          apiId: 'shopping/detail',
          endpoint: '/api/shopping/detail',
          method: 'POST',
          parameters: {},
        },
      },
      yelp: {
        onItemClick: {
          apiId: 'yelp/detail',
          endpoint: '/api/yelp/detail',
          method: 'POST',
          parameters: {},
        },
      },
      // 保留旧的映射
      flight_search: {
        onItemClick: {
          apiId: 'flights/detail',
          endpoint: '/api/flights/detail',
          method: 'POST',
          parameters: {},
        },
      },
      hotel_search: {
        onItemClick: {
          apiId: 'hotels/detail',
          endpoint: '/api/hotels/detail',
          method: 'POST',
          parameters: {},
        },
      },
      weather_info: {},
    };

    return interactionMapping[moduleId] || {};
  }

  /**
   * 测试 AI 连接
   */
  async testConnection(): Promise<boolean> {
    return await this.cerebrasClient.testConnection();
  }
}

