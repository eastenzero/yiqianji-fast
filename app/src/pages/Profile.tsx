import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Settings as SettingsIcon,
  Edit,
  Save,
  X,
  Users,
  Lightbulb,
  FolderCog,
  ShieldCheck,
  Download,
  BookOpen,
  HelpCircle,
  Headset,
  ChevronRight,
  RotateCcw,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { db, getRepositories } from '@/services/storage';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { ProfileRing } from '@/components/pure/ProfileRing';

type SuggestionLevel = 'low' | 'medium' | 'high';
type Suggestion = { title: string; detail: string; level: SuggestionLevel };

export default function Profile() {
  const patientId = useAppStore((s) => s.currentPatientId)!;
  const patient = useLiveQuery(async () => db.patients.get(patientId), [patientId]);

  const vitalsCount = useLiveQuery(
    async () => db.vitals.where('patientId').equals(patientId).count(),
    [patientId],
    0,
  );
  const symptomsCount = useLiveQuery(
    async () => db.symptoms.where('patientId').equals(patientId).count(),
    [patientId],
    0,
  );
  const medsCount = useLiveQuery(
    async () => db.medications.where('patientId').equals(patientId).count(),
    [patientId],
    0,
  );
  const reportsCount = useLiveQuery(
    async () => db.reports.where('patientId').equals(patientId).count(),
    [patientId],
    0,
  );
  const summariesCount = useLiveQuery(
    async () => db.summaries.where('patientId').equals(patientId).count(),
    [patientId],
    0,
  );
  const recentVitals = useLiveQuery(
    async () => {
      const since = Date.now() - 14 * 24 * 60 * 60 * 1000;
      return db.vitals
        .where('patientId')
        .equals(patientId)
        .and((v) => v.occurredAt >= since)
        .count();
    },
    [patientId],
    0,
  );
  const recentMeds = useLiveQuery(
    async () => {
      const since = Date.now() - 14 * 24 * 60 * 60 * 1000;
      return db.medications
        .where('patientId')
        .equals(patientId)
        .and((m) => m.takenAt >= since)
        .count();
    },
    [patientId],
    0,
  );

  /** 问诊准备度得分（0-100） */
  const { score, suggestions } = useMemo(() => {
    let score = 0;
    const suggestions: Suggestion[] = [];

    // 基本信息（20 分）
    if (patient?.name && patient?.gender && patient?.birthday) {
      score += 20;
    } else {
      suggestions.push({
        title: '完善基本信息',
        detail: '补齐姓名、性别、生日，帮助医生快速了解你',
        level: 'medium',
      });
    }
    if (patient && (patient.conditions?.length || patient.allergies?.length)) {
      score += 5;
    }

    // 近期体征（30 分）
    if ((recentVitals ?? 0) >= 10) {
      score += 30;
    } else if ((recentVitals ?? 0) >= 3) {
      score += 15;
      suggestions.push({
        title: '继续坚持体征记录',
        detail: `近 14 天已记录 ${recentVitals} 次，建议每日至少 1 次`,
        level: 'low',
      });
    } else {
      suggestions.push({
        title: '缺少近期体征记录',
        detail: '连续记录能让 AI 摘要更准确',
        level: 'high',
      });
    }

    // 近期用药（20 分）
    if ((recentMeds ?? 0) >= 10) {
      score += 20;
    } else if ((recentMeds ?? 0) >= 3) {
      score += 10;
    } else if ((medsCount ?? 0) > 0) {
      score += 5;
      suggestions.push({
        title: '补充用药频次',
        detail: '近期用药打卡次数较少，建议每次按时记录',
        level: 'medium',
      });
    }

    // 症状补记（15 分）
    if ((symptomsCount ?? 0) >= 3) score += 15;
    else if ((symptomsCount ?? 0) >= 1) score += 8;

    // 报告（10 分）
    if ((reportsCount ?? 0) >= 1) score += 10;

    // 摘要（10 分）
    if ((summariesCount ?? 0) >= 1) score += 10;
    else
      suggestions.push({
        title: '生成就诊前摘要',
        detail: '让 AI 帮你整理一份医生可读的摘要',
        level: 'medium',
      });

    return { score: Math.min(100, score), suggestions: suggestions.slice(0, 3) };
  }, [patient, recentVitals, recentMeds, medsCount, symptomsCount, reportsCount, summariesCount]);

  const scoreLevel =
    score >= 80 ? '优秀准备' : score >= 60 ? '良好准备' : score >= 40 ? '基础准备' : '需要加强';
  const scoreHint =
    score >= 80
      ? '您的记录非常详尽，对医生具有极高参考价值。'
      : score >= 60
        ? '核心信息齐全，坚持记录可进一步提升。'
        : '继续完善记录，让每一次就诊更高效。';

  /* ===== 编辑模式 ===== */
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthday, setBirthday] = useState('');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');

  useEffect(() => {
    if (!patient) return;
    setName(patient.name);
    setGender(patient.gender);
    setBirthday(patient.birthday || '');
    setConditions(patient.conditions.join('、'));
    setAllergies((patient.allergies || []).join('、'));
  }, [patient]);

  const save = async () => {
    if (!patient) return;
    await getRepositories().patients.update(patient.id, {
      name: name.trim(),
      gender,
      birthday: birthday || undefined,
      conditions: conditions.split(/[、,，\s]+/).map((s) => s.trim()).filter(Boolean),
      allergies: allergies.split(/[、,，\s]+/).map((s) => s.trim()).filter(Boolean),
    });
    setEditing(false);
  };

  if (!patient) {
    return <div className="text-center py-20 text-outline">加载中…</div>;
  }

  const age = patient.birthday
    ? new Date().getFullYear() - new Date(patient.birthday).getFullYear()
    : null;
  const avatarLetter = patient.name ? patient.name[0] : '我';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* 用户身份卡 */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 relative overflow-hidden flex items-center gap-5 shadow-[0_8px_32px_rgba(0,102,136,0.04)] border border-surface-container">
        <div className="w-20 h-20 rounded-[1.25rem] overflow-hidden bg-gradient-medical border-2 border-primary-container/20 shrink-0 flex items-center justify-center text-white text-3xl font-bold font-headline">
          {avatarLetter}
        </div>
        <div className="flex flex-col gap-1.5 flex-1 p-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-on-surface font-headline truncate">
              {patient.name}
            </h2>
            <span className="bg-secondary-container text-on-secondary-container text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm shrink-0">
              <Users className="w-3 h-3" />
              本地账户
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {patient.conditions.slice(0, 3).map((c) => (
              <span
                key={c}
                className="bg-primary-container text-on-primary-container text-xs font-semibold px-2.5 py-0.5 rounded-lg shadow-sm"
              >
                {c}
              </span>
            ))}
            {age && (
              <span className="bg-surface-container-high text-secondary text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                {age} 岁
              </span>
            )}
            {patient.gender && (
              <span className="bg-surface-container-high text-secondary text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                {{ male: '男', female: '女', other: '其他' }[patient.gender]}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="p-2 text-outline/50 hover:text-outline transition-colors shrink-0"
          aria-label="编辑资料"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </section>

      {/* 问诊准备度 + 提升建议 */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <ProfileRing
          score={score}
          level={scoreLevel}
          hint={scoreHint}
          className="md:col-span-3"
        />
        <SuggestionsCard suggestions={suggestions} />
      </section>

      {/* 数据统计 Bento */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_16px_rgba(0,102,136,0.02)] border border-surface-container">
        <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2 font-headline">
          <HeartPulse className="w-5 h-5 text-primary" />
          我的数据
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatTile label="体征" value={vitalsCount ?? 0} color="cyan" />
          <StatTile label="症状" value={symptomsCount ?? 0} color="amber" />
          <StatTile label="用药" value={medsCount ?? 0} color="purple" />
          <StatTile label="报告" value={reportsCount ?? 0} color="emerald" />
          <StatTile label="摘要" value={summariesCount ?? 0} color="primary" />
        </div>
      </section>

      {/* 隐私与数据 */}
      <section className="space-y-3">
        <h3 className="px-2 text-[13px] font-bold text-outline tracking-wider uppercase font-headline">
          隐私与数据
        </h3>
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_4px_16px_rgba(0,102,136,0.02)] border border-surface-container">
          <ListRow
            icon={FolderCog}
            label="本地健康档案"
            hint={`${(vitalsCount ?? 0) + (symptomsCount ?? 0) + (medsCount ?? 0)} 条记录保存在本机`}
          />
          <Divider />
          <ListRow
            icon={ShieldCheck}
            label="数据仅本地保存"
            hint="使用浏览器 IndexedDB，不会上传服务器"
          />
          <Divider />
          <ListRow
            icon={Download}
            label="导出我的数据"
            hint="JSON 格式（开发中）"
            onClick={() => {
              alert('数据导出功能开发中');
            }}
          />
        </div>
      </section>

      {/* 帮助与支持 */}
      <section className="space-y-3">
        <h3 className="px-2 text-[13px] font-bold text-outline tracking-wider uppercase font-headline">
          帮助与支持
        </h3>
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_4px_16px_rgba(0,102,136,0.02)] border border-surface-container">
          <div className="grid grid-cols-3 divide-x divide-surface-container">
            <HelpTile icon={BookOpen} label="使用指南" />
            <HelpTile icon={HelpCircle} label="常见问题" />
            <HelpTile icon={Headset} label="反馈建议" />
          </div>
        </div>
      </section>

      {/* 设置入口 */}
      <Link
        to="/settings"
        className="flex items-center justify-between p-5 bg-surface-container-lowest rounded-3xl border border-surface-container hover:bg-surface-container-low transition shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-cyan-700" />
          </div>
          <div>
            <div className="font-bold text-on-surface text-[15px]">设置与 API Key</div>
            <div className="text-xs text-outline">配置通义千问、清除本地数据</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-outline" />
      </Link>

      {/* Footer */}
      <footer className="pt-4 pb-8 text-center space-y-3">
        <div className="flex justify-center gap-6 text-sm font-bold text-outline">
          <a className="hover:text-primary transition-colors cursor-pointer">服务条款</a>
          <a className="hover:text-primary transition-colors cursor-pointer">隐私政策</a>
        </div>
        <p className="text-xs text-outline/60 font-medium">医前记 · v0.1.0</p>
        <p className="text-[10px] text-outline/40 leading-relaxed px-8">
          本程序旨在辅助记录病程，不作为临床诊断依据。
          <br />
          您的数据仅保存在本机浏览器中。
        </p>
      </footer>

      {/* 编辑弹窗 */}
      {editing && (
        <EditModal
          name={name}
          gender={gender}
          birthday={birthday}
          conditions={conditions}
          allergies={allergies}
          onChange={{
            name: setName,
            gender: setGender,
            birthday: setBirthday,
            conditions: setConditions,
            allergies: setAllergies,
          }}
          onSave={save}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}

/* ========== 提升建议卡 ========== */
function SuggestionsCard({ suggestions }: { suggestions: Suggestion[] }) {
  return (
    <div className="md:col-span-2 bg-gradient-medical rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10">
        <h3 className="text-base font-bold font-headline mb-4 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          提升建议
        </h3>
        {suggestions.length === 0 ? (
          <div className="text-xs bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 inline mr-1" />
            太棒了！当前记录已经非常完整。
          </div>
        ) : (
          <ul className="space-y-3">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                className="text-xs bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
              >
                <p className="font-bold mb-1 text-[13px]">{s.title}</p>
                <p className="opacity-90 font-medium tracking-wide">{s.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ========== 数据统计小卡 ========== */
function StatTile({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'cyan' | 'amber' | 'purple' | 'emerald' | 'primary';
}) {
  const bg = {
    cyan: 'bg-cyan-50',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
    emerald: 'bg-emerald-50',
    primary: 'bg-primary-fixed',
  }[color];
  const text = {
    cyan: 'text-cyan-700',
    amber: 'text-amber-700',
    purple: 'text-purple-700',
    emerald: 'text-emerald-700',
    primary: 'text-primary',
  }[color];
  return (
    <div className={cn('rounded-2xl p-4 text-center', bg)}>
      <div className={cn('text-2xl font-extrabold font-headline', text)}>{value}</div>
      <div className="text-[11px] text-secondary mt-1 font-semibold">{label}</div>
    </div>
  );
}

/* ========== 列表行 ========== */
function ListRow({
  icon: Icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors group px-5 text-left"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
          <Icon className="text-cyan-700 w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-on-surface text-[15px]">{label}</div>
          {hint && <div className="text-xs text-outline mt-0.5">{hint}</div>}
        </div>
      </div>
      <ChevronRight className="text-outline group-hover:translate-x-1 transition-transform w-5 h-5" />
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-surface-container mx-6" />;
}

function HelpTile({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button className="p-6 flex flex-col items-center gap-3 hover:bg-surface-container-low transition-colors cursor-pointer group">
      <Icon className="text-cyan-700 w-6 h-6 group-hover:-translate-y-1 transition-transform" />
      <span className="text-xs font-bold text-on-surface-variant">{label}</span>
    </button>
  );
}

/* ========== 编辑弹窗 ========== */
function EditModal({
  name,
  gender,
  birthday,
  conditions,
  allergies,
  onChange,
  onSave,
  onCancel,
}: {
  name: string;
  gender: 'male' | 'female' | 'other';
  birthday: string;
  conditions: string;
  allergies: string;
  onChange: {
    name: (v: string) => void;
    gender: (v: 'male' | 'female' | 'other') => void;
    birthday: (v: string) => void;
    conditions: (v: string) => void;
    allergies: (v: string) => void;
  };
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-4 flex items-center justify-between border-b border-surface-container sticky top-0 bg-white z-10">
          <h3 className="font-bold text-on-surface font-headline flex items-center gap-2">
            <Edit className="w-4 h-4 text-primary" />
            编辑资料
          </h3>
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-surface-container rounded-full transition"
            aria-label="取消"
          >
            <X className="w-4 h-4 text-secondary" />
          </button>
        </header>
        <div className="p-6 space-y-4">
          <LabeledInput label="姓名" value={name} onChange={onChange.name} />
          <div>
            <label className="text-xs text-secondary font-medium">性别</label>
            <div className="flex gap-2 mt-1">
              {(['male', 'female', 'other'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => onChange.gender(g)}
                  className={cn(
                    'flex-1 h-11 rounded-xl font-medium transition',
                    gender === g
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-surface-container text-secondary',
                  )}
                >
                  {{ male: '男', female: '女', other: '其他' }[g]}
                </button>
              ))}
            </div>
          </div>
          <LabeledInput
            label="出生日期"
            value={birthday}
            onChange={onChange.birthday}
            type="date"
          />
          <LabeledInput
            label="慢病标签（顿号/逗号分隔）"
            value={conditions}
            onChange={onChange.conditions}
            placeholder="高血压二期、糖尿病"
          />
          <LabeledInput
            label="过敏史（顿号/逗号分隔）"
            value={allergies}
            onChange={onChange.allergies}
            placeholder="青霉素、海鲜"
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 h-12 rounded-xl bg-surface-container text-secondary font-semibold flex items-center justify-center gap-1 transition"
            >
              <RotateCcw className="w-4 h-4" />
              取消
            </button>
            <button
              onClick={onSave}
              className="flex-1 h-12 rounded-xl bg-gradient-medical text-white font-semibold flex items-center justify-center gap-1 active:scale-[0.98] transition"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({
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
    <div>
      <label className="text-xs text-secondary font-medium">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container-high focus:border-primary focus:bg-white transition outline-none font-body"
      />
    </div>
  );
}
