import Dexie, { type Table } from 'dexie';
import type {
  Patient,
  VitalRecord,
  SymptomRecord,
  MedicationRecord,
  LifestyleRecord,
  MedicalReport,
  ConsultationSummary,
} from '@/types';

/**
 * IndexedDB 存储定义。
 * 升级 schema 时请递增版本号并在 .version(n).upgrade(...) 中处理迁移。
 */
export class YiQianJiDB extends Dexie {
  patients!: Table<Patient, string>;
  vitals!: Table<VitalRecord, string>;
  symptoms!: Table<SymptomRecord, string>;
  medications!: Table<MedicationRecord, string>;
  lifestyles!: Table<LifestyleRecord, string>;
  reports!: Table<MedicalReport, string>;
  summaries!: Table<ConsultationSummary, string>;

  constructor() {
    super('yiqianji');
    this.version(1).stores({
      patients: 'id, name, updatedAt',
      vitals: 'id, patientId, kind, occurredAt',
      symptoms: 'id, patientId, occurredAt',
      medications: 'id, patientId, takenAt',
      lifestyles: 'id, patientId, kind, occurredAt',
      reports: 'id, patientId, examinedAt',
      summaries: 'id, patientId, createdAt',
    });
  }
}

export const db = new YiQianJiDB();
