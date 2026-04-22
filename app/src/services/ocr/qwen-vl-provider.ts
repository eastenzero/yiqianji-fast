import { AIProviderError } from '../ai/types';
import type { IOCRProvider, OCRResult } from './types';

/**
 * 通义千问 VL 多模态 OCR 实现。
 * 复用 OpenAI 兼容接口 /chat/completions，支持 image_url 内容块。
 */

export interface QwenVLProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DEFAULT_MODEL = 'qwen-vl-plus';

const SYSTEM_PROMPT = `你是一名医学影像与检查报告识别助手。请从用户提供的医疗检查报告图片中提取信息，严格按以下 JSON 格式返回（不要添加任何额外说明文字、不要使用 markdown 代码块）：

{
  "title": "报告标题（如'血常规检查报告'）",
  "hospital": "医院名称（若识别不到留空字符串）",
  "examinedAt": "检查日期 ISO 格式 YYYY-MM-DD（若识别不到留空字符串）",
  "rawText": "整张报告的全部文本（OCR 原文）",
  "items": [
    {
      "name": "指标名称",
      "value": "数值",
      "unit": "单位（可空）",
      "reference": "参考范围（可空）",
      "abnormal": "high | low | normal（根据参考范围判断）"
    }
  ],
  "aiNotes": "对报告异常项的简要提示（≤ 80 字，仅作信息整理不作诊断）"
}

规则：
1. 只返回 JSON，不要 \`\`\`json 包裹。
2. 若图片非医疗报告，将 items 设为空数组，在 aiNotes 中说明。
3. abnormal 的判断：数值超出参考范围上限为 high，低于下限为 low，否则 normal。
4. 不得做诊断结论，仅做信息整理。`;

export class QwenVLProvider implements IOCRProvider {
  readonly name = 'qwen-vl';
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(config: QwenVLProviderConfig) {
    if (!config.apiKey) {
      throw new AIProviderError('[QwenVLProvider] 缺少 apiKey');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.model = config.model || DEFAULT_MODEL;
  }

  async recognize(imageDataUrl: string, signal?: AbortSignal): Promise<OCRResult> {
    const body = {
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageDataUrl } },
            { type: 'text', text: '请识别上述报告图片并按 JSON 格式输出。' },
          ],
        },
      ],
      temperature: 0.1,
    };

    const resp = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new AIProviderError(
        `[QwenVLProvider] 请求失败 ${resp.status}: ${text.slice(0, 300)}`,
        resp.status,
        text,
      );
    }

    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content || '';
    return this.parseResponse(content);
  }

  private parseResponse(content: string): OCRResult {
    // 模型有时会带 ```json 包裹，做兜底清洗
    const cleaned = content
      .replace(/^\s*```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned) as OCRResult;
      return {
        rawText: parsed.rawText || '',
        items: Array.isArray(parsed.items) ? parsed.items : [],
        aiNotes: parsed.aiNotes,
        title: parsed.title,
        hospital: parsed.hospital,
        examinedAt: parsed.examinedAt,
      };
    } catch {
      // 解析失败兜底：把原文塞回 rawText
      return {
        rawText: content,
        items: [],
        aiNotes: '结构化解析失败，已保留原始文本。',
      };
    }
  }
}
