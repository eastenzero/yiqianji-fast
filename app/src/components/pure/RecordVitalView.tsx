import { Activity, Stethoscope, Pill, Utensils, Plus } from 'lucide-react';

/**
 * 体征录入视图（Pure Component）
 *
 * 从 `pages/Record.tsx` 的 VitalTab 抽取 · 无 store / dexie / 输入事件
 * 所有值由 props 传入，组件完全无状态，用于视频场景模拟"用户正在录入"。
 *
 * 主要支持血压录入（systolic/diastolic）· 其他 kind 走统一的 numValue
 */

type VitalKind = 'bp' | 'bg' | 'hr' | 'temp';
type RecordTab = 'vital' | 'symptom' | 'medication' | 'lifestyle';

export interface VitalRecentItem {
  id: string;
  kind: VitalKind;
  /** 血压字符串，如 "135/90"；其它 kind 为单值 */
  display: string;
  /** 单位 */
  unit: string;
  /** 友好时间，如"今天 10:32"或"昨天" */
  timeLabel: string;
  note?: string;
}

export interface RecordVitalViewProps {
  /** 当前 Tab · 默认 vital */
  activeTab?: RecordTab;
  /** 体征类型 · 默认 bp */
  kind?: VitalKind;
  /** 收缩压（字符串，可空） */
  systolic?: string;
  /** 舒张压（字符串，可空） */
  diastolic?: string;
  /** 非血压 kind 的数值 */
  numValue?: string;
  /** 备注文字 */
  note?: string;
  /** 保存中状态 */
  saving?: boolean;
  /** 最近记录列表（最多 20） */
  recentList?: VitalRecentItem[];
}

const TABS: {
  key: RecordTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'vital', label: '体征', icon: Activity },
  { key: 'symptom', label: '症状', icon: Stethoscope },
  { key: 'medication', label: '用药', icon: Pill },
  { key: 'lifestyle', label: '生活', icon: Utensils },
];

const KIND_LABEL: Record<VitalKind, string> = {
  bp: '血压',
  bg: '血糖',
  hr: '心率',
  temp: '体温',
};

const KIND_UNIT: Record<VitalKind, string> = {
  bp: 'mmHg',
  bg: 'mmol/L',
  hr: 'bpm',
  temp: '℃',
};

const KIND_PLACEHOLDER: Record<VitalKind, string> = {
  bp: '120',
  bg: '5.5',
  hr: '72',
  temp: '36.5',
};

export function RecordVitalView({
  activeTab = 'vital',
  kind = 'bp',
  systolic = '',
  diastolic = '',
  numValue = '',
  note = '',
  saving = false,
  recentList = [],
}: RecordVitalViewProps) {
  return (
    <div className="space-y-6">
      {/* 页面标题 · 与真实 Record.tsx 一致 */}
      <header>
        <h2 className="text-3xl font-extrabold text-on-surface font-headline">
          健康记录
        </h2>
        <p className="text-secondary text-sm mt-1">
          持续记录，帮助 AI 生成更精准的就诊摘要
        </p>
      </header>

      {/* 四个 Tab 切换 */}
      <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-2xl overflow-x-auto hide-scrollbar">
        {TABS.map((t) => {
          const active = activeTab === t.key;
          const Icon = t.icon;
          return (
            <div
              key={t.key}
              className={
                'flex-1 min-w-[72px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ' +
                (active
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-secondary')
              }
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </div>
          );
        })}
      </div>

      {/* 录入表单卡 */}
      <Card title="记录新体征">
        {/* kind 选择器 */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['bp', 'bg', 'hr', 'temp'] as const).map((k) => {
            const isActive = kind === k;
            return (
              <div
                key={k}
                className={
                  'px-4 py-2 rounded-full text-sm font-semibold transition ' +
                  (isActive
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-secondary')
                }
              >
                {KIND_LABEL[k]}
              </div>
            );
          })}
        </div>

        {kind === 'bp' ? (
          <div className="flex gap-3 items-end">
            <Field
              label="收缩压 (mmHg)"
              value={systolic}
              placeholder="120"
            />
            <span className="text-secondary pb-3">/</span>
            <Field
              label="舒张压 (mmHg)"
              value={diastolic}
              placeholder="80"
            />
          </div>
        ) : (
          <Field
            label={
              kind === 'bg'
                ? '血糖 (mmol/L)'
                : kind === 'hr'
                  ? '心率 (bpm)'
                  : '体温 (℃)'
            }
            value={numValue}
            placeholder={KIND_PLACEHOLDER[kind]}
          />
        )}

        <Field label="备注（可选）" value={note} placeholder="如：晨起空腹" />

        <div
          className={
            'mt-4 w-full h-12 rounded-xl bg-gradient-medical text-white font-semibold transition flex items-center justify-center gap-2 ' +
            (saving ? 'opacity-60' : '')
          }
        >
          <Plus className="w-5 h-5" />
          {saving ? '保存中…' : '保存记录'}
        </div>
      </Card>

      {/* 最近记录 */}
      <Card title={`最近记录（${recentList.length}）`}>
        {recentList.length === 0 ? (
          <div className="text-center text-secondary py-6 text-sm">
            还没有体征记录
          </div>
        ) : (
          <ul className="divide-y divide-surface-container-high">
            {recentList.slice(0, 8).map((v) => (
              <li key={v.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-on-surface">
                    {KIND_LABEL[v.kind]} · {v.display} {v.unit}
                  </div>
                  <div className="text-xs text-outline mt-0.5">
                    {v.timeLabel}
                    {v.note ? ` · ${v.note}` : ''}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-surface-container">
      <h3 className="font-bold text-on-surface mb-4">{title}</h3>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
}) {
  const isEmpty = !value;
  return (
    <div className="flex-1 mt-3 first:mt-0">
      <label className="text-xs text-secondary font-medium block mb-1.5">
        {label}
      </label>
      <div
        className={
          'h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container-high text-base font-medium flex items-center ' +
          (isEmpty ? 'text-outline' : 'text-on-surface')
        }
      >
        {isEmpty ? placeholder : value}
      </div>
    </div>
  );
}
