import { QwenProvider } from './qwen-provider';
import type { IAIProvider } from './types';
import { getRuntimeConfig } from '@/lib/config';

export * from './types';
export { QwenProvider } from './qwen-provider';

let cached: IAIProvider | null = null;

/**
 * 获取默认 AI Provider。
 * 选型通过 runtime config 切换（当前仅支持 qwen）。
 */
export function getAIProvider(): IAIProvider {
  if (cached) return cached;
  const cfg = getRuntimeConfig();
  cached = new QwenProvider({
    apiKey: cfg.qwenApiKey,
    baseUrl: cfg.qwenBaseUrl,
    model: cfg.qwenTextModel,
  });
  return cached;
}

/** 清缓存（用户改了 Key 之后需要调用） */
export function resetAIProvider(): void {
  cached = null;
}
