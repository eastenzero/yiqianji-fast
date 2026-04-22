import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind 类名合并工具 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 生成本地唯一 ID（不依赖 crypto.randomUUID 以兼容旧浏览器） */
export function uid(prefix = ''): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}${prefix ? '_' : ''}${ts}_${rand}`;
}

/** 把 File 转成 base64 (data URL) */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** 友好日期：今日 / 昨日 / 3 天前 / YYYY-MM-DD */
export function formatFriendlyDate(d: Date | string | number): string {
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0);
  const day = 24 * 60 * 60 * 1000;
  if (diffMs === 0) return '今天';
  if (diffMs === day) return '昨天';
  if (diffMs > 0 && diffMs < 7 * day) return `${diffMs / day} 天前`;
  return date.toISOString().slice(0, 10);
}

/** 异步睡眠，用于 demo 节流与避免打爆 API */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
