import { AIProviderError, type ChatMessage, type CompletionOptions, type IAIProvider } from './types';

/**
 * 阿里通义千问 OpenAI 兼容接口 Provider。
 * 文档：https://help.aliyun.com/zh/model-studio/developer-reference/compatibility-of-openai-with-dashscope
 *
 * 注意：纯本地化（浏览器直连）模式下 API Key 会随前端下发。仅适用于：
 *   - 演示 / 内部使用
 *   - 用户自填 Key（见设置页）
 * 生产化时应迁到服务端或使用 STS 临时凭证。
 */

export interface QwenProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DEFAULT_MODEL = 'qwen-plus';

export class QwenProvider implements IAIProvider {
  readonly name = 'qwen';
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(config: QwenProviderConfig) {
    if (!config.apiKey) {
      throw new AIProviderError('[QwenProvider] 缺少 apiKey。请在设置页填入或配置 VITE_QWEN_API_KEY');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.model = config.model || DEFAULT_MODEL;
  }

  async complete(messages: ChatMessage[], options: CompletionOptions = {}): Promise<string> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.3,
    };
    if (options.maxTokens) body.max_tokens = options.maxTokens;
    if (options.responseJson) body.response_format = { type: 'json_object' };

    const resp = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new AIProviderError(
        `[QwenProvider] 请求失败 ${resp.status}: ${text.slice(0, 300)}`,
        resp.status,
        text,
      );
    }

    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new AIProviderError('[QwenProvider] 响应格式异常：未找到 content', resp.status, data);
    }
    return content;
  }
}
