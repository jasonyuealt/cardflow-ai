/**
 * 日志中间件
 */

import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // 记录响应
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    
    console.log(
      `${color}${req.method}\x1b[0m ${req.path} - ${status} (${duration}ms)`
    );
  });

  next();
}

