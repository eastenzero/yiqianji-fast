/**
 * AI Provider 抽象：文本生成能力。
 * 未来可新增 DeepSeekProvider、OpenAIProvider 等，调用方仅依赖接口。
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  /** 温度，默认 0.3（摘要类任务低温度） */
  temperature?: number;
  /** 最大输出 token */
  maxTokens?: number;
  /** 中止信号 */
  signal?: AbortSignal;
  /** 是否请求 JSON 响应 */
  responseJson?: boolean;
}

export interface IAIProvider {
  /** 提供商名称，如 "qwen" / "deepseek" */
  readonly name: string;
  /** 一次性返回完整文本 */
  complete(messages: ChatMessage[], options?: CompletionOptions): Promise<string>;
  /** 流式输出（可选，未对接前可不实现） */
  stream?(messages: ChatMessage[], options?: CompletionOptions): AsyncIterable<string>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly raw?: unknown,
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}
