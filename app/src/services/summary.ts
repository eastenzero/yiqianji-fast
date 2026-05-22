import type {
  ConsultationSummary,
  VitalRecord,
  SymptomRecord,
  MedicationRecord,
  LifestyleRecord,
  MedicalReport,
  Patient,
} from '@/types';
import { getAIProvider } from './ai';
import type { IAIProvider } from './ai';
import { getRepositories } from './storage';
import { uid } from '@/lib/utils';

/**
 * 就诊前摘要生成 use-case。
 * 流程：
 *   1. 从本地 IndexedDB 读取指定时间窗内的全部数据
 *   2. 组织成结构化上下文
 *   3. 调用 AI 生成医生可读摘要（Markdown）
 *   4. 同时尝试获取 JSON 结构化分项（供页面分区展示）
 *   5. 保存到 summaries 表
 */

const SYSTEM_PROMPT = `你是一名专业的医学信息整理助手。请根据用户提供的个人健康记录，生成一份结构化的"就诊前摘要"，供医生在几十秒内阅读。

必须遵守：
1. 严格基于用户提供的数据，不补充未出现的信息，不推断病因，不诊断，不给治疗建议。
2. 只做事实归纳、时间线整理、频次统计和趋势描述；涉及异常时仅描述"记录显示/报告标注/用户自述"，不做医学结论判断。
3. 输出两部分：先 JSON，再 --- 分隔，后接 Markdown。
4. 语言简洁、专业、中立。
5. 如果数据不足，请明确写"当前记录不足以判断趋势"，不要为了完整而编造。

输出格式：
{
  "chiefComplaint": "核心主诉（1-2 句）",
  "symptoms": "症状详情（发生频率、持续、诱因、缓解）",
  "vitalsTrend": "体征趋势（血压/血糖等，最近一周/两周变化）",
  "medications": "用药情况（药名、剂量、频次、依从性）",
  "lifestyle": "生活习惯概要（饮食、运动、睡眠）",
  "reportHighlights": "最近检查报告中已标注或可客观读取的异常点",
  "focusPoints": ["供医生核对的信息1", "信息2", "信息3"]
}
---
# 就诊前摘要

## 核心主诉
...

## 症状详情
...

（以此类推，使用 Markdown 标题分节）`;

interface ParsedAIResult {
  chiefComplaint: string;
  symptoms: string;
  vitalsTrend: string;
  medications: string;
  lifestyle: string;
  reportHighlights: string;
  focusPoints: string[];
  markdown: string;
}

export interface GenerateSummaryOptions {
  patientId: string;
  /** 默认覆盖过去 14 天 */
  days?: number;
  signal?: AbortSignal;
  aiProvider?: IAIProvider;
}

export async function generateConsultationSummary(
  options: GenerateSummaryOptions,
): Promise<ConsultationSummary> {
  const { patientId, days = 14, signal, aiProvider } = options;
  const repo = getRepositories();
  const to = Date.now();
  const from = to - days * 24 * 60 * 60 * 1000;

  const [patient, vitals, symptoms, medications, lifestyles, reports] = await Promise.all([
    repo.patients.getById(patientId),
    repo.vitals.list({ patientId, from, to }),
    repo.symptoms.list({ patientId, from, to }),
    repo.medications.list({ patientId, from, to }),
    repo.lifestyles.list({ patientId, from, to }),
    repo.reports.list({ patientId, from, to }),
  ]);

  const context = buildContextPrompt(patient, vitals, symptoms, medications, lifestyles, reports, days);

  const ai = aiProvider ?? getAIProvider();
  const raw = await ai.complete(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: context },
    ],
    { temperature: 0.3, signal, maxTokens: 1500 },
  );

  const parsed = parseAIResult(raw);

  const summary: ConsultationSummary = {
    id: uid('sum'),
    patientId,
    from,
    to,
    ...parsed,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // 保存
  await repo.summaries.create(summary);
  return summary;
}

function buildContextPrompt(
  patient: Patient | undefined,
  vitals: VitalRecord[],
  symptoms: SymptomRecord[],
  medications: MedicationRecord[],
  lifestyles: LifestyleRecord[],
  reports: MedicalReport[],
  days: number,
): string {
  const lines: string[] = [];
  lines.push(`# 患者基本信息`);
  if (patient) {
    lines.push(`- 姓名：${patient.name}`);
    lines.push(`- 性别：${patient.gender === 'male' ? '男' : patient.gender === 'female' ? '女' : '其他'}`);
    if (patient.birthday) lines.push(`- 生日：${patient.birthday}`);
    if (patient.conditions.length) lines.push(`- 慢病标签：${patient.conditions.join('、')}`);
    if (patient.allergies?.length) lines.push(`- 过敏史：${patient.allergies.join('、')}`);
  } else {
    lines.push('- (未填写)');
  }

  lines.push(`\n# 近 ${days} 天健康记录`);

  lines.push(`\n## 体征数据 (${vitals.length} 条)`);
  vitals.slice(0, 50).forEach((v) => {
    const t = new Date(v.occurredAt).toISOString().slice(0, 16).replace('T', ' ');
    const val =
      typeof v.value === 'number'
        ? `${v.value} ${v.unit}`
        : `${v.value.systolic}/${v.value.diastolic} ${v.unit}`;
    lines.push(`- [${t}] ${labelOfVital(v.kind)}: ${val}${v.note ? '（' + v.note + '）' : ''}`);
  });

  lines.push(`\n## 症状记录 (${symptoms.length} 条)`);
  symptoms.slice(0, 30).forEach((s) => {
    const t = new Date(s.occurredAt).toISOString().slice(0, 16).replace('T', ' ');
    lines.push(
      `- [${t}] ${s.title}，程度 ${s.severity}/5${s.durationMinutes ? `，持续 ${s.durationMinutes} 分钟` : ''}${s.triggers?.length ? `，诱因：${s.triggers.join('、')}` : ''}${s.reliefs?.length ? `，缓解：${s.reliefs.join('、')}` : ''}${s.note ? `，备注：${s.note}` : ''}`,
    );
  });

  lines.push(`\n## 用药记录 (${medications.length} 条)`);
  medications.slice(0, 30).forEach((m) => {
    const t = new Date(m.takenAt).toISOString().slice(0, 16).replace('T', ' ');
    lines.push(`- [${t}] ${m.name} ${m.dosage} ${m.frequency}${m.note ? '（' + m.note + '）' : ''}`);
  });

  lines.push(`\n## 生活习惯 (${lifestyles.length} 条)`);
  lifestyles.slice(0, 20).forEach((l) => {
    const t = new Date(l.occurredAt).toISOString().slice(0, 16).replace('T', ' ');
    lines.push(`- [${t}] ${labelOfLifestyle(l.kind)}: ${l.content}`);
  });

  lines.push(`\n## 检查报告 (${reports.length} 份)`);
  reports.slice(0, 10).forEach((r) => {
    const t = new Date(r.examinedAt).toISOString().slice(0, 10);
    lines.push(`### [${t}] ${r.title}${r.hospital ? ' @ ' + r.hospital : ''}`);
    r.items.slice(0, 20).forEach((item) => {
      const flag = item.abnormal === 'high' ? '↑' : item.abnormal === 'low' ? '↓' : '';
      lines.push(`  - ${item.name}: ${item.value}${item.unit || ''} ${flag} ${item.reference ? `（参考 ${item.reference}）` : ''}`);
    });
  });

  lines.push(`\n请基于以上数据生成就诊前摘要。`);
  return lines.join('\n');
}

function labelOfVital(kind: VitalRecord['kind']): string {
  return { bp: '血压', bg: '血糖', hr: '心率', temp: '体温', weight: '体重', spo2: '血氧' }[kind];
}

function labelOfLifestyle(kind: LifestyleRecord['kind']): string {
  return { diet: '饮食', exercise: '运动', sleep: '睡眠' }[kind];
}

function parseAIResult(raw: string): ParsedAIResult {
  const fallback: ParsedAIResult = {
    chiefComplaint: '',
    symptoms: '',
    vitalsTrend: '',
    medications: '',
    lifestyle: '',
    reportHighlights: '',
    focusPoints: [],
    markdown: raw,
  };

  // 尝试按 "---" 分割为 JSON + Markdown 两段
  const idx = raw.indexOf('---');
  if (idx < 0) return fallback;

  const jsonPart = raw.slice(0, idx).trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const mdPart = raw.slice(idx + 3).trim();

  try {
    const obj = JSON.parse(jsonPart) as Omit<ParsedAIResult, 'markdown'>;
    return {
      chiefComplaint: obj.chiefComplaint || '',
      symptoms: obj.symptoms || '',
      vitalsTrend: obj.vitalsTrend || '',
      medications: obj.medications || '',
      lifestyle: obj.lifestyle || '',
      reportHighlights: obj.reportHighlights || '',
      focusPoints: Array.isArray(obj.focusPoints) ? obj.focusPoints : [],
      markdown: mdPart || raw,
    };
  } catch {
    return { ...fallback, markdown: mdPart || raw };
  }
}
