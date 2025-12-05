# CardFlow AI

AI 驱动的模块化界面生成系统

## 项目简介

CardFlow AI 是一个创新的智能界面生成系统，用户只需通过自然语言输入需求，AI 会一次性生成完整的执行计划，包括：

- 需要展示哪些模块（功能卡片）
- 为什么推荐这些模块（AI Reasoning）
- 每个模块的优先级、初始状态、展示样式
- 每个模块需要调用的 API 及参数
- 用户交互时的 API 映射规则
- 页面的整体布局方式和主题风格

## 核心特性

✅ **真实 AI 驱动** - 集成 Cerebras AI (Llama 3.1 70B)，具备强大的意图理解和推理能力
✅ **AI 完全控制** - AI 不仅决定展示什么内容，还决定如何展示（样式、布局、主题）
✅ **智能推荐理由** - 每个卡片都带有 AI 生成的推荐理由，让用户理解为何展示
✅ **一次性决策** - AI 只在开始时工作，后续交互基于预配置规则，响应快速
✅ **横向流式体验** - 统一的横向滑动卡片设计，符合移动端交互习惯
✅ **模块化设计** - 高度可复用的组件和适配器架构
✅ **TypeScript 严格模式** - 完整的类型安全保障

## 技术栈

**前端：**
- React 18 + TypeScript
- Vite（构建工具）
- Tailwind CSS（样式）
- Zustand（状态管理）
- 移动端优先的响应式设计

**后端：**
- Node.js + Express + TypeScript
- Cerebras AI（LLM 推理）
- Vector Search (基于余弦相似度的本地向量检索)
- Mock API 数据（模拟后端业务服务）

## 快速开始

### 1. 安装依赖

```bash
yarn install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并配置 Cerebras API Key（如果使用真实 AI）：

```env
CEREBRAS_API_KEY=your_api_key_here
```

### 3. 启动服务

```bash
# 同时启动前端和后端
yarn dev

# 或分别启动
yarn dev:client  # 前端 http://localhost:5173
yarn dev:server  # 后端 http://localhost:3000
```

### 4. 访问应用

打开浏览器访问：http://localhost:5173

## 使用示例

在输入框中输入自然语言需求，例如：

- "订明天北京到上海的机票"
- "快速看一下上海的酒店"
- "查询上海的天气"
- "订后天广州到深圳的机票，顺便看看酒店和天气"

AI 会自动：
1. 分析需求，通过向量检索找到最相关的模块
2. 生成执行计划，决定模块组合和参数
3. 提供推荐理由（Reasoning）
4. 生成完整界面

## 界面设计

### 统一横向滑动卡片 (Horizontal Scrollable Cards)

系统采用统一的横向滑动卡片设计，所有模块（机票、酒店、商品、地图等）都遵循一致的交互模式：

- **完整展示**：每个卡片项都展示完整的信息（如航班号、时间、价格、Logo），不再区分"当前项/待看项"。
- **横向滑动**：通过左右滑动查看更多内容，符合直觉。
- **视觉提示**：右侧露出下一个卡片的边缘，暗示可滑动。
- **Snap 效果**：滑动时自动对齐，体验流畅。

### 模块分类

虽然交互统一，但在数据展示上分为四类：

#### 🎴 列表类 (Horizontal List)
- **Flight**: 航班信息，包含起降时间、价格、航空公司。
- **Shopping**: 商品信息，包含图片、价格、名称。
- **Yelp**: 餐厅信息，包含评分、菜系、图片。
- **Videos/Images**: 媒体资源列表。

#### 📰 信息类 (Info Display)
- **InfoCard**: 新闻、百科、知识片段，展示标题、摘要和来源。

#### 🎛️ 交互类 (Interactive Action)
- **GeneralAgent**: 应用操作入口（如 Gmail, Calendar）。
- **OrchestrationAgent**: 复杂工作流步骤展示。

#### 🗺️ 地图类 (Map View)
- **MeetingView**: 地点推荐，包含地图缩略图、地址、距离。

## 项目结构

```
cardflow-ai/
├── src/                # 前端代码
│   ├── components/     # 通用组件
│   ├── layouts/        # 布局模板 (LayoutRenderer)
│   ├── modules/        # 模块渲染
│   ├── pages/          # 页面
│   ├── store/          # 状态管理
│   ├── styles/         # 样式系统
│   └── utils/          # 工具函数
│
├── server/             # 后端代码
│   ├── ai/            # AI 相关 (Executor, PromptBuilder, VectorRetriever)
│   ├── config/        # 配置
│   ├── modules/       # 模块定义 (Registry)
│   ├── mock-data/     # Mock 业务数据
│   ├── orchestrator/  # 协调器
│   ├── routes/        # 路由
│   └── middleware/    # 中间件
│
└── shared/            # 前后端共享代码
    ├── types/         # 类型定义 (ModuleInstance, ExecutionPlan)
    └── constants/     # 常量定义
```

## 扩展开发

### 添加新模块

1. 在 `server/modules/registry/` 创建模块定义 JSON
2. 在 `server/mock-data/` 添加 Mock 数据
3. 更新 `server/modules/registry/all-modules.json` 添加摘要
4. 在 `server/ai/executor.ts` 中配置 API 映射（如需）

### 添加新布局

目前系统推荐使用统一的 `horizontal-scrollable-list` 布局，但可以通过扩展 `LayoutRenderer.tsx` 支持更多布局。

## 文档

- [完整架构设计文档](./AI模块化架构设计文档.md)

## License

MIT

---

**CardFlow AI** - 让 AI 智能生成界面，而不仅仅是内容
