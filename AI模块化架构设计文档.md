# CardFlow AI 架构设计文档 (AI Native Edition)

## 一、核心理念

**"Everything is Data, UI is just a Projection."**

CardFlow 是一个由双阶段 AI 驱动的动态界面生成系统。它不再依赖预定义的业务组件（如“机票卡片”），而是基于**通用 UI 协议**。AI 负责实时将任意业务数据“翻译”为标准 UI 结构。

---

## 二、智能架构 (Double-AI Architecture)

系统采用 **Planner + Mapper** 双 AI 协作模式，配合向量检索，实现极致的灵活性。

### 2.1 核心数据流

```mermaid
graph TD
    User[用户输入] --> Embedding[Embedding 向量化]
    Embedding --> VectorDB[(向量检索库)]
    VectorDB -->|Top 5 工具能力摘要| Planner[Stage 1: Planner AI]
    
    subgraph "决策阶段 (Decision)"
    Planner -->|执行计划 (API参数)| APIGateway[API 网关]
    end
    
    APIGateway -->|Raw JSON (生数据)| Mapper[Stage 2: Mapper AI]
    
    subgraph "适配阶段 (Mapping)"
    Mapper -->|Standard UI Data (熟数据)| Frontend[前端渲染器]
    end
```

### 2.2 组件职责详解

#### 1. 向量检索 (The Index)
*   **职责**：**“已就绪能力的菜单”**。从海量工具中快速粗筛出最相关的候选者。只有后端实现了（或 Mock 了）API 的模块才会被收录在此。
*   **输入**：用户 Prompt。
*   **处理**：Embedding 相似度匹配（纯数学计算，**不需要** 大模型参与）。
*   **输出**：Top 5 工具的**能力摘要 (Capabilities)**。

#### 2. Stage 1: Planner AI (The Brain)
*   **职责**：意图理解、工具选择、参数提取。
*   **输入**：用户 Prompt + 候选工具摘要。
*   **输出**：**执行计划**（包含确定的 API 调用、参数、以及推荐的 UI 布局类型）。
*   **模型**：Cerebras Llama 3.1 70B (High Intelligence)。

#### 3. Stage 2: Mapper AI (The Translator)
*   **职责**：**数据清洗与 UI 映射**。代替传统的硬编码 Adapter。
*   **输入**：API 返回的 Raw JSON + 目标 UI 协议 (Schema)。
*   **Prompt**：*"这是 API 返回的数据，请将其提取并映射到以下 UI 结构中..."*
*   **输出**：符合前端标准的 UI 数据。
*   **模型**：Cerebras Llama 3.1 70B (High Speed & Instruction Following)。

---

## 三、通用 UI 协议 (Universal UI Protocol)

前端不再有业务逻辑，只负责渲染以下四种通用结构。

### 3.1 横向滑动列表 (Horizontal List)
**ID:** `horizontal-scrollable-list`
**适用：** 机票、商品、餐厅、视频、图片等列表数据。

**数据结构 (Item Schema):**
```typescript
interface ListItem {
  id: string;
  hero: {
    type: "image" | "icon";
    value: string;           // 图片URL 或 Emoji/Icon名
  };
  title: string;             // 主标题 (如：航班号、商品名)
  subtitle?: string;         // 副标题 (如：时间、地址)
  details?: string[];        // 辅助信息列表 (如：["直飞", "波音787"])
  highlight?: {              // 强调信息 (如：价格)
    value: string;
    color?: "primary" | "danger" | "success";
  };
  actions: Action[];         // 交互按钮
}
```

### 3.2 信息展示 (Info Display)
**ID:** `info-display`
**适用：** 新闻、百科、天气概览、通用知识问答。

**数据结构:**
```typescript
interface InfoItem {
  title: string;
  summary: string;           // 多行文本摘要
  metadata?: { label: string; value: string }[]; // 元数据 (如: 来源: CNN, 时间: 2h ago)
  footer?: string;
  link?: string;
}
```

### 3.3 交互面板 (Interactive Action)
**ID:** `interactive-action`
**适用：** 工具控制、表单填写、流程确认。

**数据结构:**
```typescript
interface ActionItem {
  icon: string;
  label: string;
  status: "idle" | "running" | "success" | "error";
  description?: string;
  inputs?: FormInput[];      // 如果需要用户补全参数
  primaryAction: Action;     // 主执行按钮
}
```

### 3.4 地图视图 (Map View)
**ID:** `map-view-horizontal`
**适用：** 地点推荐、路线规划。

**数据结构:**
```typescript
interface MapItem {
  location: { lat: number; lng: number };
  title: string;
  address: string;
  distance?: string;
  tags?: string[];
}
```

---

## 四、边界处理与无限能力 (Scalability & Fallbacks)

如何解决“没有对应 API”的问题？系统设计了三层防护网。

### 4.1 第一层：通用知识兜底 (General Info Fallback)
*   **场景**：用户问“怎么做红烧肉？”（没有菜谱 API）。
*   **机制**：向量检索返回空 -> 系统调用 `general_knowledge_module`。
*   **实现**：Planner AI 直接生成文本答案 -> Mapper AI 将其封装为 `info-display` 卡片。
*   **效果**：用户看到的是一张标准的“菜谱信息卡”，而不是纯文本。

### 4.2 第二层：Web 搜索扩展 (Web Browsing as API)
*   **场景**：用户问“查询 CardFlow 今日股价”（没有股票 API）。
*   **机制**：Planner AI 识别到需要外部信息 -> 调用 `web_search_module`。
*   **实现**：
    1. 后端调用搜索 API (Mock/Real) 获取网页摘要。
    2. Mapper AI 从摘要中提取股价信息。
    3. 映射为 `info-display` 或 `horizontal-scrollable-list`。
*   **效果**：将整个互联网变成了系统的 API 数据源。

### 4.3 第三层：AI 编排 (Orchestration)
*   **场景**：用户问“安排今晚约会”（没有约会 API）。
*   **机制**：Planner AI 自动拆解任务。
*   **实现**：
    1. Planner 生成多步计划：`yelp_search` (找餐厅) + `movie_search` (找电影)。
    2. 后端并行执行。
    3. Mapper AI 分别处理结果。
*   **效果**：用现有原子能力的组合，解决未定义的复杂场景。

---

## 五、Mock 数据策略 (Implementation Strategy)

为了保证开发效率与架构的真实性，我们采用 **"Real Backend + Mock Data"** 策略。

### 5.1 架构是“真”的
*   **Express Routes**: 真实的 `/api/flights/search` 路由。
*   **AI Logic**: 真实的 Cerebras 调用逻辑。
*   **Mapper**: 真实的 Prompt 映射逻辑。

### 5.2 数据是“模拟”的
在 Controller 层，我们不发送真实的 HTTP 请求给第三方（如携程），而是读取本地 JSON。

`server/apis/flight.controller.ts` (示例):
```typescript
export const searchFlights = async (req, res) => {
  // 1. 获取参数 (AI 传来的)
  const { from, to, date } = req.body;
  
  // 2. 读取 Mock 数据 (模拟第三方返回)
  // 在这里，我们假装调用了第三方 API
  const mockRawData = await loadJson('server/mock-data/flights-search.json');
  
  // 3. (可选) 根据参数简单过滤 Mock 数据，让体验更真实
  const filteredData = mockRawData.flights.filter(f => f.from === from);
  
  // 4. 返回 Raw Data 给 AI Mapper (注意：这里返回的必须是 Raw Data，不能是 UI Data)
  res.json(filteredData.length > 0 ? filteredData : mockRawData); 
};
```

### 5.3 价值
*   **无缝切换**：上线时，只需将 `loadJson` 替换为 `axios.get('https://api.ctrip.com/...')`，其他 AI 逻辑、前端代码 **一行都不用改**。
*   **开发稳定**：不依赖外部 API 的稳定性。
*   **费用为零**：开发阶段无需消耗昂贵的 API 调用额度。

---

## 六、模块定义规范 (Registry)

在新的架构下，注册一个新模块变得极其简单。

`server/modules/registry/flight.json`:
```json
{
  "id": "flight_search",
  "description": "查询飞机航班、比价、查看时刻表",
  "keywords": ["机票", "航班", "飞"],
  
  // 告诉 AI 这个工具的数据适合用什么容器装
  "recommendedLayout": "horizontal-scrollable-list",
  
  // 定义 API 接口（指向我们要实现的 Mock Controller）
  "apis": {
    "search": {
      "endpoint": "/api/flights/search",
      "method": "POST",
      "description": "搜索航班",
      "parameters": {
        "from": "出发城市",
        "to": "目的地城市",
        "date": "日期"
      }
    }
  }
}
```

---

## 七、开发与调试

### 7.1 环境变量
```bash
CEREBRAS_API_KEY=sk-...  # 必须配置，系统核心驱动力
```

### 7.2 调试 Mapper
在开发过程中，Mapper AI 的输出可能不稳定。
*   **Debug View**: 前端可以提供一个 "Show Raw Data" 按钮，查看 AI 映射前的原始数据。
*   **Prompt Tuning**: 如果映射不准（比如把时间映射成了标题），调整 `server/ai/prompts/mapper.ts` 中的 System Prompt。
