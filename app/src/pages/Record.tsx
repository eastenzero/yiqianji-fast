import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Activity, Stethoscope, Pill, Utensils, Plus, ChevronRight } from 'lucide-react';
import { db, getRepositories } from '@/services/storage';
import { useAppStore } from '@/stores/app-store';
import { cn, formatFriendlyDate } from '@/lib/utils';

type Tab = 'vital' | 'symptom' | 'lifestyle' | 'medication';

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'vital', label: '体征', icon: Activity },
  { key: 'symptom', label: '症状', icon: Stethoscope },
  { key: 'medication', label: '用药', icon: Pill },
  { key: 'lifestyle', label: '生活', icon: Utensils },
];

export default function Record() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('type') as Tab) || 'vital';
  const setTab = (t: Tab) => setParams({ type: t });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-extrabold text-on-surface font-headline">健康记录</h2>
        <p className="text-secondary text-sm mt-1">持续记录，帮助 AI 生成更精准的就诊摘要</p>
      </header>

      {/* Tab 切换 */}
      <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-2xl overflow-x-auto hide-scrollbar">
        {TABS.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-1 min-w-[72px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all',
                active
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-secondary hover:text-primary',
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'vital' && <VitalTab />}
      {tab === 'symptom' && <SymptomTab />}
      {tab === 'medication' && <MedicationTab />}
      {tab === 'lifestyle' && <LifestyleTab />}
    </div>
  );
}

// ============ 体征 ============
function VitalTab() {
  const patientId = useAppStore((s) => s.currentPatientId)!;
  const list = useLiveQuery(
    async () => db.vitals.where('patientId').equals(patientId).reverse().sortBy('occurredAt'),
    [patientId],
    [],
  );
  const recent = useMemo(() => (list ?? []).slice(0, 20), [list]);

  const [kind, setKind] = useState<'bp' | 'bg' | 'hr' | 'temp'>('bp');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [numValue, setNumValue] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const repo = getRepositories();
      const unit = { bp: 'mmHg', bg: 'mmol/L', hr: 'bpm', temp: '℃' }[kind];
      const value =
        kind === 'bp'
          ? { systolic: Number(systolic), diastolic: Number(diastolic) }
          : Number(numValue);
      if (kind === 'bp' && (!systolic || !diastolic)) return;
      if (kind !== 'bp' && !numValue) return;
      await repo.vitals.create({
        patientId,
        kind,
        value,
        unit,
        note: note || undefined,
        occurredAt: Date.now(),
      });
      setSystolic('');
      setDiastolic('');
      setNumValue('');
      setNote('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="记录新体征">
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['bp', 'bg', 'hr', 'temp'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold transition',
                kind === k
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-secondary hover:bg-surface-container-high',
              )}
            >
              {{ bp: '血压', bg: '血糖', hr: '心率', temp: '体温' }[k]}
            </button>
          ))}
        </div>

        {kind === 'bp' ? (
          <div className="flex gap-3 items-end">
            <Field
              label="收缩压 (mmHg)"
              value={systolic}
              onChange={setSystolic}
              type="number"
              placeholder="120"
            />
            <span className="text-secondary pb-3">/</span>
            <Field
              label="舒张压 (mmHg)"
              value={diastolic}
              onChange={setDiastolic}
              type="number"
              placeholder="80"
            />
          </div>
        ) : (
          <Field
            label={{ bg: '血糖 (mmol/L)', hr: '心率 (bpm)', temp: '体温 (℃)' }[kind]}
            value={numValue}
            onChange={setNumValue}
            type="number"
            placeholder="..."
          />
        )}

        <Field label="备注（可选）" value={note} onChange={setNote} placeholder="如：晨起空腹" />

        <button
          onClick={submit}
          disabled={saving}
          className="mt-4 w-full h-12 rounded-xl bg-gradient-medical text-white font-semibold disabled:opacity-60 transition active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {saving ? '保存中…' : '保存记录'}
        </button>
      </Card>

      <Card title={`最近记录（${recent.length}）`}>
        {recent.length === 0 ? (
          <EmptyHint text="还没有体征记录" />
        ) : (
          <ul className="divide-y divide-surface-container-high">
            {recent.map((v) => {
              const label = { bp: '血压', bg: '血糖', hr: '心率', temp: '体温', weight: '体重', spo2: '血氧' }[v.kind];
              const val =
                typeof v.value === 'number'
                  ? `${v.value} ${v.unit}`
                  : `${v.value.systolic}/${v.value.diastolic} ${v.unit}`;
              return (
                <li key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-on-surface">
                      {label} · {val}
                    </div>
                    <div className="text-xs text-outline mt-0.5">
                      {formatFriendlyDate(v.occurredAt)}
                      {v.note ? ` · ${v.note}` : ''}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-outline" />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ============ 症状 ============
function SymptomTab() {
  const patientId = useAppStore((s) => s.currentPatientId)!;
  const list = useLiveQuery(
    async () => db.symptoms.where('patientId').equals(patientId).reverse().sortBy('occurredAt'),
    [patientId],
    [],
  );
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [triggers, setTriggers] = useState('');
  const [reliefs, setReliefs] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await getRepositories().symptoms.create({
        patientId,
        title: title.trim(),
        severity,
        triggers: triggers ? triggers.split(/[,，、]/).map((s) => s.trim()).filter(Boolean) : undefined,
        reliefs: reliefs ? reliefs.split(/[,，、]/).map((s) => s.trim()).filter(Boolean) : undefined,
        note: note || undefined,
        occurredAt: Date.now(),
      });
      setTitle('');
      setTriggers('');
      setReliefs('');
      setNote('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="补记不适症状">
        <Field label="主诉" value={title} onChange={setTitle} placeholder="如：胸闷、头痛" />

        <div className="mt-3">
          <label className="text-xs text-secondary font-medium">严重程度</label>
          <div className="flex gap-2 mt-2">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <button
                key={n}
                onClick={() => setSeverity(n)}
                className={cn(
                  'flex-1 h-10 rounded-lg font-bold transition',
                  severity === n
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-secondary',
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-outline mt-1 flex justify-between">
            <span>轻微</span>
            <span>剧烈</span>
          </div>
        </div>

        <Field label="诱因（逗号分隔）" value={triggers} onChange={setTriggers} placeholder="爬楼梯, 情绪激动" />
        <Field label="缓解方式（逗号分隔）" value={reliefs} onChange={setReliefs} placeholder="休息, 深呼吸" />
        <Field label="备注" value={note} onChange={setNote} placeholder="如：持续约 15 分钟" />

        <button
          onClick={submit}
          disabled={saving || !title.trim()}
          className="mt-4 w-full h-12 rounded-xl bg-gradient-medical text-white font-semibold disabled:opacity-60 transition active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {saving ? '保存中…' : '保存记录'}
        </button>
      </Card>

      <Card title={`症状历史（${list?.length ?? 0}）`}>
        {!list?.length ? (
          <EmptyHint text="还没有症状记录" />
        ) : (
          <ul className="divide-y divide-surface-container-high">
            {list.map((s) => (
              <li key={s.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-on-surface">
                    {s.title}
                    <span className="ml-2 text-xs text-tertiary">程度 {s.severity}/5</span>
                  </div>
                  <div className="text-xs text-outline">{formatFriendlyDate(s.occurredAt)}</div>
                </div>
                {s.triggers?.length ? (
                  <div className="text-xs text-secondary mt-1">诱因：{s.triggers.join('、')}</div>
                ) : null}
                {s.reliefs?.length ? (
                  <div className="text-xs text-secondary">缓解：{s.reliefs.join('、')}</div>
                ) : null}
                {s.note ? <div className="text-xs text-secondary">{s.note}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ============ 用药 ============
function MedicationTab() {
  const patientId = useAppStore((s) => s.currentPatientId)!;
  const list = useLiveQuery(
    async () => db.medications.where('patientId').equals(patientId).reverse().sortBy('takenAt'),
    [patientId],
    [],
  );
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('qd');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await getRepositories().medications.create({
        patientId,
        name: name.trim(),
        dosage,
        frequency,
        note: note || undefined,
        takenAt: Date.now(),
      });
      setName('');
      setDosage('');
      setNote('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="打卡用药">
        <Field label="药名" value={name} onChange={setName} placeholder="如：苯磺酸氨氯地平片" />
        <Field label="剂量" value={dosage} onChange={setDosage} placeholder="5mg" />
        <div className="mt-3">
          <label className="text-xs text-secondary font-medium">频次</label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {['qd', 'bid', 'tid', 'qn', 'prn'].map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition',
                  frequency === f
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-secondary',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <Field label="备注" value={note} onChange={setNote} placeholder="饭后服用" />
        <button
          onClick={submit}
          disabled={saving || !name.trim()}
          className="mt-4 w-full h-12 rounded-xl bg-gradient-medical text-white font-semibold disabled:opacity-60 transition active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {saving ? '保存中…' : '保存用药'}
        </button>
      </Card>

      <Card title={`用药历史（${list?.length ?? 0}）`}>
        {!list?.length ? (
          <EmptyHint text="还没有用药记录" />
        ) : (
          <ul className="divide-y divide-surface-container-high">
            {list.slice(0, 20).map((m) => (
              <li key={m.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-on-surface">
                    {m.name} <span className="text-secondary text-sm font-normal">{m.dosage} {m.frequency}</span>
                  </div>
                  <div className="text-xs text-outline">{formatFriendlyDate(m.takenAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ============ 生活 ============
function LifestyleTab() {
  const patientId = useAppStore((s) => s.currentPatientId)!;
  const list = useLiveQuery(
    async () => db.lifestyles.where('patientId').equals(patientId).reverse().sortBy('occurredAt'),
    [patientId],
    [],
  );
  const [kind, setKind] = useState<'diet' | 'exercise' | 'sleep'>('diet');
  const [content, setContent] = useState('');
  const [minutes, setMinutes] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await getRepositories().lifestyles.create({
        patientId,
        kind,
        content: content.trim(),
        durationMinutes: minutes ? Number(minutes) : undefined,
        occurredAt: Date.now(),
      });
      setContent('');
      setMinutes('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="记录生活习惯">
        <div className="flex gap-2 mb-4">
          {(['diet', 'exercise', 'sleep'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold transition',
                kind === k
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-secondary hover:bg-surface-container-high',
              )}
            >
              {{ diet: '饮食', exercise: '运动', sleep: '睡眠' }[k]}
            </button>
          ))}
        </div>
        <Field label="内容" value={content} onChange={setContent} placeholder="如：散步 30 分钟 / 低盐早餐" />
        {(kind === 'exercise' || kind === 'sleep') && (
          <Field
            label={kind === 'sleep' ? '时长（分钟）' : '时长（分钟）'}
            value={minutes}
            onChange={setMinutes}
            type="number"
            placeholder="30"
          />
        )}
        <button
          onClick={submit}
          disabled={saving || !content.trim()}
          className="mt-4 w-full h-12 rounded-xl bg-gradient-medical text-white font-semibold disabled:opacity-60 transition active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {saving ? '保存中…' : '保存记录'}
        </button>
      </Card>
      <Card title={`生活记录（${list?.length ?? 0}）`}>
        {!list?.length ? (
          <EmptyHint text="还没有生活记录" />
        ) : (
          <ul className="divide-y divide-surface-container-high">
            {list.slice(0, 20).map((l) => (
              <li key={l.id} className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-semibold">
                    {{ diet: '饮食', exercise: '运动', sleep: '睡眠' }[l.kind]}
                  </span>
                  <span className="text-xs text-outline">{formatFriendlyDate(l.occurredAt)}</span>
                </div>
                <div className="text-on-surface mt-1">{l.content}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ============ 通用组件 ============
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl p-5 shadow-sm border border-surface-container">
      <h3 className="font-bold text-on-surface mb-3">{title}</h3>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="mt-3">
      <label className="text-xs text-secondary font-medium">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:bg-white transition outline-none"
      />
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <div className="text-center py-8 text-outline text-sm">{text}</div>;
}
