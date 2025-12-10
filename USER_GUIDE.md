# CardFlow AI 使用指南与架构解析

## 一、系统架构与执行流程

CardFlow 采用 **"Double-AI Architecture" (Planner + Mapper)**，配合向量检索实现动态 UI 生成。

### 核心处理流程 (The Pipeline)详解

本节详细展示数据如何在组件间流转，特别是 **Planner 如何决定调用哪个 API**。

#### 1. 用户输入 (User Input)
*   **输入**: 自然语言字符串
*   **示例**: `"订明天北京到上海的机票"`

#### 2. 向量检索 (Vector Retrieval)
*   **组件**: `server/ai/vector-retriever.ts`
*   **处理**: 关键词匹配 + 语义规则。
*   **输出**: `Candidate Modules` (Top 5)
    *   例如：`["flight", "hotel", "weather"]`

#### 3. Stage 1: Planner AI (决策阶段)
*   **组件**: `server/ai/prompt-builder.ts` -> LLM
*   **输入 (Prompt)**: 
    *   用户输入
    *   候选模块的**完整定义** (包含详细的 APIs 定义，如 `id`, `parameters`)。**注意：这是最新的架构改进，Planner 现在能看到真实的 API 定义，而不仅仅是摘要。**
*   **处理**: LLM 决定意图，选择模块，并根据 Prompt 中提供的真实 API 定义提取参数。
*   **输出 (JSON)**: `ExecutionPlan`

```json
// Planner 输出的 ExecutionPlan 示例
{
  "modules": [
    {
      "targetModuleId": "flight",           // 1. 选定模块
      "targetLayout": "horizontal-scrollable-list",
      "apiCall": {
        "id": "search",                     // 2. AI 选定的真实 API ID (不再是猜测)
        "params": {                         // 3. AI 提取的参数
          "from": "北京",
          "to": "上海",
          "date": "tomorrow"
        }
      },
      "reason": "用户想要预订机票"
    }
  ]
}
```

#### 4. API 匹配与执行 (API Execution)
*   **组件**: `server/orchestrator/plan-executor.ts`
*   **逻辑**: 
    1.  **加载定义**: 系统读取 `server/modules/registry/flight.json`。
    2.  **精确匹配**: 直接查找 `apis["search"]`。因为 Planner 已经看到了真实的 API 定义，所以这里的 ID 是完全一致的。
    3.  **注意**: 之前的版本包含模糊匹配逻辑，现已移除，系统要求 AI 输出精确的 API ID。

> **📄 模块定义 (registry/flight.json)**
> ```json
> {
>   "id": "flight",
>   "apis": {
>     "search": {  // <--- 精确命中
>       "endpoint": "/api/flights/search",
>       "method": "POST",
>       "parameters": { ... }
>     }
>   }
> }
> ```

*   **执行**:
    *   **确定 Endpoint**: 拿到 `/api/flights/search`。
    *   **Mock 路由**: 掐头去尾，转换为 Mock 文件名 `flights-search.json`。
    *   **参数注入**: 读取 Mock 文件，将 `params: { from: "北京"... }` 填入模板。

*   **输出**: **Raw Data (生数据)**
```json
// 从 flights-search.json 读取并填充后的数据
[
  {
    "flightNo": "MU5101",
    "airline": "东方航空",
    "price": "¥1250",
    "departure": "北京",
    "arrival": "上海"
  },
  ...
]
```

#### 5. Stage 2: Mapper AI (映射阶段)
*   **组件**: `server/ai/executor.ts` -> LLM
*   **输入**: Raw Data + 目标 Layout Schema (前端组件协议)。
*   **处理**: LLM 将杂乱的生数据转换为标准 UI 格式。
*   **输出**: **Standard UI Data (熟数据)**

```json
// 转换后的标准 UI 数据
[
  {
    "id": "MU5101",
    "title": "北京 -> 上海",
    "subtitle": "东方航空 MU5101",
    "highlight": { "value": "¥1250", "color": "primary" },
    "details": ["08:00 起飞"],
    "hero": { "type": "icon", "value": "✈️" }
  }
]
```

#### 6. 前端渲染
*   **输入**: Standard UI Data
*   **处理**: 前端 `ModuleRenderer` 接收数据，传给 `HorizontalScrollableList` 组件进行渲染。

---

## 二、功能场景与测试用例 (Verified Inputs)

以下输入用例均已在系统中注册并包含对应的 Mock 数据，可直接测试。

### 1. 横向滑动列表 (Horizontal List)
**适用场景**：浏览多个选项、对比信息。

| 模块 (Module) | 触发指令 (Input Case) | 对应数据文件 |
| :--- | :--- | :--- |
| **电影 (Movie)** | `推荐几部好看的电影` | `server/mock-data/movies-search.json` |
| **音乐 (Music)** | `听周杰伦的歌` | `server/mock-data/music-search.json` |
| **租房 (Rent)** | `静安寺附近的租房` | `server/mock-data/rent-search.json` |
| **酒店 (Hotel)** | `推荐外滩附近的酒店` | `server/mock-data/hotels-search.json` |
| **航班 (Flight)** | `订明天北京到上海的机票` | `server/mock-data/flights-search.json` |
| **餐厅 (Yelp)** | `这附近有什么好吃的` | `server/mock-data/yelp-search.json` |
| **购物 (Shopping)** | `买个 Switch 游戏机` | `server/mock-data/shopping-search.json` |
| **视频 (Video)** | `找一些烹饪视频` | `server/mock-data/videos-search.json` |

### 2. 信息展示 (Info Display)
**适用场景**：获取答案、查看详情。

| 模块 (Module) | 触发指令 (Input Case) | 对应数据文件 |
| :--- | :--- | :--- |
| **天气 (Weather)** | `查询上海的天气` | `server/mock-data/weather-query.json` |
| **资讯 (Info)** | `搜索最新的科技新闻` | `server/mock-data/info-search.json` |
| **AI 问答 (General)** | `红烧肉怎么做？`<br>`讲个冷笑话`<br>`什么是量子力学？` | **Real AI** (Cerebras API) |

### 3. 交互操作 (Interactive Action)
**适用场景**：执行任务、控制应用。

| 模块 (Module) | 触发指令 (Input Case) | 对应数据文件 |
| :--- | :--- | :--- |
| **工作流 (Orchestrator)** | `开启早安模式` | `server/mock-data/orchestration-workflows.json` |
| **应用控制 (GeneralAgent)** | `帮我发封邮件` | `server/mock-data/agent-actions.json` |
| **聊天 (LineAgent)** | `问问 Alice 什么时候有空` | `server/mock-data/line-contacts.json` |

### 4. 地图视图 (Map View)
**适用场景**：地点推荐、路线规划。

| 模块 (Module) | 触发指令 (Input Case) | 对应数据文件 |
| :--- | :--- | :--- |
| **会面 (Meeting)** | `我和 Alice 想约在静安寺见面，推荐个地方` | `server/mock-data/meeting-recommendations.json` |

---

## 三、常见问题

**Q: 为什么输入没有反应？**
A: 请检查输入是否包含核心关键词（如“天气”、“电影”、“租房”）。如果系统无法识别意图，会自动降级调用 AI 问答模块。

**Q: 为什么每次返回的数据都一样？**
A: 目前系统处于 Mock 阶段，除了 **AI 问答 (General Knowledge)** 是实时生成的，其他模块均返回预置的 JSON 数据。

**Q: 如何添加新功能？**
1. 在 `server/modules/registry/` 添加模块定义 (`.json`)。
2. 在 `server/mock-data/` 添加对应的 Mock 数据。
3. 在 `server/modules/registry/all-modules.json` 中注册。
