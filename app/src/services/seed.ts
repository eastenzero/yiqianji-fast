import { getRepositories } from './storage';
import { uid } from '@/lib/utils';
import type { Patient } from '@/types';

/**
 * 确保存在至少一个 Patient。
 * 新安装首次调用：创建一个"空白档案"（占位资料，不带任何记录）。
 * 后续再调用：直接返回已有 ID，不覆盖。
 * 返回患者 ID。
 */
export async function ensureEmptyPatient(): Promise<string> {
  const repo = getRepositories();
  const existing = await repo.patients.list({ limit: 1 });
  if (existing.length > 0) return existing[0].id;

  const patient: Patient = await repo.patients.create({
    name: '我',
    gender: 'other',
    birthday: '',
    conditions: [],
    allergies: [],
    avatarUrl: '',
  } as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>);
  return patient.id;
}

/**
 * 向指定患者追加 14 天的演示数据（体征/症状/用药/生活）。
 * 幂等前提：不检查重复，反复调用会累积。由调用方保证数据为空时再触发。
 */
export async function loadDemoData(patientId: string): Promise<void> {
  const repo = getRepositories();

  // 把 patient 的基本资料也补上，让体验一致
  const patient = await repo.patients.getById(patientId);
  if (patient) {
    const needsUpdate =
      !patient.name ||
      patient.name === '我' ||
      !patient.birthday ||
      patient.conditions.length === 0;
    if (needsUpdate) {
      await repo.patients.update(patientId, {
        name: '王先生',
        gender: 'male',
        birthday: '1968-06-15',
        conditions: ['高血压二期'],
        allergies: [],
      });
    }
  }

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // 血压 × 14 天，构造"近一周逐渐上升"的小趋势
  for (let i = 13; i >= 0; i--) {
    const base = now - i * day;
    const morning = base - 12 * 60 * 60 * 1000;
    const evening = base - 2 * 60 * 60 * 1000;
    const rise = Math.max(0, 7 - i);
    await repo.vitals.create({
      patientId,
      kind: 'bp',
      value: {
        systolic: 130 + rise + Math.round(Math.random() * 4),
        diastolic: 82 + Math.round(Math.random() * 3),
      },
      unit: 'mmHg',
      note: '晨起空腹',
      occurredAt: morning,
    });
    if (i % 2 === 0) {
      await repo.vitals.create({
        patientId,
        kind: 'bp',
        value: {
          systolic: 125 + Math.round(Math.random() * 5),
          diastolic: 78 + Math.round(Math.random() * 3),
        },
        unit: 'mmHg',
        note: '晚间',
        occurredAt: evening,
      });
    }
  }

  // 血糖 × 3
  await repo.vitals.create({ patientId, kind: 'bg', value: 5.4, unit: 'mmol/L', occurredAt: now - 2 * day });
  await repo.vitals.create({ patientId, kind: 'bg', value: 6.1, unit: 'mmol/L', occurredAt: now - 5 * day });
  await repo.vitals.create({ patientId, kind: 'bg', value: 5.8, unit: 'mmol/L', occurredAt: now - 9 * day });

  const heartRates = [76, 78, 74, 82, 80, 86, 84, 88, 85, 90, 87, 92, 89, 94];
  for (let i = 13; i >= 0; i--) {
    await repo.vitals.create({
      patientId,
      kind: 'hr',
      value: heartRates[13 - i],
      unit: 'bpm',
      note: i <= 4 ? '活动后偏快' : '静息',
      occurredAt: now - i * day - 9 * 60 * 60 * 1000,
    });
  }

  const temperatures = [36.4, 36.5, 36.6, 36.5, 36.7, 36.8, 36.6, 36.9, 37.1, 37.4, 37.2, 36.9, 36.7, 36.6];
  for (let i = 13; i >= 0; i--) {
    await repo.vitals.create({
      patientId,
      kind: 'temp',
      value: temperatures[13 - i],
      unit: '℃',
      note: temperatures[13 - i] > 37.2 ? '午后测量' : '晨起',
      occurredAt: now - i * day - 8 * 60 * 60 * 1000,
    });
  }

  // 症状
  await repo.symptoms.create({
    patientId,
    title: '胸闷',
    severity: 3,
    durationMinutes: 15,
    triggers: ['爬楼梯'],
    reliefs: ['休息'],
    note: '下楼后缓解',
    occurredAt: now - 2 * day - 4 * 60 * 60 * 1000,
  });
  await repo.symptoms.create({
    patientId,
    title: '头晕',
    severity: 2,
    durationMinutes: 10,
    triggers: ['晨起快起身'],
    reliefs: ['坐下片刻'],
    occurredAt: now - 4 * day,
  });

  // 用药：氨氯地平片 5mg qd
  for (let i = 13; i >= 0; i--) {
    await repo.medications.create({
      patientId,
      name: '苯磺酸氨氯地平片',
      dosage: '5mg',
      frequency: 'qd',
      takenAt: now - i * day - 10 * 60 * 60 * 1000,
    });
  }

  // 生活习惯
  await repo.lifestyles.create({
    patientId,
    kind: 'diet',
    content: '低盐早餐：白粥、水煮蛋、凉拌黄瓜',
    occurredAt: now - day,
  });
  await repo.lifestyles.create({
    patientId,
    kind: 'exercise',
    content: '饭后散步 30 分钟',
    durationMinutes: 30,
    occurredAt: now - day - 2 * 60 * 60 * 1000,
  });
  await repo.lifestyles.create({
    patientId,
    kind: 'sleep',
    content: '夜间睡眠 6.5 小时，凌晨 2 点醒来 1 次',
    durationMinutes: 390,
    occurredAt: now - day,
  });

  // 检查报告 × 2（给 Report 页时间轴填充，带 AI 点评）
  await repo.reports.create({
    patientId,
    title: '血常规报告',
    hospital: '市第一人民医院 · 检验科',
    examinedAt: now - 6 * day,
    items: [
      { name: '白细胞计数', value: '7.8', unit: '10⁹/L', reference: '3.5–9.5', abnormal: 'normal' },
      { name: '红细胞计数', value: '4.52', unit: '10¹²/L', reference: '4.3–5.8', abnormal: 'normal' },
      { name: '血红蛋白', value: '148', unit: 'g/L', reference: '130–175', abnormal: 'normal' },
      { name: '血小板计数', value: '289', unit: '10⁹/L', reference: '125–350', abnormal: 'normal' },
      { name: '中性粒细胞比率', value: '73.2', unit: '%', reference: '40–75', abnormal: 'normal' },
    ],
    aiNotes:
      '血常规各项指标处于正常范围，无贫血、感染或血小板异常提示。建议常规随访 6 个月后复查。',
  } as unknown as Parameters<typeof repo.reports.create>[0]);

  await repo.reports.create({
    patientId,
    title: '肝肾功能 + 血脂',
    hospital: '市第一人民医院 · 检验科',
    examinedAt: now - 6 * day,
    items: [
      { name: '丙氨酸氨基转移酶 (ALT)', value: '28', unit: 'U/L', reference: '9–50', abnormal: 'normal' },
      { name: '天门冬氨酸氨基转移酶', value: '32', unit: 'U/L', reference: '15–40', abnormal: 'normal' },
      { name: '肌酐', value: '98', unit: 'μmol/L', reference: '57–111', abnormal: 'normal' },
      { name: '总胆固醇', value: '6.14', unit: 'mmol/L', reference: '< 5.18', abnormal: 'high' },
      { name: '低密度脂蛋白胆固醇 (LDL-C)', value: '3.82', unit: 'mmol/L', reference: '< 3.37', abnormal: 'high' },
      { name: '甘油三酯', value: '1.96', unit: 'mmol/L', reference: '< 1.7', abnormal: 'high' },
    ],
    aiNotes:
      '肝肾功能正常；血脂三项均偏高（TC / LDL-C / TG 均超出参考上限）。结合高血压病史，建议门诊评估心血管风险，必要时启用他汀类药物并加强饮食管理。',
  } as unknown as Parameters<typeof repo.reports.create>[0]);
}

/**
 * 向后兼容：旧代码里调用的 ensureSeedPatient。
 * 新逻辑下"创建空档案"和"加载演示"已分离；此处保留旧语义（无患者则建空的）。
 */
export async function ensureSeedPatient(): Promise<string> {
  return ensureEmptyPatient();
}

/** 清空当前数据库中所有业务数据 */
export async function wipeAllData(): Promise<void> {
  const repo = getRepositories();
  await Promise.all(
    [
      (await repo.vitals.list()).map((v) => repo.vitals.delete(v.id)),
      (await repo.symptoms.list()).map((v) => repo.symptoms.delete(v.id)),
      (await repo.medications.list()).map((v) => repo.medications.delete(v.id)),
      (await repo.lifestyles.list()).map((v) => repo.lifestyles.delete(v.id)),
      (await repo.reports.list()).map((v) => repo.reports.delete(v.id)),
      (await repo.summaries.list()).map((v) => repo.summaries.delete(v.id)),
      (await repo.patients.list()).map((v) => repo.patients.delete(v.id)),
    ].flat(),
  );
}

/** 只清业务记录，保留患者档案 */
export async function wipeRecordsOnly(patientId: string): Promise<void> {
  const repo = getRepositories();
  await Promise.all(
    [
      (await repo.vitals.list({ patientId })).map((v) => repo.vitals.delete(v.id)),
      (await repo.symptoms.list({ patientId })).map((v) => repo.symptoms.delete(v.id)),
      (await repo.medications.list({ patientId })).map((v) => repo.medications.delete(v.id)),
      (await repo.lifestyles.list({ patientId })).map((v) => repo.lifestyles.delete(v.id)),
      (await repo.reports.list({ patientId })).map((v) => repo.reports.delete(v.id)),
      (await repo.summaries.list({ patientId })).map((v) => repo.summaries.delete(v.id)),
    ].flat(),
  );
}

// 辅助
export { uid };
