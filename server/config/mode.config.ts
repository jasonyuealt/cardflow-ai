/**
 * 模式配置（Mock/Real）
 */

// 加载环境变量（必须在最开始）
import 'dotenv/config';

export type AppMode = 'mock' | 'real' | 'hybrid';

export class ModeConfig {
  mode: AppMode;
  aiMock: boolean;
  apiMock: boolean;

  constructor() {
    this.mode = (process.env.MODE as AppMode) || 'mock';
    this.aiMock = process.env.AI_MOCK === 'true' || this.mode === 'mock';
    this.apiMock = process.env.API_MOCK === 'true' || this.mode === 'mock';

    console.log(`\n🚀 启动模式: ${this.mode}`);
    console.log(`   AI Mock: ${this.aiMock ? '✓' : '✗'}`);
    console.log(`   API Mock: ${this.apiMock ? '✓' : '✗'}`);
    console.log(`   环境变量 MODE: ${process.env.MODE}`);
    console.log(`   环境变量 AI_MOCK: ${process.env.AI_MOCK}\n`);
  }
}

export const modeConfig = new ModeConfig();

