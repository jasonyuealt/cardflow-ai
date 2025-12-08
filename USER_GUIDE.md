# CardFlow AI 使用指南与架构解析

## 一、系统架构与执行流程

CardFlow 采用 **"Double-AI Architecture" (Planner + Mapper)**，配合向量检索实现动态 UI 生成。

### 核心处理流程 (The Pipeline)

1.  **用户输入 (User Input)**
    *   用户在首页输入自然语言指令（如："帮我找静安寺附近的租房"）。

2.  **向量检索 (Vector Retrieval)**
    *   系统在 `server/modules/registry/*.json` 中查找最匹配的模块。
    *   **原理**：基于关键词 (`keywords`) 和描述 (`description`) 的语义匹配。
    *   **产出**：Top 5 候选模块（如 `rent`, `hotel`）。

3.  **Stage 1: Planner AI (决策)**
    *   **大脑**：Cerebras Llama 3.1 70B。
    *   **任务**：从候选模块中选择最佳工具，并提取参数。
    *   **产出**：`ExecutionPlan`（包含 `targetModuleId: "rent"`, `apiCall: { location: "静安寺" }`）。

4.  **API 执行 (API Execution)**
    *   **路由**：根据 Registry 定义，找到对应的 API Endpoint（如 `/api/rent/search`）。
    *   **数据**：调用 `server/mock-data/*.json` 获取数据（或实时调用 AI）。
    *   **产出**：Raw JSON Data（生数据）。

5.  **Stage 2: Mapper AI (映射)**
    *   **翻译**：将生数据转换为前端通用的 UI 协议格式。
    *   **协议**：`ListItem` / `InfoItem` / `ActionItem` / `MapItem`。
    *   **产出**：Standard UI Data（熟数据）。

6.  **前端渲染 (Frontend Rendering)**
    *   根据 `recommendedLayout` 自动选择组件渲染（如 `horizontal-scrollable-list`）。

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
| **工作流 (Orchestrator)** | `开启早安模式` | `server/mock-data/orchestration-getWorkflows.json` |
| **应用控制 (GeneralAgent)** | `帮我发封邮件` | `server/mock-data/agent-getActions.json` |
| **聊天 (LineAgent)** | `问问 Alice 什么时候有空` | `server/mock-data/line-getContacts.json` |

### 4. 地图视图 (Map View)
**适用场景**：地点推荐、路线规划。

| 模块 (Module) | 触发指令 (Input Case) | 对应数据文件 |
| :--- | :--- | :--- |
| **会面 (Meeting)** | `我和 Alice 想约在静安寺见面，推荐个地方` | `server/mock-data/meeting-getRecommendations.json` |

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

