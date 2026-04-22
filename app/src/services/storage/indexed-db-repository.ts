import type { Table } from 'dexie';
import { db } from './db';
import { uid } from '@/lib/utils';
import type { IRepository, Repositories } from './repository';
import type { QueryOptions } from '@/types';

/**
 * 基于 Dexie (IndexedDB) 的通用 Repository 实现。
 * 默认按 `occurredAt` 或 `createdAt` 倒序返回（下方 list() 中按字段动态选择）。
 */
class DexieRepository<T extends { id: string; patientId?: string; createdAt: number; updatedAt: number; occurredAt?: number; examinedAt?: number; takenAt?: number }> implements IRepository<T> {
  constructor(
    private readonly table: Table<T, string>,
    private readonly timeField: keyof T = 'createdAt' as keyof T,
  ) {}

  async getById(id: string): Promise<T | undefined> {
    return this.table.get(id);
  }

  async list(options: QueryOptions = {}): Promise<T[]> {
    let collection = this.table.toCollection();

    if (options.patientId) {
      collection = this.table.where('patientId').equals(options.patientId);
    }

    let items = await collection.toArray();

    if (options.from != null || options.to != null) {
      items = items.filter((item) => {
        const t = (item[this.timeField] as unknown as number) ?? item.createdAt;
        if (options.from != null && t < options.from) return false;
        if (options.to != null && t > options.to) return false;
        return true;
      });
    }

    // 按时间字段倒序
    items.sort((a, b) => {
      const ta = (a[this.timeField] as unknown as number) ?? a.createdAt;
      const tb = (b[this.timeField] as unknown as number) ?? b.createdAt;
      return tb - ta;
    });

    if (options.limit) items = items.slice(0, options.limit);
    return items;
  }

  async create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<T, 'id'>>): Promise<T> {
    const now = Date.now();
    const full = {
      ...(entity as object),
      id: (entity as { id?: string }).id ?? uid(),
      createdAt: now,
      updatedAt: now,
    } as T;
    await this.table.put(full);
    return full;
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    const existing = await this.table.get(id);
    if (!existing) throw new Error(`[Repository] 记录不存在: ${id}`);
    const merged = { ...existing, ...patch, updatedAt: Date.now() } as T;
    await this.table.put(merged);
    return merged;
  }

  async delete(id: string): Promise<void> {
    await this.table.delete(id);
  }

  async count(options: QueryOptions = {}): Promise<number> {
    if (!options.patientId && options.from == null && options.to == null) {
      return this.table.count();
    }
    const items = await this.list(options);
    return items.length;
  }
}

let cached: Repositories | null = null;

/** 获取单例 Repositories（懒初始化） */
export function getRepositories(): Repositories {
  if (cached) return cached;
  cached = {
    patients: new DexieRepository(db.patients, 'updatedAt') as unknown as Repositories['patients'],
    vitals: new DexieRepository(db.vitals, 'occurredAt') as unknown as Repositories['vitals'],
    symptoms: new DexieRepository(db.symptoms, 'occurredAt') as unknown as Repositories['symptoms'],
    medications: new DexieRepository(db.medications, 'takenAt') as unknown as Repositories['medications'],
    lifestyles: new DexieRepository(db.lifestyles, 'occurredAt') as unknown as Repositories['lifestyles'],
    reports: new DexieRepository(db.reports, 'examinedAt') as unknown as Repositories['reports'],
    summaries: new DexieRepository(db.summaries, 'createdAt') as unknown as Repositories['summaries'],
  };
  return cached;
}
