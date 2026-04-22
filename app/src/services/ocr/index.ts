import { QwenVLProvider } from './qwen-vl-provider';
import type { IOCRProvider } from './types';
import { getRuntimeConfig, getOCRApiKey, PROVIDERS } from '@/lib/config';

export * from './types';
export { QwenVLProvider } from './qwen-vl-provider';

let cached: IOCRProvider | null = null;

/**
 * OCR 固定走阿里通义 VL（DashScope），不随主 Provider 切换。
 * 这样即使用户主 AI 选了 OpenAI / DeepSeek，报告识别依然可用。
 */
export function getOCRProvider(): IOCRProvider {
  if (cached) return cached;
  const cfg = getRuntimeConfig();
  cached = new QwenVLProvider({
    apiKey: getOCRApiKey(),
    baseUrl: PROVIDERS.qwen.baseUrl, // 固定 dashscope，忽略主 provider 的 baseUrl
    model: cfg.qwenVlModel,
  });
  return cached;
}

export function resetOCRProvider(): void {
  cached = null;
}
