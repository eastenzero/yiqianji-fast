import { useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  Sparkles,
  Copy,
  ArrowRight,
  Pill,
  BriefcaseMedical,
  Info,
  Upload,
  Loader2,
  FileImage,
  Building2,
  Calendar,
  X,
  Trash2,
  KeyRound,
} from 'lucide-react';
import { db, getRepositories } from '@/services/storage';
import { useAppStore } from '@/stores/app-store';
import { getOCRProvider } from '@/services/ocr';
import { fileToDataURL, formatFriendlyDate, cn } from '@/lib/utils';
import { hasValidAPIKey } from '@/lib/config';
import type { MedicalReport, VitalRecord } from '@/types';

type VitalMetric = 'bp' | 'bg' | 'weight' | 'hr';

const METRIC_LABELS: Record<VitalMetric, string> = {
  bp: '血压',
  bg: '血糖',
  weight: '体重',
  hr: '心率',
};

const METRIC_UNITS: Record<VitalMetric, string> = {
  bp: 'mmHg',
  bg: 'mmol/L',
  weight: 'kg',
  hr: 'bpm',
};

const NORMAL_RANGES: Record<VitalMetric, [number, number]> = {
  bp: [110, 135], // 收缩压正常区间
  bg: [3.9, 6.1],
  weight: [50, 85],
  hr: [60, 100],
};

export default function Report() {
  const patientId = useAppStore((s) => s.currentPatientId)!;

  const [metric, setMetric] = useState<VitalMetric>('bp');

  const vitals = useLiveQuery(
    async () => db.vitals.where('patientId').equals(patientId).toArray(),
    [patientId],
    [] as VitalRecord[],
  );

  const meds = useLiveQuery(
    async () => db.medications.where('patientId').equals(patientId).toArray(),
    [patientId],
    [],
  );

  const reports = useLiveQuery(
    async () =>
      db.reports
        .where('patientId')
        .equals(patientId)
        .reverse()
        .sortBy('examinedAt'),
    [patientId],
    [] as MedicalReport[],
  );

  const latestSummary = useLiveQuery(
    async () => {
      const all = await db.summaries.where('patientId').equals(patientId).toArray();
      return all.sort((a, b) => b.createdAt - a.createdAt)[0];
    },
    [patientId],
  );

  // 构造 30 天趋势数据
  const chartData = useMemo(() => {
    if (!vitals) return [];
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const filtered = vitals
      .filter((v) => v.kind === metric && v.occurredAt >= thirtyDaysAgo)
      .sort((a, b) => a.occurredAt - b.occurredAt);

    return filtered.map((v) => {
      const date = new Date(v.occurredAt);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      let value: number;
      if (metric === 'bp' && typeof v.value === 'object') {
        value = v.value.systolic;
      } else if (typeof v.value === 'number') {
        value = v.value;
      } else {
        value = 0;
      }
      const [low, high] = NORMAL_RANGES[metric];
      const abnormal = value < low || value > high;
      return { day: label, value, abnormal, ts: v.occurredAt };
    });
  }, [vitals, metric]);

  const avgValue = useMemo(() => {
    if (!chartData.length) return 0;
    const sum = chartData.reduce((acc, d) => acc + d.value, 0);
    return Math.round((sum / chartData.length) * 10) / 10;
  }, [chartData]);

  const anomalies = chartData.filter((d) => d.abnormal);

  // 用药依从性：最近 14 天应服次数 vs 实服次数（演示按 1/天）
  const medAdherence = useMemo(() => {
    if (!meds || meds.length === 0) return { rate: 0, status: '暂无数据' };
    const now = Date.now();
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
    const recent = meds.filter((m) => m.takenAt >= fourteenDaysAgo);
    const uniqueNames = new Set(recent.map((m) => m.name));
    // 估算：14 天 × 每种药每日 1 次
    const expected = uniqueNames.size * 14;
    const actual = recent.length;
    const rate = expected === 0 ? 0 : Math.min(100, Math.round((actual / expected) * 100));
    let status = '需要改进';
    if (rate >= 90) status = '非常优异';
    else if (rate >= 75) status = '表现良好';
    else if (rate >= 50) status = '尚可';
    return { rate, status };
  }, [meds]);

  // 用药汇总（按药名去重，展示前 2 种）
  const medSummary = useMemo(() => {
    if (!meds) return [] as { name: string; dosage: string; frequency: string; daysSinceLast: number }[];
    const grouped = new Map<string, typeof meds>();
    meds.forEach((m) => {
      const arr = grouped.get(m.name) || [];
      arr.push(m);
      grouped.set(m.name, arr);
    });
    return Array.from(grouped.entries())
      .slice(0, 3)
      .map(([name, list]) => {
        const sorted = list.sort((a, b) => b.takenAt - a.takenAt);
        const latest = sorted[0];
        const daysSinceLast = Math.floor(
          (Date.now() - latest.takenAt) / (24 * 60 * 60 * 1000),
        );
        return {
          name,
          dosage: latest.dosage,
          frequency: latest.frequency,
          daysSinceLast,
        };
      });
  }, [meds]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <section className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight mb-2 font-headline">
            健康报告
          </h2>
          <p className="text-secondary font-medium text-sm">
            最后更新：{formatFriendlyDate(Date.now())}
          </p>
        </div>
        <UploadCorner patientId={patientId} />
      </section>

      {/* 就诊述求摘要 */}
      <SummaryCard summary={latestSummary} />

      {/* 体征趋势图 */}
      <VitalsTrendCard
        data={chartData}
        metric={metric}
        onChangeMetric={setMetric}
        avg={avgValue}
        anomalies={anomalies}
      />

      {/* 用药依从性 + 检查报告档案 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MedicationComplianceCard
          rate={medAdherence.rate}
          status={medAdherence.status}
          meds={medSummary}
        />
        <ReportsTimelineCard reports={reports ?? []} />
      </div>

      {/* 免责声明 */}
      <footer className="pt-8 pb-4">
        <div className="bg-surface-container-high/40 rounded-2xl p-6 border border-surface-container">
          <div className="flex items-center gap-2 mb-3">
            <Info className="text-tertiary w-5 h-5" />
            <span className="font-bold text-secondary">免责声明</span>
          </div>
          <p className="text-xs text-secondary leading-relaxed font-medium">
            本报告由 AI 基于您的本地记录自动整理，仅用于辅助医患沟通。生成内容不代表医疗诊断或处方建议。所有医疗决策必须由执业医师根据实际面诊情况做出。如感到严重不适，请立即就医。
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ========== 子组件 ========== */

function SummaryCard({
  summary,
}: {
  summary: import('@/types').ConsultationSummary | undefined;
}) {
  if (!summary) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl p-8 text-center shadow-[0_-8px_32px_rgba(0,102,136,0.06)] border border-surface-container">
        <Sparkles className="w-10 h-10 text-primary/40 mx-auto mb-3" />
        <h3 className="font-bold text-on-surface mb-2 font-headline">尚未生成就诊摘要</h3>
        <p className="text-sm text-secondary mb-4">让 AI 基于近期记录整理医生可读摘要</p>
        <Link
          to="/summary"
          className="inline-flex items-center gap-1.5 px-5 h-11 rounded-xl bg-gradient-medical text-white font-semibold active:scale-95 transition"
        >
          <Sparkles className="w-4 h-4" />
          前往摘要页
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_-8px_32px_rgba(0,102,136,0.06)] relative border border-surface-container">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary-container/10 rounded-full border border-primary-container/20">
            <Sparkles className="text-primary w-4 h-4" />
            <span className="text-primary font-bold text-xs uppercase tracking-wider">
              AI Generated
            </span>
          </div>
          <button
            onClick={() => {
              if (summary.markdown) {
                navigator.clipboard.writeText(summary.markdown).catch(() => { });
              }
            }}
            className="flex items-center gap-1 text-primary text-sm font-bold hover:opacity-80 transition-opacity"
          >
            <Copy className="w-4 h-4" />
            复制全文
          </button>
        </div>

        <h3 className="text-xl font-bold mb-4 font-headline">就诊述求摘要</h3>
        <div className="space-y-4 text-on-surface leading-loose text-[17px] font-body opacity-90">
          {summary.chiefComplaint && <p>{summary.chiefComplaint}</p>}
          {summary.symptoms && (
            <p className="text-[15px] text-on-surface-variant">{summary.symptoms}</p>
          )}
          {summary.vitalsTrend && (
            <p className="text-[15px] text-on-surface-variant">{summary.vitalsTrend}</p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-outline-variant/20 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-outline">
            覆盖 {formatFriendlyDate(summary.from)} – {formatFriendlyDate(summary.to)}
          </span>
          <Link
            to="/summary"
            className="text-primary text-sm font-bold flex items-center gap-1 group"
          >
            查看完整摘要
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function VitalsTrendCard({
  data,
  metric,
  onChangeMetric,
  avg,
  anomalies,
}: {
  data: { day: string; value: number; abnormal: boolean; ts: number }[];
  metric: VitalMetric;
  onChangeMetric: (m: VitalMetric) => void;
  avg: number;
  anomalies: { day: string; value: number; ts: number }[];
}) {
  const [low, high] = NORMAL_RANGES[metric];
  const unit = METRIC_UNITS[metric];

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-[0_-8px_32px_rgba(0,102,136,0.06)] border border-surface-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h3 className="text-xl font-bold font-headline">体征趋势 (30天)</h3>
        <div className="flex bg-surface-container rounded-2xl p-1 gap-1 overflow-x-auto hide-scrollbar">
          {(['bp', 'bg', 'weight', 'hr'] as VitalMetric[]).map((m) => (
            <button
              key={m}
              onClick={() => onChangeMetric(m)}
              className={cn(
                'px-5 py-2 rounded-xl text-sm whitespace-nowrap transition-all font-medium',
                metric === m
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-highest',
              )}
            >
              {METRIC_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-outline text-sm rounded-2xl bg-surface-container-low/40 border border-dashed border-outline-variant/40">
          <FileImage className="w-8 h-8 mb-2 opacity-40" />
          最近 30 天暂无{METRIC_LABELS[metric]}记录
        </div>
      ) : (
        <>
          <div className="relative h-64 w-full bg-surface-container-low/30 rounded-2xl pt-4 pb-2 pr-4 overflow-hidden border border-outline-variant/10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-outline)', fontSize: 12 }}
                  interval="preserveStartEnd"
                  dy={10}
                />
                <YAxis
                  domain={['dataMin - 5', 'dataMax + 5']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-outline)', fontSize: 12 }}
                />
                <ReferenceArea
                  y1={low}
                  y2={high}
                  fill="var(--color-primary-fixed-dim)"
                  fillOpacity={0.12}
                  ifOverflow="extendDomain"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    padding: '8px 12px',
                  }}
                  formatter={(val) => [`${val} ${unit}`, METRIC_LABELS[metric]] as [string, string]}
                  labelFormatter={(label) => `日期 ${String(label ?? '')}`}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTrend)"
                  activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: 'white', strokeWidth: 2 }}
                />
                {anomalies.map((a) => (
                  <ReferenceLine
                    key={a.ts}
                    x={a.day}
                    stroke="var(--color-error)"
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
            {anomalies.length > 0 && (
              <div className="absolute right-4 top-4 bg-error text-on-error text-[10px] px-2 py-1 flex items-center justify-center rounded font-bold shadow-sm z-10">
                异常 {anomalies.length} 次
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-fixed-dim/40 border border-primary/30" />
                <span className="text-xs text-on-surface-variant font-medium">正常范围</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-error" />
                <span className="text-xs text-on-surface-variant font-medium">异常波动</span>
              </div>
            </div>
            <p className="text-sm font-bold text-on-surface">
              平均值：<span className="text-primary">{avg} {unit}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function MedicationComplianceCard({
  rate,
  status,
  meds,
}: {
  rate: number;
  status: string;
  meds: { name: string; dosage: string; frequency: string; daysSinceLast: number }[];
}) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,102,136,0.04)] border-l-[6px] border-primary border-y border-r border-y-surface-container border-r-surface-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold font-headline">用药状况</h3>
        <span className="text-primary font-bold text-3xl font-headline">{rate}%</span>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-on-surface-variant mb-2 font-medium">
          <span>近 14 天依从性</span>
          <span className="text-primary font-bold">{status}</span>
        </div>
        <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-medical rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>

      {meds.length === 0 ? (
        <div className="text-center text-outline text-sm py-4">
          还没有用药记录
          <Link to="/record?type=medication" className="text-primary underline ml-1">
            去添加
          </Link>
        </div>
      ) : (
        <ul className="space-y-5">
          {meds.map((m, idx) => (
            <li key={idx} className="flex items-start gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 border',
                  idx % 2 === 0
                    ? 'bg-cyan-50 border-cyan-100'
                    : 'bg-orange-50 border-orange-100',
                )}
              >
                {idx % 2 === 0 ? (
                  <Pill className="text-cyan-700 w-6 h-6" />
                ) : (
                  <BriefcaseMedical className="text-tertiary w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-on-surface text-[15px] truncate">{m.name}</p>
                <p className="text-sm text-secondary mt-0.5">
                  {m.dosage} · {m.frequency}
                </p>
                {m.daysSinceLast <= 1 ? (
                  <span className="inline-block mt-2 text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold tracking-wide">
                    今日已记录
                  </span>
                ) : (
                  <p className="text-xs text-error font-bold mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {m.daysSinceLast} 天未记录
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReportsTimelineCard({ reports }: { reports: MedicalReport[] }) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,102,136,0.04)] border border-surface-container">
      <h3 className="text-xl font-bold mb-6 font-headline">检查报告档案</h3>
      {reports.length === 0 ? (
        <div className="text-center py-8 text-outline text-sm">
          <FileImage className="w-10 h-10 mx-auto mb-2 opacity-30" />
          还没有上传任何报告
          <br />
          <span className="text-xs opacity-80">点击页面右上"上传报告"</span>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
          {reports.slice(0, 5).map((r, idx) => {
            const hasAbnormal = r.items.some(
              (i) => i.abnormal && i.abnormal !== 'normal',
            );
            return (
              <div key={r.id} className="relative pl-10">
                <div className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center bg-surface-container-lowest">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full ring-4 shadow-sm',
                      idx === 0
                        ? hasAbnormal
                          ? 'bg-error ring-error/20'
                          : 'bg-primary ring-primary/20'
                        : 'bg-outline-variant ring-outline-variant/20',
                    )}
                  />
                </div>
                <div
                  className={cn(
                    'p-3 rounded-2xl transition-colors',
                    idx === 0
                      ? 'bg-surface/50 border border-surface-container-high hover:bg-surface-container-low cursor-pointer'
                      : 'p-3',
                  )}
                >
                  <p
                    className={cn(
                      'text-xs font-bold mb-1',
                      idx === 0 ? 'text-primary' : 'text-outline',
                    )}
                  >
                    {formatFriendlyDate(r.examinedAt)}
                  </p>
                  <p className="font-bold text-on-surface text-[15px]">{r.title}</p>
                  <p className="text-sm text-secondary line-clamp-2 mt-1.5 leading-relaxed">
                    {r.hospital ? `${r.hospital} · ` : ''}
                    {r.aiNotes ||
                      `共 ${r.items.length} 项指标${hasAbnormal ? '，存在异常' : ''}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {reports.length > 5 && (
        <button className="w-full mt-6 py-3.5 bg-surface-container text-on-secondary-container rounded-xl font-bold text-sm hover:bg-surface-container-high active:scale-95 transition-all">
          查看全部 {reports.length} 份报告
        </button>
      )}
    </div>
  );
}

function UploadCorner({ patientId }: { patientId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<MedicalReport | null>(null);

  const onFile = async (file: File) => {
    if (!hasValidAPIKey()) {
      setError('请先在设置中填入通义千问 API Key');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await fileToDataURL(file);
      const ocr = getOCRProvider();
      const result = await ocr.recognize(dataUrl);
      const examinedAt = result.examinedAt
        ? new Date(result.examinedAt).getTime()
        : Date.now();
      const report = await getRepositories().reports.create({
        patientId,
        title: result.title || '检查报告',
        hospital: result.hospital,
        examinedAt: isNaN(examinedAt) ? Date.now() : examinedAt,
        imageDataUrl: dataUrl,
        rawText: result.rawText,
        items: result.items,
        aiNotes: result.aiNotes,
      });
      setPreview(report);
    } catch (e) {
      setError(e instanceof Error ? e.message : '识别失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'h-12 px-5 rounded-xl bg-gradient-medical text-white font-semibold shadow-lg active:scale-95 transition flex items-center gap-2 disabled:opacity-60 shrink-0',
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI 识别中
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            上传报告
          </>
        )}
      </button>
      {error && (
        <div className="basis-full text-sm text-error flex items-center gap-2 mt-1">
          <X className="w-4 h-4" />
          {error}
          {!hasValidAPIKey() && (
            <Link to="/settings" className="underline ml-1 flex items-center gap-1">
              <KeyRound className="w-3 h-3" /> 去设置
            </Link>
          )}
        </div>
      )}
      {preview && <ReportPreviewModal report={preview} onClose={() => setPreview(null)} />}
    </>
  );
}

function ReportPreviewModal({
  report,
  onClose,
}: {
  report: MedicalReport;
  onClose: () => void;
}) {
  const abnormals = report.items.filter((i) => i.abnormal && i.abnormal !== 'normal');
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-4 bg-primary-fixed/40 flex items-center justify-between sticky top-0 backdrop-blur">
          <h3 className="font-bold text-primary font-headline">识别结果预览</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/60 rounded-full transition"
            aria-label="关闭"
          >
            <X className="w-4 h-4 text-secondary" />
          </button>
        </header>
        <div className="p-6 space-y-5">
          {report.imageDataUrl && (
            <img
              src={report.imageDataUrl}
              alt={report.title}
              className="w-full max-h-64 object-contain rounded-xl border border-surface-container"
            />
          )}
          <div>
            <div className="text-lg font-bold text-on-surface font-headline">{report.title}</div>
            <div className="text-sm text-secondary mt-1 flex items-center gap-3 flex-wrap">
              {report.hospital && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {report.hospital}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatFriendlyDate(report.examinedAt)}
              </span>
            </div>
          </div>

          {report.aiNotes && (
            <div className="p-3 bg-tertiary-fixed/50 rounded-xl text-sm text-on-tertiary-fixed">
              {report.aiNotes}
            </div>
          )}

          {abnormals.length > 0 && (
            <div>
              <div className="text-xs font-bold text-error mb-2 uppercase tracking-wider">
                异常项 · {abnormals.length}
              </div>
              <ul className="space-y-1.5">
                {abnormals.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-error-container/40 rounded-lg"
                  >
                    <span className="font-semibold text-sm">{item.name}</span>
                    <span className="text-sm">
                      <span className="font-bold text-error">
                        {item.value}
                        {item.unit}
                      </span>
                      <span className="text-outline ml-2">
                        {item.abnormal === 'high' ? '↑' : '↓'}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="text-xs font-bold text-secondary mb-2 uppercase tracking-wider">
              全部指标 · {report.items.length}
            </div>
            <ul className="divide-y divide-surface-container-high">
              {report.items.map((item, idx) => (
                <li
                  key={idx}
                  className="py-2 flex items-center justify-between text-sm"
                >
                  <span>{item.name}</span>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'font-semibold',
                        item.abnormal === 'high' && 'text-error',
                        item.abnormal === 'low' && 'text-tertiary',
                      )}
                    >
                      {item.value}
                      {item.unit}
                    </span>
                    {item.reference && (
                      <span className="text-xs text-outline">({item.reference})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end pt-2 border-t border-surface-container">
            <button
              onClick={async () => {
                await getRepositories().reports.delete(report.id);
                onClose();
              }}
              className="text-sm text-error hover:bg-error-container/40 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
            >
              <Trash2 className="w-4 h-4" /> 删除此报告
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
