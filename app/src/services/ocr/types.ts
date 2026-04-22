import type { ReportItem } from '@/types';

/**
 * OCR Provider 抽象：从图片中提取文字 + 结构化报告指标。
 */

export interface OCRResult {
  /** 原始 OCR 文本 */
  rawText: string;
  /** 解析出的结构化指标（若模型支持则非空） */
  items: ReportItem[];
  /** AI 对报告的点评（可选） */
  aiNotes?: string;
  /** 报告标题猜测 */
  title?: string;
  /** 医院名称 */
  hospital?: string;
  /** 检查日期（ISO） */
  examinedAt?: string;
}

export interface IOCRProvider {
  readonly name: string;
  /** 识别一张图片（dataURL 或 URL） */
  recognize(imageDataUrl: string, signal?: AbortSignal): Promise<OCRResult>;
}
