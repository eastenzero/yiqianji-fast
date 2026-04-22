import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 全局 UI 状态（引导、当前患者 ID 等）。
 * 持久化到 localStorage。
 */

interface AppState {
  /** 是否已完成欢迎引导 */
  onboarded: boolean;
  /** 当前活跃患者 ID（单用户场景通常只有一个） */
  currentPatientId: string | null;

  setOnboarded: (v: boolean) => void;
  setCurrentPatientId: (id: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboarded: false,
      currentPatientId: null,
      setOnboarded: (v) => set({ onboarded: v }),
      setCurrentPatientId: (id) => set({ currentPatientId: id }),
      reset: () => set({ onboarded: false, currentPatientId: null }),
    }),
    { name: 'yiqianji.app.v1' },
  ),
);
