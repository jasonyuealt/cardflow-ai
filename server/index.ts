/**
 * 后端服务入口
 */

import express from 'express';
import cors from 'cors';
import { serverConfig } from './config/server.config';
import { modeConfig } from './config/mode.config';
import { logger } from './middleware/logger';
import { errorHandler } from './middleware/error-handler';
import aiRouter from './routes/ai.route';
import apiRouter from './routes/api.route';

const app = express();

// 中间件
app.use(cors({ origin: serverConfig.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// 路由
app.use('/api/ai', aiRouter);
app.use('/api', apiRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: modeConfig.mode,
    timestamp: new Date().toISOString(),
  });
});

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(serverConfig.port, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 CardFlow AI 后端服务已启动');
  console.log(`   端口: ${serverConfig.port}`);
  console.log(`   模式: ${modeConfig.mode}`);
  console.log(`   AI Mock: ${modeConfig.aiMock ? '开启' : '关闭'}`);
  console.log(`   API Mock: ${modeConfig.apiMock ? '开启' : '关闭'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

export default app;

