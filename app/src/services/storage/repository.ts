import type {
  Patient,
  VitalRecord,
  SymptomRecord,
  MedicationRecord,
  LifestyleRecord,
  MedicalReport,
  ConsultationSummary,
  QueryOptions,
} from '@/types';

/**
 * 通用 CRUD 仓储接口。
 * 未来从本地迁到服务端时，只需替换实现（如 HttpRepository），调用方无感。
 */
export interface IRepository<T extends { id: string }> {
  getById(id: string): Promise<T | undefined>;
  list(options?: QueryOptions): Promise<T[]>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<T, 'id'>>): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  count(options?: QueryOptions): Promise<number>;
}

/**
 * 聚合仓储，业务代码从这里取 Repository 实例。
 * 使用方式：
 *   const repo = getRepositories();
 *   await repo.vitals.list({ patientId: 'p1', from: ... });
 */
export interface Repositories {
  patients: IRepository<Patient>;
  vitals: IRepository<VitalRecord>;
  symptoms: IRepository<SymptomRecord>;
  medications: IRepository<MedicationRecord>;
  lifestyles: IRepository<LifestyleRecord>;
  reports: IRepository<MedicalReport>;
  summaries: IRepository<ConsultationSummary>;
}
