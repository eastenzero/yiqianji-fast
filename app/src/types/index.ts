/**
 * 领域模型
 * 所有实体都带 id + createdAt + updatedAt，便于未来同步到服务端。
 */

/** 患者基本信息（当前单用户；未来多账号可扩展） */
export interface Patient {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthday?: string; // ISO
  conditions: string[]; // 慢病标签，如 ["高血压二期", "糖尿病"]
  allergies?: string[];
  avatarUrl?: string;
  createdAt: number;
  updatedAt: number;
}

/** 体征数据类型 */
export type VitalKind =
  | 'bp' // 血压
  | 'bg' // 血糖
  | 'hr' // 心率
  | 'temp' // 体温
  | 'weight' // 体重
  | 'spo2'; // 血氧

/** 体征记录 */
export interface VitalRecord {
  id: string;
  patientId: string;
  kind: VitalKind;
  /** 数值（血压用 systolic/diastolic） */
  value: number | { systolic: number; diastolic: number };
  unit: string;
  note?: string;
  occurredAt: number; // 发生时间
  createdAt: number;
  updatedAt: number;
}

/** 症状 / 不适补记 */
export interface SymptomRecord {
  id: string;
  patientId: string;
  title: string; // 主诉，如"胸闷"
  severity: 1 | 2 | 3 | 4 | 5; // 程度
  triggers?: string[]; // 诱因
  reliefs?: string[]; // 缓解方式
  durationMinutes?: number;
  note?: string;
  occurredAt: number;
  createdAt: number;
  updatedAt: number;
}

/** 用药记录 */
export interface MedicationRecord {
  id: string;
  patientId: string;
  name: string;
  dosage: string; // 如 "5mg"
  frequency: string; // 如 "qd"（每日一次）
  takenAt: number;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

/** 生活习惯（饮食/运动/睡眠） */
export interface LifestyleRecord {
  id: string;
  patientId: string;
  kind: 'diet' | 'exercise' | 'sleep';
  content: string;
  durationMinutes?: number;
  occurredAt: number;
  createdAt: number;
  updatedAt: number;
}

/** 检查报告（上传 + OCR 解析后） */
export interface MedicalReport {
  id: string;
  patientId: string;
  title: string; // 如 "血常规报告"
  hospital?: string;
  examinedAt: number;
  /** 原图 base64（本地存储，离线可查） */
  imageDataUrl?: string;
  /** OCR 提取的原始文字 */
  rawText?: string;
  /** 结构化解析出的指标 */
  items: ReportItem[];
  /** AI 对报告的点评摘要 */
  aiNotes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReportItem {
  name: string; // 指标名，如"红细胞计数"
  value: string; // 数值
  unit?: string;
  reference?: string; // 参考范围
  abnormal?: 'high' | 'low' | 'normal'; // 异常标记
}

/** AI 生成的就诊前摘要 */
export interface ConsultationSummary {
  id: string;
  patientId: string;
  /** 覆盖时间范围 */
  from: number;
  to: number;
  /** 核心主诉（AI 提炼） */
  chiefComplaint: string;
  /** 症状详情 */
  symptoms: string;
  /** 体征趋势 */
  vitalsTrend: string;
  /** 用药情况 */
  medications: string;
  /** 生活习惯 */
  lifestyle: string;
  /** 报告异常点 */
  reportHighlights: string;
  /** 给医生的建议关注点 */
  focusPoints: string[];
  /** 完整 Markdown 摘要（用于展示/分享） */
  markdown: string;
  createdAt: number;
  updatedAt: number;
}

/** Repository 查询选项 */
export interface QueryOptions {
  patientId?: string;
  from?: number;
  to?: number;
  limit?: number;
}
