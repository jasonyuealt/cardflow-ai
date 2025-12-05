/**
 * 重试工具函数
 */

import { delay } from './delay';

export interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  exponentialBackoff?: boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, delayMs: 1000, exponentialBackoff: true }
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < options.maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === options.maxRetries - 1) {
        throw lastError;
      }

      const waitTime = options.exponentialBackoff
        ? options.delayMs * Math.pow(2, i)
        : options.delayMs;

      console.log(`重试 ${i + 1}/${options.maxRetries}，等待 ${waitTime}ms...`);
      await delay(waitTime);
    }
  }

  throw lastError!;
}

