# AI 模块化架构设计文档

## 一、核心理念

用户通过自然语言输入需求，AI 一次性分析并返回完整的执行计划，包括：
- 需要展示哪些模块（功能卡片）
- 每个模块的优先级、初始状态、展示样式
- 每个模块需要调用的 API 及参数
- 用户交互时的 API 映射规则
- 页面的整体布局方式和主题风格

前端根据执行计划渲染卡片，用户交互时直接查找预配置的 API 映射，无需再次询问 AI。

**AI 的完全控制权：** AI 不仅决定展示什么内容，还决定如何展示（样式、布局、主题），实现真正的智能化界面生成。

---

## 二、技术架构

### 2.1 核心流程

1. **用户输入**：前端将自然语言请求发送给后端。
2. **向量检索**：后端从所有模块中检索最相关的 5-10 个模块摘要。
3. **AI 决策**：Cerebras AI (Llama 3.1 70B) 分析需求，选择模块，提取参数，并生成**推荐理由 (Reasoning)**。
4. **数据获取**：后端并行调用业务 API（可连接真实服务或 Mock 数据）获取模块数据。
5. **渲染返回**：返回包含数据、样式、布局和推荐理由的完整对象。
6. **前端渲染**：前端使用统一的渲染器展示横向滑动卡片。

### 2.2 技术栈

- **AI 模型**：Llama 3.1 70B (via Cerebras)
- **检索**：Vector Search (余弦相似度)
- **后端**：Node.js, Express, TypeScript
- **前端**：React, Tailwind CSS, Zustand

### 2.3 模型配置

配置文件：`server/config/ai.config.ts`

```typescript
export const aiConfig = {
  baseURL: process.env.CEREBRAS_BASE_URL || 'https://api.cerebras.ai/v1',
  apiKey: process.env.CEREBRAS_API_KEY || '',
  model: 'llama3.1-70b',
  temperature: 0.7,
  maxTokens: 4000
};
```


---

## 三、页面布局系统（横向滑动卡片）

### 3.1 核心布局理念

**统一横向滑动 (Unified Horizontal Scrolling)**

所有功能模块采用一致的卡片设计，支持横向滑动查看更多内容。

- **完整展示**：每个卡片项都展示完整的信息（如航班号、时间、价格、Logo），不再区分"当前项/待看项"。
- **流式交互**：用户可以自然地左右滑动查看列表中的所有项。
- **视觉提示**：右侧露出下一个卡片的边缘（88%宽度），暗示可滑动。
- **Snap 效果**：滑动时自动对齐，体验流畅。

**布局示意：**
```
屏幕宽度 100vw
┌──────────────────────────────────────────────┐
│                                              │
│  ┌──────────────┐ ┌──┐                      │
│  │  完整卡片1    │ │完│                      │
│  │  Air China   │ │整│                      │
│  │  ¥1500       │ │卡│                      │
│  └──────────────┘ └──┘                      │
│      ↑             ↑                        │
│   88% 宽度      露出一角                     │
└──────────────────────────────────────────────┘
```

### 3.2 支持的布局类型

系统支持以下四种卡片布局类型，通过 `LayoutRenderer` 统一渲染：

#### 1. 横向滑动列表 (horizontal-scrollable-list)

**适用模块：** Flight（航班）、Shopping（商品）、Yelp（餐厅）、Videos（视频）、Images（图片）

**卡片内容：**
- 顶部：Logo/Icon + 主标题（如航班号、商品名）
- 中间：关键信息（如起降时间、商品描述）
- 底部：价格、操作按钮

#### 2. 信息展示 (info-display)

**适用模块：** InfoCard（信息搜索）

**卡片内容：**
- 顶部：完整标题
- 中间：摘要内容
- 底部：来源、发布时间

#### 3. 交互操作 (interactive-action)

**适用模块：** GeneralAgent（应用控制）、OrchestrationAgent（工作流）、LineGeneralAgent（聊天）

**卡片内容：**
- 左侧：操作图标/头像
- 中间：操作名称、描述
- 右侧：状态/执行按钮

#### 4. 地图视图 (map-view-horizontal)

**适用模块：** MeetingView（会面地点）

**卡片内容：**
- 顶部：地图缩略图区域
- 中间：地点名称
- 底部：地址、距离、导航按钮

---

## 四、智能架构设计

### 4.1 检索增强 (RAG)

**目的：** 当系统有大量模块时，避免一次性将所有模块定义发送给 AI，超出 Token 限制。

**工作流程：**
1. **用户输入**："订明天北京到上海的机票"
2. **向量检索**：使用余弦相似度从所有模块摘要中找到最相关的 5-10 个模块。
3. **上下文构建**：将选中的模块详细定义放入 System Prompt。
4. **AI 决策**：AI 从候选模块中选择，并生成执行计划。

### 4.2 真实 AI 集成

系统通过 `AIExecutor` 直接调用 Cerebras AI (Llama 3.1 70B) 进行推理。

**Prompt 策略：**
- **System Prompt**：包含候选模块的定义、参数提取规则、布局映射规则。
- **User Prompt**：用户的自然语言输入。
- **JSON Output**：强制 AI 返回严格的 JSON 格式，包含模块选择、参数、样式和推荐理由。

### 4.3 代码分层

```
第1层：UI 渲染层 (LayoutRenderer)
├─ HorizontalScrollableList
├─ InfoDisplay
├─ InteractiveAction
└─ MapViewHorizontal

第2层：数据适配层 (ModuleInstance)
├─ 统一的数据结构
├─ 标准化的 style 配置
└─ 推荐理由 (reason)

第3层：业务逻辑层 (Executor)
├─ AIExecutor (AI 决策)
├─ PlanExecutor (计划执行)
└─ APIExecutor (数据获取)

第4层：数据服务层 (Mock Data / Real API)
├─ JSON Mock Files
└─ Future: Real Database/API
```


---

## 五、模块定义规范

### 5.1 功能模块的组成

每个功能模块包含以下部分：

**1. 身份信息（用于 AI 识别）**
- id: 模块唯一标识
- name: 模块名称
- description: 功能描述（详细的一句话，便于 AI 理解）
- keywords: 关键词列表（辅助向量检索）
- usageScenarios: 使用场景描述（帮助 AI 判断适用性）

**2. 运行时属性（由 AI 生成）**
- reason: 推荐理由（AI 生成的解释，说明为什么推荐此模块）
- priority: 排序优先级
- parameters: 提取的参数

**3. 布局配置（AI 可选择）**
- layoutOptions: 支持的布局类型列表
  - 例如：["list-detail", "compact-list", "grid-view"]
  - AI 根据用户需求和屏幕场景选择最合适的
- defaultLayout: 默认推荐布局

**3. 样式配置（AI 可决定）**
- styleOptions: 样式变体选项
  - cardStyle: ["elevated", "flat", "outlined"]  // 卡片样式
  - colorScheme: ["auto", "primary", "success", "warning"]  // 主题色
  - density: ["comfortable", "compact", "spacious"]  // 内容密度
- themeAdaptation: 是否支持自动主题适配

**4. 数据适配器（处理数据差异）**
- cardSummaryRender: 折叠状态如何显示摘要
- listItemRender: 列表项如何渲染（支持多种渲染模式）
- detailRender: 详情如何渲染
- parameterMapping: 参数转换规则

**5. API 绑定**
- initialApi: 初始加载时调用的 API
- interactionApis: 用户交互时的 API 映射

**6. 交互流程**
- 默认状态：展开/折叠
- 交互事件映射：点击、提交、选择等

### 4.2 模块示例结构

```javascript
{
  // 身份信息
  id: "flight_search",
  name: "机票搜索",
  description: "搜索国内外航班，查看详情，预订机票，支持按价格、时间、航空公司筛选",
  keywords: ["机票", "航班", "飞机", "订票", "机票预订"],
  usageScenarios: "用户需要查询或预订机票时使用，可处理单程、往返、多程查询",
  
  // 布局配置（AI 可选择）
  layoutOptions: ["list-detail", "compact-list", "grid-view"],
  defaultLayout: "list-detail",
  layoutDescriptions: {
    "list-detail": "列表+详情布局，适合桌面端，信息展示完整",
    "compact-list": "紧凑列表，适合移动端，快速浏览",
    "grid-view": "网格布局，适合多个选项对比"
  },
  
  // 样式配置（AI 可决定）
  styleOptions: {
    cardStyle: ["elevated", "flat", "outlined"],
    colorScheme: ["auto", "blue", "green"],
    density: ["comfortable", "compact"]
  },
  
  // 数据适配
  dataAdapter: "FlightAdapter",
  
  // API 绑定
  apis: {
    initial: "flights/search",
    detail: "flights/detail",
    book: "flights/book"
  },
  
  // 交互配置
  interactions: {
    onItemClick: "detail",
    onBookClick: "book"
  }
}
```

**AI 如何决策样式：**
- 如果用户说"快速看一下机票"，AI 选择 compact-list + compact 密度
- 如果用户说"详细对比一下航班"，AI 选择 list-detail + comfortable 密度
- 如果用户说"看看有哪些选择"，AI 选择 grid-view 布局
- 如果用户说"界面简洁点"，AI 选择 flat 卡片样式
- 如果用户说"突出显示重要信息"，AI 选择 elevated 卡片样式

---

## 五、通用卡片类型

### 5.1 横向滑动列表卡片（Horizontal Scrollable List Card）

**适用场景：** Flight（航班）、Shopping（商品）、Yelp（餐厅）、Videos（视频）、Images（图片）

**布局特点：**
- 卡片内容横向滑动展示
- 当前项（70%宽度）：完整信息展示
- 待看项（30%宽度）：简略信息展示
- 支持左右滑动切换

**当前项内容：**
- 完整图片/logo
- 主标题（航班号/商品名/餐厅名）
- 副标题（时间/描述/地址）
- 价格/评分
- 详细信息
- 操作按钮（预订/购买/查看详情）

**待看项内容：**
- 缩略图/小图标
- 主标题（可能截断）
- 关键信息（价格/评分）

**数据适配器提供：**
```javascript
FlightAdapter = {
  // 当前项渲染（完整信息）
  currentItemRender: (flight) => ({
    image: flight.airlineLogo,
    mainTitle: `${flight.airline} ${flight.flightNumber}`,
    subTitle: `${flight.departure} → ${flight.arrival}`,
    time: `${flight.departureTime} - ${flight.arrivalTime}`,
    duration: flight.duration,
    price: `¥${flight.price}`,
    tags: [flight.cabin, flight.seats + '座位'],
    actions: [
      { label: "查看详情", action: "detail" },
      { label: "预订", action: "book", primary: true }
    ]
  }),
  
  // 待看项渲染（简略信息）
  previewItemRender: (flight) => ({
    icon: flight.airlineIcon,
    title: flight.airline,
    price: `¥${flight.price}`
  })
}
```

**复用示例：**
- 航班搜索：使用 FlightAdapter
- 商品搜索：使用 ShoppingAdapter（同样的横向滑动组件，不同的适配器）
- 餐厅搜索：使用 YelpAdapter

### 5.2 信息展示卡片（Info Display Card）

**适用场景：** InfoCard（信息搜索、新闻、实时数据）

**布局特点：**
- 横向滑动展示不同信息片段
- 当前项（70%宽度）：完整信息
- 待看项（30%宽度）：简略标题

**当前项内容：**
- 完整标题
- 摘要内容
- 来源/发布时间
- 相关链接
- 查看详情按钮

**待看项内容：**
- 简略标题（截断）
- 来源/分类

**特点：**
- 以文本内容为主
- 可能包含图表或图标
- 横向滑动查看多条信息

### 5.3 交互操作卡片（Interactive Action Card）

**适用场景：** LineGeneralAgent（聊天）、GeneralAgent（应用控制）、OrchestrationAgent（多步骤）

**布局特点：**
- 横向滑动展示不同操作选项或对话
- 当前项（70%宽度）：完整操作界面
- 待看项（30%宽度）：简略名称/图标

**当前项内容：**
- 操作图标/头像
- 操作名称/联系人
- 操作描述/最后消息
- 执行按钮/输入框
- 历史记录/状态

**待看项内容：**
- 图标/头像
- 名称（截断）
- 状态指示

**特点：**
- 交互密集，需要用户输入或确认
- 可能触发重要操作
- 横向滑动查看多个操作选项或对话

---

## 六、特殊卡片类型

### 6.1 地图视图卡片（Map View Card）

**适用场景：** MeetingView（会面地点选择）

**布局特点：**
- 横向滑动展示不同推荐地点
- 当前项（70%宽度）：完整地图和地点信息
- 待看项（30%宽度）：小地图缩略图和名称
- 每个选项包含交互式地图

**当前项内容：**
- 交互式地图区域
- 地点名称
- 详细地址
- 距离信息
- 交通方式和时间
- 导航按钮

**待看项内容：**
- 小地图缩略图
- 地点名称
- 距离

**模块定义：**
```javascript
{
  id: "meeting_view",
  layoutType: "map-view-horizontal",  // 横向滑动地图布局
  components: {
    currentItem: "InteractiveMapFull",  // 完整地图
    previewItem: "MapThumbnail"  // 地图缩略图
  }
}
```

### 6.2 布局类型总结

**四种横向滑动布局：**

| 布局类型 | 适用模块 | 当前项特点 | 待看项特点 |
|---------|----------|-----------|-----------|
| **horizontal-scrollable-list** | Flight, Shopping, Yelp, Videos, Images | 完整图片+详细信息+操作按钮 | 缩略图+关键信息 |
| **info-display** | InfoCard | 完整标题+摘要+来源+链接 | 简略标题+来源 |
| **interactive-action** | LineGeneralAgent, GeneralAgent, OrchestrationAgent | 完整操作界面+输入框 | 图标+名称 |
| **map-view-horizontal** | MeetingView | 交互式地图+完整地点信息 | 地图缩略图+名称 |

**关键设计原则：**
1. **当前项优先**：始终完整展示当前选中项的所有关键信息
2. **待看项提示**：用简略信息提示下一个选项，吸引用户滑动
3. **宽度固定**：当前项 + 待看项 = 100vw，确保视觉平衡
4. **滑动流畅**：左滑时待看项平滑过渡为当前项
5. **内容适配**：根据不同模块类型适配当前项和待看项的展示内容

---

## 七、执行流程

### 7.1 AI 决策阶段

**输入：** 用户自然语言

**处理：**
1. 向量检索所有模块，返回最相关的 3-10 个模块摘要
2. AI 语义分析，选择 1 个或多个模块
3. 加载选中模块的详细定义
4. AI 提取参数
5. **AI 决策样式**：根据用户意图选择布局、主题、密度
6. 生成完整执行计划

**输出：执行计划（JSON）**
```javascript
{
  // 全局样式配置（AI 决定）
  globalStyle: {
    theme: "light",              // AI 可选：light, dark, auto
    accentColor: "blue",         // 主色调
    pageLayout: "vertical"       // 页面布局方式
  },
  
  // 模块列表
  modules: [
    {
      instanceId: "flight-001",
      moduleId: "flight_search",
      priority: 1,
      defaultExpanded: true,
      
      // AI 为这个模块选择的样式（从模块的 styleOptions 中选）
      style: {
        layout: "list-detail",     // AI 从 layoutOptions 中选择
        cardStyle: "elevated",     // AI 从 cardStyle 选项中选择
        colorScheme: "blue",       // AI 从 colorScheme 选项中选择
        density: "comfortable"     // AI 从 density 选项中选择
      },
      
      initialApi: {
        apiId: "flights/search",
        parameters: { from: "北京", to: "上海", date: "2025-12-02" }
      },
      
      interactionApis: {
        onItemClick: { apiId: "flights/detail", ... },
        onBook: { apiId: "flights/book", ... }
      }
    },
    
    {
      instanceId: "hotel-001",
      moduleId: "hotel_search",
      priority: 2,
      defaultExpanded: false,
      
      // 次要模块可能用更紧凑的样式
      style: {
        layout: "compact-list",
        cardStyle: "flat",
        density: "compact"
      },
      
      initialApi: { ... }
    }
  ]
}
```

**AI 样式决策示例：**

| 用户输入 | AI 决策 |
|---------|--------|
| "快速查一下机票" | layout: compact-list, density: compact |
| "详细对比航班信息" | layout: list-detail, density: comfortable |
| "简洁点，不要太花哨" | cardStyle: flat, colorScheme: auto |
| "重要，突出显示" | cardStyle: elevated, colorScheme: primary |
| "移动端访问" | layout: compact-list, density: compact |

### 7.2 后端执行阶段

**输入：** 执行计划

**处理：**
1. 遍历每个模块
2. 加载对应的模块配置和适配器
3. 使用适配器的 parameterMapping 转换参数
4. 并行调用所有 initialApi（Mock 或真实）
5. 将返回数据注入到执行计划中

**输出：渲染数据**
```javascript
{
  modules: [
    {
      instanceId: "flight-001",
      moduleConfig: { ...FlightSearchModule },  // 模块配置
      adapter: FlightAdapter,                   // 适配器
      data: [ ...航班数据 ],                     // 已加载的数据
      expanded: true,                           // 展开状态
      interactionApis: { ... }                  // 交互映射
    },
    {
      instanceId: "hotel-001",
      moduleConfig: { ...HotelSearchModule },
      adapter: HotelAdapter,
      data: [ ...酒店数据 ],
      expanded: false,                          // 折叠状态
      interactionApis: { ... }
    }
  ]
}
```

### 7.3 前端渲染阶段

**输入：** 渲染数据

**处理：**
1. 按 priority 排序模块
2. 遍历渲染每个模块卡片
3. 根据 expanded 状态决定展开/折叠
4. 使用适配器渲染具体内容

**渲染逻辑：**
```javascript
modules
  .sort((a, b) => a.priority - b.priority)
  .map(module => (
    <CardContainer
      key={module.instanceId}
      expanded={module.expanded}
      onToggle={...}
    >
      {/* 折叠状态 */}
      <CardHeader>
        {module.adapter.cardSummary(module.data)}
      </CardHeader>
      
      {/* 展开状态 */}
      {module.expanded && (
        <CardBody>
          <LayoutRenderer 
            layoutType={module.moduleConfig.layoutType}
            adapter={module.adapter}
            data={module.data}
            interactions={module.interactionApis}
          />
        </CardBody>
      )}
    </CardContainer>
  ))
```

### 7.4 用户交互阶段

**场景：** 用户点击某个航班查看详情

**处理：**
1. 组件读取 interactionApis.onItemClick
2. 使用适配器的 parameterMapping 转换参数
3. 调用对应的 API（不再询问 AI）
4. 更新卡片内容（显示详情）

**关键：** 所有交互都已在执行计划中预配置，无需再次 AI 决策

---

## 八、API 模块化设计

### 8.1 API 定义规范

每个 API 独立定义，包含：

```javascript
{
  id: "flights/search",
  name: "搜索航班",
  description: "根据出发地、目的地和日期搜索航班",
  endpoint: "/api/flights/search",
  method: "POST",
  parameters: {
    from: { type: "string", required: true, description: "出发城市" },
    to: { type: "string", required: true, description: "目的地城市" },
    date: { type: "date", required: true, description: "出发日期" }
  },
  returnType: "Flight[]",
  mockData: "mock/flights_search.json"  // Mock 数据文件路径
}
```

### 8.2 参数映射机制

**问题：** AI 理解的参数名 vs API 需要的参数名可能不同

**解决：** 适配器中的 parameterMapping

**示例：**
```javascript
// AI 提取的参数
aiParams = {
  departure: "北京",
  destination: "上海",
  date: "2025-12-02"
}

// 适配器转换
FlightAdapter.parameterMapping.search(aiParams)
// 返回 API 需要的参数
{
  from: "北京",      // departure → from
  to: "上海",        // destination → to
  date: "2025-12-02"
}
```

### 8.3 Mock 模式

**目的：** 在没有真实后端时，也能完整测试流程

**实现方式：**

**1. Mock 数据文件：**
```json
// mock/flights_search.json
{
  "delay": 500,
  "response": [
    {
      "id": "CZ3001",
      "flightNumber": "CZ3001",
      "airline": "南航",
      "departure": "08:00",
      "arrival": "10:30",
      "price": 580
    }
  ]
}
```

**2. API 执行器检测 Mock 模式：**
```javascript
async function callApi(apiId, parameters) {
  if (MOCK_MODE) {
    const mockConfig = loadMockData(apiId);
    await sleep(mockConfig.delay);
    return processMockResponse(mockConfig.response, parameters);
  } else {
    return await fetch(apiEndpoint, { ... });
  }
}
```

**3. 动态参数替换：**
```json
// mock/flights_detail.json
{
  "response": {
    "id": "${params.flightId}",   // 使用请求参数
    "seats": ["1A", "1B", "2C"]
  }
}
```

---

## 九、模块隔离机制

### 9.1 为什么需要隔离？

同一页面可能同时展示多个模块，需要避免：
- 状态互相干扰
- 数据混淆
- 事件冲突

### 9.2 隔离方式

**1. 实例 ID 隔离**
每个模块都有唯一的 instanceId，不是 moduleId
- moduleId: 模块类型（如 flight_search）
- instanceId: 具体实例（如 flight-001）

**2. 独立状态管理**
每个模块实例有自己的 state
```javascript
{
  instanceId: "flight-001",
  state: {
    data: [...],
    selectedItem: null,
    loading: false
  }
}
```

**3. API 调用隔离**
API 调用携带 instanceId，确保响应返回到正确的实例

### 9.3 模块间通信（可选）

某些场景需要模块协作，使用事件总线：

**场景：** 用户选择了航班后，酒店模块自动搜索到达城市的酒店

**实现：**
```javascript
// 机票模块发布事件
EventBus.emit('destination-selected', {
  city: "上海",
  date: "2025-12-02"
});

// 酒店模块订阅事件
EventBus.on('destination-selected', ({ city, date }) => {
  hotelModule.autoSearch({ city, checkIn: date });
});
```

---

## 十、实现建议

### 10.1 目录结构

```
project/
│
├── src/                          # 前端代码（根目录）
│   ├── components/               # 通用组件
│   │   ├── CardContainer.tsx    # 卡片容器（展开/折叠）
│   │   ├── ListCard.tsx         # 列表卡片
│   │   ├── DetailPanel.tsx      # 详情面板
│   │   └── ...
│   │
│   ├── layouts/                  # 布局模板
│   │   ├── ListDetailLayout.tsx
│   │   ├── CompactListLayout.tsx
│   │   ├── GridViewLayout.tsx
│   │   ├── MapViewLayout.tsx
│   │   └── ...
│   │
│   ├── adapters/                 # 数据适配器
│   │   ├── FlightAdapter.ts
│   │   ├── HotelAdapter.ts
│   │   └── ...
│   │
│   ├── styles/                   # 样式配置
│   │   ├── themes/              # 主题定义
│   │   │   ├── light.ts
│   │   │   ├── dark.ts
│   │   │   └── auto.ts
│   │   ├── card-styles/         # 卡片样式变体
│   │   │   ├── elevated.ts
│   │   │   ├── flat.ts
│   │   │   └── outlined.ts
│   │   └── density.ts           # 密度配置
│   │
│   ├── pages/                    # 页面组件
│   │   └── index.tsx
│   │
│   └── utils/                    # 前端工具函数
│       └── api-client.ts        # API 调用客户端
│
├── server/                       # 后端代码
│   ├── modules/                  # 模块定义（配置）
│   │   ├── flight_search/
│   │   │   ├── module.json      # 模块详细定义
│   │   │   └── adapter.ts       # 服务端适配器（如需要）
│   │   ├── hotel_search/
│   │   └── ...
│   │   └── all-modules.json     # 所有模块摘要（用于向量检索）
│   │
│   ├── apis/                     # API 实现
│   │   ├── flights/
│   │   │   ├── search.ts
│   │   │   ├── detail.ts
│   │   │   └── book.ts
│   │   ├── hotels/
│   │   └── ...
│   │
│   ├── mock/                     # Mock 数据
│   │   ├── flights_search.json
│   │   ├── flights_detail.json
│   │   ├── hotels_search.json
│   │   └── ...
│   │
│   ├── ai/                       # AI 相关
│   │   ├── retriever.ts         # 向量检索器
│   │   ├── prompt.ts            # Prompt 构建
│   │   ├── style-decision.ts    # 样式决策逻辑
│   │   └── executor.ts          # AI 调用和执行计划生成
│   │
│   ├── orchestrator/             # 总协调器
│   │   ├── plan-executor.ts     # 执行计划执行器
│   │   ├── api-executor.ts      # API 执行器（支持Mock）
│   │   └── module-loader.ts     # 模块加载器
│   │
│   ├── database/                 # 数据库相关
│   │   ├── vector-db.ts         # 向量数据库连接
│   │   └── cache.ts             # 缓存管理
│   │
│   └── index.ts                  # 后端入口
│
├── shared/                       # 前后端共享代码
│   ├── types/                    # 类型定义
│   │   ├── module.ts
│   │   ├── api.ts
│   │   ├── execution-plan.ts
│   │   └── style.ts
│   └── constants/                # 常量定义
│
├── package.json
├── tsconfig.json
└── README.md
```

**前后端职责划分：**

**前端（src/）：**
- UI 组件的实现
- 布局模板的实现
- 样式系统（主题、卡片样式、密度）
- 根据执行计划渲染界面
- 用户交互处理

**后端（server/）：**
- 模块定义和管理
- AI 决策（模块选择、样式决策）
- API 调用和执行
- 向量检索
- 执行计划生成

**共享（shared/）：**
- TypeScript 类型定义
- 前后端都需要的常量
- 协议定义

### 10.2 开发顺序

**阶段1：基础组件**
1. CardContainer（展开/折叠功能）
2. ListCard（通用列表卡片）
3. DetailPanel（通用详情面板）

**阶段2：布局和适配**
1. ListDetailLayout（第一个布局模板）
2. FlightAdapter（第一个适配器）
3. HotelAdapter（第二个适配器，验证复用）

**阶段3：模块和 API**
1. 定义 flight_search 模块
2. 实现 flights API（Mock 模式）
3. 集成测试

**阶段4：AI 集成**
1. 实现分层检索器
2. 实现执行计划生成
3. 集成 OpenAI/Claude API

**阶段5：扩展**
1. 添加更多模块
2. 添加特殊卡片类型
3. 优化和性能调优

### 10.3 技术栈建议

**前端：**
- React + TypeScript
- 状态管理：Zustand 或 Jotai
- UI 库：Tailwind CSS + shadcn/ui
- 动画：Framer Motion（卡片展开/折叠动画）

**后端：**
- Node.js + Express 或 Next.js API Routes
- 向量数据库：Chroma（本地）或 Pinecone（云端）
- AI：OpenAI API 或 Anthropic Claude API

**开发工具：**
- 类型校验：TypeScript strict mode
- 代码规范：ESLint + Prettier
- 测试：Vitest + React Testing Library

---

## 十一、关键设计原则

### 11.1 AI 只在开始时工作

AI 生成完整的执行计划后，所有后续交互都基于预配置的规则，不再询问 AI。

**好处：**
- 响应快速
- 成本低
- 用户体验确定

### 11.2 配置驱动，而非硬编码

模块的行为由配置文件定义，不写死在代码中。

**好处：**
- 易于扩展新模块
- 便于 A/B 测试
- 可热更新配置

### 11.3 组件复用，适配器差异

相同布局的模块复用组件，通过适配器处理数据差异。

**好处：**
- 减少代码量
- 统一用户体验
- 易于维护

### 11.4 分层检索，按需加载

模块定义分层存储，使用向量检索只加载相关部分。

**好处：**
- 节省 Token
- 提升速度
- 支持大规模模块库

### 11.5 实例隔离，松耦合

每个模块是独立实例，需要协作时通过事件通信。

**好处：**
- 避免状态污染
- 并发渲染
- 单独更新

---

## 十二、AI 样式决策系统

### 12.1 为什么让 AI 决定样式？

传统 UI 系统中，样式是由开发者预先定义的固定方案。但在我们的架构中，AI 可以根据：
- 用户的语言表达（"快速看一下" vs "详细对比"）
- 使用场景（移动端 vs 桌面端）
- 内容重要性（主要信息 vs 辅助信息）
- 用户偏好（简洁 vs 丰富）

动态选择最合适的展示方式，实现真正的智能化界面。

### 12.2 样式决策维度

**1. 布局选择（Layout）**
- list-detail: 列表+详情，适合桌面端详细查看
- compact-list: 紧凑列表，适合快速浏览、移动端
- grid-view: 网格布局，适合多选项对比
- map-view: 地图视图，适合地理位置相关
- dashboard: 仪表盘，适合数据展示

**2. 卡片样式（Card Style）**
- elevated: 浮起效果，视觉层次明显，适合重要内容
- flat: 扁平样式，简洁现代，适合次要内容
- outlined: 边框样式，适合表单或需要边界感的内容

**3. 主题色（Color Scheme）**
- auto: 自动适配（跟随系统）
- primary/blue: 标准主色，适合常规内容
- success/green: 成功、环保主题
- warning/yellow: 警告、需要注意的内容
- error/red: 错误、紧急内容

**4. 内容密度（Density）**
- comfortable: 舒适间距，适合详细阅读
- compact: 紧凑间距，适合快速浏览、信息量大时
- spacious: 宽松间距，适合重要信息、需要强调时

### 12.3 AI 决策示例

**场景1：用户说"快速看一下明天北京到上海的机票"**
```javascript
// AI 决策
{
  moduleId: "flight_search",
  style: {
    layout: "compact-list",      // "快速" → 紧凑布局
    density: "compact",          // 节省空间，快速浏览
    cardStyle: "flat"           // 简洁样式
  }
}
```

**场景2：用户说"帮我详细对比一下明天的航班，我要选最合适的"**
```javascript
// AI 决策
{
  moduleId: "flight_search",
  style: {
    layout: "list-detail",       // "详细对比" → 详情布局
    density: "comfortable",      // 舒适阅读
    cardStyle: "elevated"       // 突出显示，便于对比
  }
}
```

**场景3：用户说"界面简洁点，不要花里胡哨的"**
```javascript
// AI 决策
{
  globalStyle: {
    theme: "light",
    accentColor: "gray"          // 灰色系，低调
  },
  modules: [{
    style: {
      layout: "compact-list",
      cardStyle: "flat",          // 扁平简洁
      density: "compact"
    }
  }]
}
```

**场景4：用户说"这个很重要，要突出显示"**
```javascript
// AI 决策
{
  style: {
    cardStyle: "elevated",        // 浮起效果，突出
    colorScheme: "primary",       // 使用主色
    density: "spacious"          // 宽松间距，强调
  },
  priority: 1,                    // 设为最高优先级
  defaultExpanded: true           // 默认展开
}
```

### 12.4 实现方式

**1. 在模块定义中声明样式选项：**
```javascript
{
  id: "flight_search",
  layoutOptions: ["list-detail", "compact-list", "grid-view"],
  styleOptions: {
    cardStyle: ["elevated", "flat", "outlined"],
    colorScheme: ["auto", "blue", "green"],
    density: ["comfortable", "compact", "spacious"]
  }
}
```

**2. AI Prompt 中包含样式指导：**
```
在生成执行计划时，根据用户的表达选择合适的样式：

布局选择：
- 如果用户说"快速/简单/看一下" → compact-list
- 如果用户说"详细/对比/分析" → list-detail
- 如果用户说"有哪些选择" → grid-view

密度选择：
- 如果用户强调速度 → compact
- 如果用户强调详细 → comfortable
- 如果用户强调重要 → spacious

卡片样式：
- 如果是主要内容/重要信息 → elevated
- 如果是辅助内容/次要信息 → flat
- 如果是表单/需要边界 → outlined
```

**3. 前端样式系统：**
```typescript
// src/styles/style-renderer.ts
export function renderCardStyle(style: StyleConfig) {
  const layoutClass = layoutStyles[style.layout];
  const cardClass = cardStyles[style.cardStyle];
  const densityClass = densityStyles[style.density];
  const colorClass = colorSchemes[style.colorScheme];
  
  return {
    className: `${layoutClass} ${cardClass} ${densityClass} ${colorClass}`,
    style: {
      // CSS in JS
    }
  };
}
```

### 12.5 样式适配器

某些模块可能需要特殊的样式处理：

```typescript
// adapters/FlightAdapter.ts
export const FlightAdapter = {
  // ... 其他配置
  
  styleAdapter: {
    // 根据数据动态调整样式
    dynamicStyle: (data, baseStyle) => {
      // 如果航班数量很多，强制使用 compact
      if (data.length > 20) {
        return { ...baseStyle, density: "compact" };
      }
      
      // 如果有特价航班，使用成功色高亮
      if (data.some(f => f.isSpecialOffer)) {
        return { ...baseStyle, colorScheme: "success" };
      }
      
      return baseStyle;
    }
  }
}
```

### 12.6 用户可覆盖

虽然 AI 做出了样式决策，但用户仍可以手动调整：

```javascript
// 用户点击"切换视图"按钮
<ViewSwitcher 
  currentLayout={aiSelectedLayout}
  availableLayouts={module.layoutOptions}
  onChange={(newLayout) => {
    // 覆盖 AI 的选择
    updateModuleStyle(moduleId, { layout: newLayout });
  }}
/>
```

---

## 十三、完整实现细节与关键问题

### 13.1 前后端交互协议

#### 用户请求完整流程

```
用户浏览器
    ↓ 1. 发送自然语言请求
前端 (src/)
    ↓ 2. POST /api/ai/generate-plan
后端 (server/)
    ↓ 3. AI 处理（在后端进行）
    │   ├─ 向量检索模块
    │   ├─ AI 决策（OpenAI/Claude）
    │   ├─ 样式决策
    │   └─ 生成执行计划
    ↓ 4. 执行 initialApi 调用（并行）
    │   ├─ 真实 API 或
    │   └─ Mock 数据
    ↓ 5. 返回完整渲染数据
前端
    ↓ 6. 根据数据渲染卡片
    ↓ 7. 用户交互
    ↓ 8. POST /api/execute
后端
    ↓ 9. 执行对应 API（不再调用 AI）
    ↓ 10. 返回结果
前端
    └─ 11. 更新卡片内容
```

#### 关键接口定义

**1. 生成执行计划接口**
```typescript
// POST /api/ai/generate-plan
Request: {
  userInput: string;              // "订明天北京到上海的机票"
  context?: {                     // 可选的上下文
    deviceType: "desktop" | "mobile";
    previousModules?: string[];   // 之前使用过的模块
    userPreferences?: any;        // 用户偏好
  }
}

Response: {
  success: boolean;
  executionPlan: {
    globalStyle: {
      theme: "light" | "dark" | "auto";
      accentColor: string;
      pageLayout: "vertical" | "horizontal";
    };
    modules: Array<{
      instanceId: string;
      moduleId: string;
      priority: number;
      defaultExpanded: boolean;
      
      // AI 决策的样式
      style: {
        layout: string;
        cardStyle: string;
        colorScheme: string;
        density: string;
      };
      
      // 已经加载好的初始数据
      data: any;
      
      // 模块配置（前端渲染需要）
      moduleConfig: {
        name: string;
        layoutOptions: string[];
        // ... 其他配置
      };
      
      // 交互 API 映射
      interactionApis: {
        [action: string]: {
          apiId: string;
          endpoint: string;
          method: string;
          parameterTemplate: any;
        }
      };
    }>;
  };
  error?: string;
}
```

**2. 执行交互接口**
```typescript
// POST /api/execute
Request: {
  instanceId: string;             // 哪个模块实例
  action: string;                 // 哪个交互动作（如 "onItemClick"）
  context: any;                   // 上下文数据（如选中的项）
}

Response: {
  success: boolean;
  data: any;
  error?: string;
}
```

### 13.2 完全 Mock 实现方案

#### Mock 层级

**第1层：AI Mock（模拟 AI 决策）**
```typescript
// server/ai/mock-ai.ts
export class MockAI {
  // 模拟 AI 的模块选择和样式决策
  async generatePlan(userInput: string) {
    // 简单的关键词匹配代替向量检索
    const keywords = {
      "机票|航班|飞机": "flight_search",
      "酒店|住宿|订房": "hotel_search",
      "天气": "weather_info",
    };
    
    // 匹配模块
    let selectedModules = [];
    for (const [pattern, moduleId] of Object.entries(keywords)) {
      if (new RegExp(pattern).test(userInput)) {
        selectedModules.push(moduleId);
      }
    }
    
    // 样式决策（简单规则）
    const styleDecision = {
      layout: userInput.includes("快速") ? "compact-list" : "list-detail",
      density: userInput.includes("详细") ? "comfortable" : "compact",
      cardStyle: userInput.includes("简洁") ? "flat" : "elevated",
    };
    
    return {
      modules: selectedModules.map((moduleId, index) => ({
        moduleId,
        priority: index + 1,
        style: styleDecision,
        // ...
      }))
    };
  }
}
```

**第2层：API Mock**
```typescript
// server/mock/mock-executor.ts
export class MockAPIExecutor {
  async execute(apiId: string, parameters: any) {
    // 读取 mock 数据文件
    const mockData = await this.loadMockData(apiId);
    
    // 模拟网络延迟
    await this.delay(mockData.delay || 300);
    
    // 动态参数替换
    return this.processTemplate(mockData.response, parameters);
  }
  
  private processTemplate(template: any, params: any) {
    let json = JSON.stringify(template);
    
    // 替换 ${params.xxx} 占位符
    Object.entries(params).forEach(([key, value]) => {
      json = json.replace(
        new RegExp(`\\$\\{params\\.${key}\\}`, 'g'),
        String(value)
      );
    });
    
    return JSON.parse(json);
  }
}
```

**第3层：完整 Mock 模式开关**
```typescript
// server/config.ts
export const config = {
  mode: process.env.MODE || "mock",  // mock | real | hybrid
  
  ai: {
    useMock: process.env.AI_MOCK === "true",
    apiKey: process.env.OPENAI_API_KEY,
  },
  
  api: {
    useMock: process.env.API_MOCK === "true",
  }
};

// server/orchestrator/orchestrator.ts
export class Orchestrator {
  private aiService: AIService | MockAI;
  private apiExecutor: APIExecutor | MockAPIExecutor;
  
  constructor() {
    // 根据配置选择真实或 Mock
    this.aiService = config.ai.useMock 
      ? new MockAI() 
      : new RealAI();
      
    this.apiExecutor = config.api.useMock
      ? new MockAPIExecutor()
      : new RealAPIExecutor();
  }
}
```

#### Mock 数据示例

```json
// server/mock/flights_search.json
{
  "delay": 500,
  "response": [
    {
      "id": "flight_${params.from}_${params.to}_1",
      "flightNumber": "CZ3001",
      "airline": "南航",
      "from": "${params.from}",
      "to": "${params.to}",
      "date": "${params.date}",
      "departure": "08:00",
      "arrival": "10:30",
      "price": 580,
      "seats": 120
    },
    {
      "id": "flight_${params.from}_${params.to}_2",
      "flightNumber": "MU5001",
      "airline": "东航",
      "from": "${params.from}",
      "to": "${params.to}",
      "date": "${params.date}",
      "departure": "09:30",
      "arrival": "12:00",
      "price": 620,
      "seats": 85
    }
  ]
}
```

### 13.3 前端容错和降级

#### 前端不完全依赖后端

```typescript
// src/components/CardContainer.tsx
export function CardContainer({ 
  moduleData,
  onRetry 
}: CardContainerProps) {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  
  // 前端有基本的容错逻辑
  useEffect(() => {
    if (!moduleData) {
      setState('error');
    } else if (moduleData.data) {
      setState('success');
    }
  }, [moduleData]);
  
  // 错误状态：显示占位符和重试按钮
  if (state === 'error') {
    return (
      <Card>
        <ErrorPlaceholder 
          message="模块加载失败"
          onRetry={onRetry}
        />
      </Card>
    );
  }
  
  // 加载状态：显示骨架屏
  if (state === 'loading') {
    return <CardSkeleton />;
  }
  
  // 成功状态：正常渲染
  return <CardContent data={moduleData} />;
}
```

#### 前端降级方案

```typescript
// src/utils/fallback.ts
export class FallbackHandler {
  // 如果 AI 返回的样式配置无效，使用默认配置
  static getValidStyle(style: StyleConfig, moduleConfig: ModuleConfig) {
    const validLayout = moduleConfig.layoutOptions.includes(style.layout)
      ? style.layout
      : moduleConfig.defaultLayout;
      
    return {
      layout: validLayout,
      cardStyle: style.cardStyle || "elevated",
      density: style.density || "comfortable",
      colorScheme: style.colorScheme || "auto",
    };
  }
  
  // 如果模块加载失败，使用简化版本
  static getSimplifiedModule(moduleId: string) {
    return {
      instanceId: `${moduleId}-fallback`,
      moduleId: moduleId,
      style: {
        layout: "compact-list",
        cardStyle: "flat",
        density: "compact",
      },
      data: [],
      error: "使用简化模式"
    };
  }
}
```

### 13.4 AI 处理位置（明确在后端）

#### 为什么 AI 必须在后端？

**1. 安全性**
- API Key 不能暴露在前端
- 防止滥用和盗用

**2. 成本控制**
- 统一计费和限流
- 缓存 AI 响应

**3. 数据隐私**
- 用户数据不经过第三方
- 可以做数据脱敏

**4. 性能优化**
- 服务端缓存结果
- 批量处理请求

#### 后端 AI 服务架构

```typescript
// server/ai/ai-service.ts
export class AIService {
  private client: OpenAI | Anthropic;
  private cache: Cache;
  private rateLimiter: RateLimiter;
  
  async generateExecutionPlan(userInput: string, context?: any) {
    // 1. 检查缓存
    const cacheKey = this.getCacheKey(userInput, context);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    // 2. 检查限流
    await this.rateLimiter.check(context.userId);
    
    // 3. 向量检索模块
    const relevantModules = await this.vectorRetriever.search(userInput);
    
    // 4. 构建 Prompt
    const prompt = this.buildPrompt(userInput, relevantModules, context);
    
    // 5. 调用 AI
    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      messages: prompt,
      functions: [this.executionPlanFunction],
      function_call: { name: "generate_execution_plan" }
    });
    
    // 6. 解析执行计划
    const plan = this.parseResponse(response);
    
    // 7. 缓存结果
    await this.cache.set(cacheKey, plan, 3600); // 缓存1小时
    
    return plan;
  }
}
```

### 13.5 未考虑到的问题及解决方案

#### 问题1：并发和性能

**问题：** 多个模块的 initialApi 并行调用，如果有几十个模块怎么办？

**解决：**
```typescript
// server/orchestrator/plan-executor.ts
export class PlanExecutor {
  async execute(plan: ExecutionPlan) {
    // 分批执行，避免并发过高
    const batches = this.chunk(plan.modules, 5); // 每批5个
    
    const results = [];
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(m => this.executeModule(m))
      );
      results.push(...batchResults);
    }
    
    return results;
  }
}
```

#### 问题2：错误处理和重试

**问题：** API 调用失败、AI 返回格式错误、网络超时等

**解决：**
```typescript
// server/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options = { maxRetries: 3, delay: 1000 }
): Promise<T> {
  for (let i = 0; i < options.maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === options.maxRetries - 1) throw error;
      await sleep(options.delay * (i + 1)); // 指数退避
    }
  }
}

// 使用
const data = await withRetry(() => 
  apiExecutor.execute(apiId, params)
);
```

#### 问题3：用户反馈循环

**问题：** AI 选择的模块或样式不符合用户期望怎么办？

**解决：**
```typescript
// 用户可以提供反馈
// POST /api/feedback
{
  executionPlanId: "plan-123",
  feedback: {
    moduleId: "flight_search",
    issue: "layout_not_suitable",  // 布局不合适
    suggestion: "compact-list"      // 用户建议
  }
}

// 后端记录反馈，用于优化 AI Prompt
// server/ai/feedback-optimizer.ts
export class FeedbackOptimizer {
  async learn(feedback: Feedback) {
    // 记录用户反馈
    await this.storage.saveFeedback(feedback);
    
    // 调整 AI 决策权重
    await this.adjustWeights(feedback);
  }
}
```

#### 问题4：实时更新

**问题：** 某些数据需要实时更新（如价格变动、库存变化）

**解决：**
```typescript
// 使用 WebSocket 或 Server-Sent Events
// server/realtime/price-monitor.ts
export class PriceMonitor {
  watchModule(instanceId: string, apiId: string) {
    // 定期检查数据变化
    setInterval(async () => {
      const newData = await this.fetchLatestData(apiId);
      if (this.hasChanged(newData)) {
        // 推送更新到前端
        this.wsServer.emit(instanceId, {
          type: 'data_update',
          data: newData
        });
      }
    }, 30000); // 每30秒检查一次
  }
}

// 前端监听
const ws = new WebSocket('ws://server/realtime');
ws.on('data_update', (update) => {
  updateModuleData(update.instanceId, update.data);
});
```

#### 问题5：个性化和学习

**问题：** 如何让系统越用越懂用户？

**解决：**
```typescript
// server/ai/personalization.ts
export class PersonalizationService {
  async enhanceContext(userId: string, userInput: string) {
    // 获取用户历史
    const history = await this.getUserHistory(userId);
    
    // 分析用户偏好
    const preferences = {
      preferredLayout: this.analyzeLayoutPreference(history),
      preferredModules: this.analyzeModuleUsage(history),
      preferredDensity: this.analyzeDensityPreference(history),
    };
    
    // 增强 AI 上下文
    return {
      userInput,
      context: {
        preferences,
        recentModules: history.recentModules,
        deviceType: history.commonDevice,
      }
    };
  }
}
```

#### 问题6：安全性

**问题：** 防止恶意请求、注入攻击

**解决：**
```typescript
// server/middleware/security.ts
export function securityMiddleware() {
  return [
    // 1. 限流
    rateLimit({
      windowMs: 60000,
      max: 10 // 每分钟最多10次请求
    }),
    
    // 2. 输入验证
    validate({
      userInput: {
        type: 'string',
        maxLength: 500,  // 限制输入长度
        sanitize: true   // 清理特殊字符
      }
    }),
    
    // 3. API Key 验证
    authenticateAPIKey(),
    
    // 4. CSRF 保护
    csrfProtection()
  ];
}
```

### 13.6 开发调试模式

```typescript
// server/config.ts
export const devConfig = {
  // 开发模式：显示详细日志
  debug: true,
  
  // AI 调试：保存 AI 的输入输出
  ai: {
    savePrompts: true,      // 保存 Prompt
    saveResponses: true,    // 保存响应
    logDir: './logs/ai'
  },
  
  // API 调试：记录所有 API 调用
  api: {
    logRequests: true,
    logResponses: true,
    logDir: './logs/api'
  },
  
  // Mock 模式下的快捷切换
  mockOverrides: {
    "flight_search": "real",  // 这个模块用真实 API
    "hotel_search": "mock"    // 这个模块用 Mock
  }
};
```

---

## 十四、扩展性考虑

### 14.1 新增模块

只需要：
1. 创建模块配置文件
2. 如果是新布局，创建对应的 Adapter
3. 如果复用现有布局，直接使用现有组件
4. 添加 Mock 数据
5. 更新向量数据库索引

### 14.2 新增布局类型

1. 创建新的 Layout 组件
2. 创建对应的 Adapter 接口规范
3. 在 LayoutRenderer 中注册
4. 实现具体模块的 Adapter

### 14.3 支持更多 AI 模型

执行计划生成器支持切换 AI 模型：
- OpenAI GPT-4
- Anthropic Claude
- 本地大模型（如 Llama）

只需要适配 Function Calling 格式即可。

### 14.4 国际化支持

模块配置支持多语言：
```javascript
{
  name: {
    zh: "机票搜索",
    en: "Flight Search"
  },
  description: {
    zh: "搜索和预订航班",
    en: "Search and book flights"
  }
}
```

---

## 十五、总结

本架构通过**智能化 + 模块化设计**实现了：

1. **AI 智能决策：** 不仅选择功能模块，还决定展示样式、布局方式，实现真正的智能化界面
2. **向量检索：** 直接从所有模块中检索，无需人为分类，AI 自主决策
3. **代码高复用：** 组件复用减少重复，适配器处理差异，大幅减少代码量
4. **样式智能化：** AI 根据用户意图动态选择最合适的布局、主题、密度
5. **前后端分离：** 清晰的目录结构，职责明确，AI 处理在后端
6. **完全 Mock 支持：** 包括 AI Mock 和 API Mock，无需真实服务即可开发
7. **容错和降级：** 前端不完全依赖后端，有完善的错误处理
8. **卡片式布局：** 优先级展示，展开/折叠，流畅交互

**核心优势：**
- ✅ AI 一次性决策（功能 + 样式），无需多轮对话
- ✅ AI 处理在后端（安全、成本可控、可缓存）
- ✅ 智能向量检索，无需人工分类
- ✅ AI 控制样式，根据场景自适应
- ✅ 前端有容错能力，不完全依赖后端
- ✅ 完整的 Mock 方案，包括 AI Mock
- ✅ 模块化设计，高度可复用
- ✅ 前后端分离，架构清晰
- ✅ 考虑了性能、安全、错误处理等实际问题

**关键创新点：**
1. **去分类化：** AI 直接从全部模块中智能检索，而非预设分类
2. **样式智能化：** AI 不仅决定"展示什么"，还决定"如何展示"
3. **一次性编排：** 所有决策（模块、API、样式）一次完成
4. **完全配置驱动：** 新增功能只需添加配置，无需修改核心代码
5. **AI Mock 机制：** 通过简单规则模拟 AI 决策，便于开发调试
6. **前端智能降级：** 后端失败时前端仍能工作

**明确回答实现问题：**

**Q1: 其他 AI 能根据这个文档准确实现吗？**
A: 可以。文档包含了：
- 完整的架构设计和理念
- 详细的前后端交互协议
- 具体的数据结构定义
- Mock 实现方案
- 错误处理和容错机制
- 目录结构和职责划分

**Q2: 后端完全用模拟能实现吗？**
A: 可以。通过两层 Mock：
- AI Mock：用关键词匹配模拟 AI 的模块选择和样式决策
- API Mock：用 JSON 文件模拟 API 返回数据
- 支持动态参数替换和延迟模拟

**Q3: 前端完全依赖后端吗？**
A: 不完全依赖。前端有：
- 错误状态处理和重试机制
- 加载骨架屏
- 样式降级方案
- 模块加载失败的占位符

**Q4: AI 在后端处理吗？**
A: 是的，必须在后端，原因：
- 保护 API Key 安全
- 控制成本和限流
- 缓存 AI 响应
- 数据隐私保护

**Q5: 考虑了哪些额外问题？**
A: 包括但不限于：
- 并发性能和批量处理
- 错误重试和指数退避
- 用户反馈和持续优化
- 实时数据更新（WebSocket）
- 个性化和学习能力
- 安全防护（限流、验证、CSRF）
- 开发调试模式

**开始实现时，请遵循本文档的架构设计，特别注意：**
- AI 的完全决策权（功能 + 样式）
- AI 处理必须在后端
- 前端的容错和降级能力
- 向量检索的直接性（无需分类层）
- 完整的 Mock 支持（AI + API）
- 前后端的明确分离
- 样式系统的可扩展性
- 性能和安全的考虑

