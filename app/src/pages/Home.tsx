import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Calendar, Brain, Activity, HeartPulse, Stethoscope, Utensils, Pill,
  Sparkles, KeyRound, Upload, Download, PencilLine, Loader2, Inbox,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '@/services/storage';
import { useAppStore } from '@/stores/app-store';
import { hasValidAPIKey } from '@/lib/config';
import { cn } from '@/lib/utils';
import { loadDemoData, ensureEmptyPatient, wipeRecordsOnly } from '@/services/seed';
import { importFromFile } from '@/services/data-io';
import { BpTrendCard } from '@/components/pure/BpTrendCard';
import { QuickCard as QuickCardView } from '@/components/pure/QuickCard';

export default function Home() {
  const patientId = useAppStore((s) => s.currentPatientId);
  const setCurrentPatientId = useAppStore((s) => s.setCurrentPatientId);

  const [busy, setBusy] = useState<null | 'demo' | 'import'>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const onLoadDemo = async () => {
    setBusy('demo');
    try {
      let pid = patientId;
      if (!pid) {
        pid = await ensureEmptyPatient();
        setCurrentPatientId(pid);
      } else {
        await wipeRecordsOnly(pid);
      }
      await loadDemoData(pid);
      showToast('演示数据已加载！看看下方的变化');
    } catch (e) {
      showToast('加载失败：' + (e instanceof Error ? e.message : '未知'));
    } finally {
      setBusy(null);
    }
  };

  const onImportFile = async (file: File) => {
    setBusy('import');
    try {
      const r = await importFromFile(file, { mode: 'replace' });
      if (r.patientId) setCurrentPatientId(r.patientId);
      showToast(
        `已导入：${r.stats.vitals} 体征 / ${r.stats.medications} 用药 / ${r.stats.reports} 报告`,
      );
    } catch (e) {
      showToast('导入失败：' + (e instanceof Error ? e.message : '未知'));
    } finally {
      setBusy(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const patient = useLiveQuery(async () => {
    if (!patientId) return undefined;
    return db.patients.get(patientId);
  }, [patientId]);

  const vitals = useLiveQuery(
    async () => (patientId ? db.vitals.where('patientId').equals(patientId).toArray() : []),
    [patientId],
    [],
  );

  const recentSummary = useLiveQuery(
    async () => {
      if (!patientId) return undefined;
      const all = await db.summaries.where('patientId').equals(patientId).toArray();
      return all.sort((a, b) => b.createdAt - a.createdAt)[0];
    },
    [patientId],
  );

  // 连续记录天数
  const continuousDays = useLiveQuery(async () => {
    if (!patientId) return 0;
    const all = await db.vitals.where('patientId').equals(patientId).toArray();
    const daySet = new Set(
      all.map((v) => new Date(v.occurredAt).toISOString().slice(0, 10)),
    );
    return daySet.size;
  }, [patientId], 0);

  // 最近 7 天血压趋势用于迷你图
  const bpTrend = (vitals ?? [])
    .filter((v) => v.kind === 'bp' && typeof v.value === 'object')
    .sort((a, b) => a.occurredAt - b.occurredAt)
    .slice(-7)
    .map((v) => (v.value as { systolic: number }).systolic);

  const name = patient?.name ?? '朋友';
  const conditions = patient?.conditions ?? [];
  const apiKeyOk = hasValidAPIKey();
  const hasAnyData = (vitals?.length ?? 0) > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 隐藏 file input（导入备份用） */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImportFile(f);
        }}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-white text-sm rounded-xl px-5 py-3 shadow-lg font-medium animate-in fade-in slide-in-from-top-4 duration-300">
          {toast}
        </div>
      )}

      {/* 空态大卡：没有任何记录时显示 */}
      {!hasAnyData && patient && (
        <EmptyStateCard
          onDemo={onLoadDemo}
          onImport={() => fileInputRef.current?.click()}
          busy={busy}
        />
      )}

      {!apiKeyOk && (
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-xl bg-tertiary-fixed/80 text-on-tertiary-fixed px-5 py-4 border border-tertiary/20 hover:bg-tertiary-fixed transition"
        >
          <KeyRound className="w-5 h-5 text-tertiary" />
          <div className="flex-1">
            <div className="font-bold text-sm">先去设置里填一下 API Key</div>
            <div className="text-xs opacity-80">AI 摘要和报告 OCR 需要，点我前往设置页。</div>
          </div>
        </Link>
      )}

      {/* 问候 + 连续记录 */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-headline">
            您好，{name}
          </h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {conditions.map((c) => (
              <span
                key={c}
                className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold tracking-wide"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Calendar className="text-primary w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">已连续记录</p>
            <p className="text-2xl font-bold text-primary">
              {continuousDays} <span className="text-sm font-medium text-secondary">天</span>
            </p>
          </div>
        </div>
      </section>

      {/* AI 摘要卡片 */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Link
          to="/summary"
          className="md:col-span-8 relative overflow-hidden bg-gradient-to-br from-primary-container to-primary text-white rounded-xl p-8 shadow-xl hover:shadow-2xl transition"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-primary-fixed-dim w-5 h-5" />
              <h3 className="text-sm font-bold tracking-widest uppercase opacity-90">
                Recent 14-day highlight
              </h3>
            </div>
            <p className="text-lg md:text-xl font-medium leading-relaxed max-w-2xl font-body">
              {recentSummary?.chiefComplaint ||
                '点此生成最近 14 天的就诊前摘要，交给 AI 帮你整理重点。'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-primary-fixed-dim text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              {recentSummary ? '查看完整摘要' : '立即生成'}
            </div>
          </div>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-primary-fixed-dim/20 rounded-full blur-2xl pointer-events-none" />
        </Link>

        {/* 目标达成率（示意） */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-3 shadow-sm border border-surface-container-high/50">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-primary font-headline">
              {Math.min(99, Math.max(1, (continuousDays || 0) * 7))}%
            </span>
          </div>
          <h4 className="font-bold text-on-surface">记录完整度</h4>
          <p className="text-sm text-secondary px-4">
            持续记录，AI 摘要质量会越来越准。
          </p>
        </div>
      </section>

      {/* 快捷记录 */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          快捷记录
          <span className="text-xs font-normal text-secondary bg-surface-container px-2 py-0.5 rounded">
            QUICK ACTION
          </span>
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickCard to="/record?type=vital" icon={Activity} label="测体征" hint="血压、血糖等" color="cyan" />
          <QuickCard to="/record?type=symptom" icon={Stethoscope} label="记症状" hint="身体不适感" color="amber" />
          <QuickCard to="/record?type=lifestyle" icon={Utensils} label="生活习惯" hint="饮食与运动" color="emerald" />
          <QuickCard to="/record?type=medication" icon={Pill} label="记用药" hint="定时提醒打卡" color="purple" />
        </div>
      </section>

      {/* 血压趋势 / 预警 · 点击卡片跳转到摘要页 */}
      {bpTrend.length >= 2 && (
        <Link to="/summary" className="block transition-all hover:-translate-y-0.5">
          <BpTrendCard values={bpTrend} />
        </Link>
      )}

      <footer className="py-12 text-center text-sm text-outline font-medium tracking-wide">
        本工具仅做信息整理，不作诊断建议
      </footer>
    </div>
  );
}

function QuickCard({
  to,
  icon,
  label,
  hint,
  color,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  color: 'cyan' | 'amber' | 'emerald' | 'purple';
}) {
  return (
    <Link
      to={to}
      className="block transition-all active:scale-95 hover:shadow-[0_8px_30px_-4px_rgba(0,102,136,0.1)] rounded-xl"
    >
      <QuickCardView icon={icon} label={label} hint={hint} color={color} />
    </Link>
  );
}

function EmptyStateCard({
  onDemo,
  onImport,
  busy,
}: {
  onDemo: () => void;
  onImport: () => void;
  busy: null | 'demo' | 'import';
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-gradient-to-br from-primary-container to-primary text-white shadow-xl">
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-60 h-60 bg-primary-fixed-dim/30 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
        <div className="md:col-span-3 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur rounded-full">
            <Inbox className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">Empty Vault</span>
          </div>
          <h3 className="text-3xl font-extrabold font-headline leading-tight">
            暂时还没有记录
            <br />
            <span className="text-primary-fixed-dim">三种方式开始</span>
          </h3>
          <p className="text-sm opacity-90 font-body leading-relaxed max-w-md">
            你的数据权限在你手里 —— 可以从零手动记录、加载我们的 14 天演示数据预览完整功能，或者直接导入之前备份的 JSON。
          </p>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 gap-2.5">
          <Link
            to="/record?type=vital"
            className="flex items-center justify-between h-14 px-5 rounded-2xl bg-white text-primary font-bold active:scale-[0.97] transition hover:shadow-lg"
          >
            <span className="flex items-center gap-2">
              <PencilLine className="w-4 h-4" />
              开始手动记录
            </span>
            <span className="text-[10px] uppercase tracking-widest opacity-60">Manual</span>
          </Link>
          <button
            onClick={onDemo}
            disabled={busy !== null}
            className="flex items-center justify-between h-14 px-5 rounded-2xl bg-white/15 backdrop-blur text-white font-bold border border-white/20 active:scale-[0.97] transition hover:bg-white/25 disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              {busy === 'demo' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              加载演示数据
            </span>
            <span className="text-[10px] uppercase tracking-widest opacity-70">14 Days</span>
          </button>
          <button
            onClick={onImport}
            disabled={busy !== null}
            className="flex items-center justify-between h-14 px-5 rounded-2xl bg-white/15 backdrop-blur text-white font-bold border border-white/20 active:scale-[0.97] transition hover:bg-white/25 disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              {busy === 'import' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              导入 JSON 备份
            </span>
            <span className="text-[10px] uppercase tracking-widest opacity-70">Restore</span>
          </button>
          <Link
            to="/settings"
            className="text-xs text-white/70 hover:text-white text-center mt-1 flex items-center justify-center gap-1"
          >
            <Download className="w-3 h-3" />
            想导出现有数据？前往设置
          </Link>
        </div>
      </div>
    </section>
  );
}
