/**
 * 服务器配置
 */

export class ServerConfig {
  port: number;
  corsOrigin: string;

  constructor() {
    this.port = parseInt(process.env.SERVER_PORT || '3000');
    this.corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  }
}

export const serverConfig = new ServerConfig();

