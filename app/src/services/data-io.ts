/**
 * 数据导入 / 导出。
 * 把 IndexedDB 里的全部业务数据打包成 JSON 文件，用户可以随时下载本地备份，
 * 也可以把别人给的 / 自己之前备份的 JSON 导入回来。
 *
 * 格式：
 *   {
 *     "app": "yiqianji",
 *     "version": 1,
 *     "exportedAt": 1712345678,
 *     "data": {
 *       "patients":    [...],
 *       "vitals":      [...],
 *       "symptoms":    [...],
 *       "medications": [...],
 *       "lifestyles":  [...],
 *       "reports":     [...],
 *       "summaries":   [...]
 *     }
 *   }
 */

import { db } from './storage/db';
import { wipeAllData } from './seed';
import type {
  Patient,
  VitalRecord,
  SymptomRecord,
  MedicationRecord,
  LifestyleRecord,
  MedicalReport,
  ConsultationSummary,
} from '@/types';

export const EXPORT_VERSION = 1;
export const EXPORT_APP = 'yiqianji';

export interface ExportBundle {
  app: typeof EXPORT_APP;
  version: number;
  exportedAt: number;
  data: {
    patients: Patient[];
    vitals: VitalRecord[];
    symptoms: SymptomRecord[];
    medications: MedicationRecord[];
    lifestyles: LifestyleRecord[];
    reports: MedicalReport[];
    summaries: ConsultationSummary[];
  };
}

/** 导出当前本地数据库为结构化对象 */
export async function exportAllData(): Promise<ExportBundle> {
  const [patients, vitals, symptoms, medications, lifestyles, reports, summaries] =
    await Promise.all([
      db.patients.toArray(),
      db.vitals.toArray(),
      db.symptoms.toArray(),
      db.medications.toArray(),
      db.lifestyles.toArray(),
      db.reports.toArray(),
      db.summaries.toArray(),
    ]);

  return {
    app: EXPORT_APP,
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    data: { patients, vitals, symptoms, medications, lifestyles, reports, summaries },
  };
}

/** 触发浏览器下载 JSON 文件 */
export async function downloadJSON(filename?: string): Promise<void> {
  const bundle = await exportAllData();
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  a.download = filename || `yiqianji_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // 下一个事件循环再释放，确保下载启动
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** 从字符串导入（通常来自 FileReader 读出的 JSON 文本） */
export async function importAllData(
  jsonText: string,
  options: { mode?: 'replace' | 'merge' } = {},
): Promise<{ patientId: string; stats: Record<string, number> }> {
  const bundle = parseAndValidate(jsonText);
  const mode = options.mode ?? 'replace';

  if (mode === 'replace') {
    await wipeAllData();
  }

  // 使用 bulkPut（upsert 语义），即便 merge 模式下同 id 也会被覆盖
  await Promise.all([
    db.patients.bulkPut(bundle.data.patients),
    db.vitals.bulkPut(bundle.data.vitals),
    db.symptoms.bulkPut(bundle.data.symptoms),
    db.medications.bulkPut(bundle.data.medications),
    db.lifestyles.bulkPut(bundle.data.lifestyles),
    db.reports.bulkPut(bundle.data.reports),
    db.summaries.bulkPut(bundle.data.summaries),
  ]);

  const patientId =
    bundle.data.patients[0]?.id ||
    (await db.patients.toCollection().first())?.id ||
    '';

  return {
    patientId,
    stats: {
      patients: bundle.data.patients.length,
      vitals: bundle.data.vitals.length,
      symptoms: bundle.data.symptoms.length,
      medications: bundle.data.medications.length,
      lifestyles: bundle.data.lifestyles.length,
      reports: bundle.data.reports.length,
      summaries: bundle.data.summaries.length,
    },
  };
}

/** 从 File 对象读取并导入 */
export async function importFromFile(
  file: File,
  options?: { mode?: 'replace' | 'merge' },
): Promise<{ patientId: string; stats: Record<string, number> }> {
  const text = await file.text();
  return importAllData(text, options);
}

/** 解析并校验 JSON 字符串 */
function parseAndValidate(jsonText: string): ExportBundle {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    throw new Error('JSON 格式错误，无法解析：' + (e instanceof Error ? e.message : '未知'));
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('文件内容无效：顶层不是对象');
  }

  const obj = parsed as Partial<ExportBundle>;
  if (obj.app !== EXPORT_APP) {
    throw new Error(`文件 app 字段不匹配：期望 "${EXPORT_APP}"，实际 "${String(obj.app)}"`);
  }
  if (typeof obj.version !== 'number') {
    throw new Error('文件缺少 version 字段');
  }
  if (obj.version > EXPORT_VERSION) {
    throw new Error(
      `文件版本 (${obj.version}) 比当前应用支持的最高版本 (${EXPORT_VERSION}) 还新，请升级应用再试`,
    );
  }
  if (!obj.data || typeof obj.data !== 'object') {
    throw new Error('文件缺少 data 字段');
  }

  const data = obj.data as Partial<ExportBundle['data']>;
  const required = ['patients', 'vitals', 'symptoms', 'medications', 'lifestyles', 'reports', 'summaries'] as const;
  for (const key of required) {
    if (!Array.isArray(data[key])) {
      throw new Error(`data.${key} 字段缺失或不是数组`);
    }
  }

  return {
    app: EXPORT_APP,
    version: obj.version,
    exportedAt: obj.exportedAt || Date.now(),
    data: data as ExportBundle['data'],
  };
}
