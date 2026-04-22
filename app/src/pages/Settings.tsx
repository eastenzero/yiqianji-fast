import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Trash2,
  RotateCcw,
  ExternalLink,
  KeyRound,
  Cpu,
  Crown,
  Sparkles,
  Download,
  Upload,
  Database,
  FileJson,
  Shield,
  BadgeCheck,
  Loader2,
} from 'lucide-react';
import {
  getRuntimeConfig,
  setRuntimeConfig,
  setProvider,
  hasValidAPIKey,
  PROVIDERS,
  type ProviderKey,
} from '@/lib/config';
import { resetAIProvider } from '@/services/ai';
import { resetOCRProvider } from '@/services/ocr';
import {
  wipeAllData,
  ensureEmptyPatient,
  loadDemoData,
  wipeRecordsOnly,
} from '@/services/seed';
import { downloadJSON, importFromFile } from '@/services/data-io';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

type TabKey = 'custom' | 'membership';

export default function Settings() {
  const setCurrentPatientId = useAppStore((s) => s.setCurrentPatientId);
  const currentPatientId = useAppStore((s) => s.currentPatientId);

  const [tab, setTab] = useState<TabKey>('custom');

  const [provider, setProviderState] = useState<ProviderKey>('qwen');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [textModel, setTextModel] = useState('');
  const [vlModel, setVlModel] = useState('');
  const [ocrUseSeparateKey, setOcrUseSeparateKey] = useState(false);
  const [ocrKey, setOcrKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showOcrKey, setShowOcrKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cfg = getRuntimeConfig();
    setProviderState(cfg.provider);
    setApiKey(cfg.qwenApiKey);
    setBaseUrl(cfg.qwenBaseUrl);
    setTextModel(cfg.qwenTextModel);
    setVlModel(cfg.qwenVlModel);
    setOcrUseSeparateKey(cfg.ocrUseSeparateKey);
    setOcrKey(cfg.ocrQwenApiKey);
  }, []);

  const onPickProvider = (key: ProviderKey) => {
    setProvider(key);
    const meta = PROVIDERS[key];
    setProviderState(key);
    setBaseUrl(meta.baseUrl);
    setTextModel(meta.defaultTextModel);
  };

  const save = () => {
    setRuntimeConfig({
      provider,
      qwenApiKey: apiKey.trim(),
      qwenBaseUrl: baseUrl.trim(),
      qwenTextModel: textModel.trim(),
      qwenVlModel: vlModel.trim(),
      ocrUseSeparateKey,
      ocrQwenApiKey: ocrKey.trim(),
    });
    resetAIProvider();
    resetOCRProvider();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const meta = PROVIDERS[provider];
  const keyValid = hasValidAPIKey();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex items-center gap-3">
        <Link
          to="/profile"
          className="p-2 rounded-full hover:bg-surface-container transition"
          aria-label="返回"
        >
          <ChevronLeft className="w-5 h-5 text-secondary" />
        </Link>
        <h2 className="text-3xl font-extrabold text-on-surface font-headline">设置</h2>
      </header>

      {/* Tab Bar */}
      <div className="bg-surface-container rounded-2xl p-1.5 flex gap-1.5 shadow-inner">
        <TabButton
          active={tab === 'custom'}
          onClick={() => setTab('custom')}
          icon={KeyRound}
          label="自己配置 API"
          hint="隐私优先"
        />
        <TabButton
          active={tab === 'membership'}
          onClick={() => setTab('membership')}
          icon={Crown}
          label="订阅会员"
          hint="便捷首选"
        />
      </div>

      {/* === Tab 1: 自己配置 === */}
      {tab === 'custom' && (
        <section className="space-y-6">
          {/* Provider 选择 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,102,136,0.04)] border border-surface-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-on-surface font-headline flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                选择 AI 服务商
              </h3>
              <span className="text-[10px] text-outline uppercase tracking-widest font-bold">
                {Object.keys(PROVIDERS).length} PROVIDERS
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(PROVIDERS) as ProviderKey[]).map((key) => (
                <ProviderCard
                  key={key}
                  meta={PROVIDERS[key]}
                  selected={provider === key}
                  onClick={() => onPickProvider(key)}
                />
              ))}
            </div>
          </div>

          {/* 当前 Provider 配置 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,102,136,0.04)] border border-surface-container space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-sm font-extrabold font-headline',
                    meta.logoColor,
                  )}
                >
                  {meta.logoLetter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-on-surface">{meta.name}</span>
                    {meta.demoBadge && (
                      <span className="bg-primary-fixed text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {meta.demoBadge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-secondary">{meta.tagline}</div>
                </div>
              </div>
              {meta.docsUrl && (
                <a
                  href={meta.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary underline mt-3"
                >
                  前往{meta.name}控制台申请 Key <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* API Key */}
            {meta.needsApiKey ? (
              <div>
                <label className="text-xs text-secondary font-medium">API Key</label>
                <div className="mt-1 relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={meta.keyPrefix ? `${meta.keyPrefix}...` : 'your-api-key'}
                    className="w-full h-11 px-3 pr-10 rounded-xl bg-surface-container-low border border-surface-container-high focus:border-primary focus:bg-white transition outline-none font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-secondary hover:text-primary"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {apiKey && meta.keyPrefix && !apiKey.startsWith(meta.keyPrefix) && (
                  <p className="text-xs text-tertiary mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    通常以 {meta.keyPrefix} 开头，请确认无误
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2 text-sm">
                <Shield className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div className="text-emerald-900">
                  <b>本地模型无需 API Key</b>
                  <div className="text-xs mt-0.5 opacity-80">
                    请确保本机已启动 Ollama（默认端口 11434），并已拉取相应模型。
                  </div>
                </div>
              </div>
            )}

            {/* Base URL + Model */}
            <Field
              label="Base URL"
              value={baseUrl}
              onChange={setBaseUrl}
              readOnly={provider !== 'custom' && provider !== 'ollama'}
            />
            <div>
              <label className="text-xs text-secondary font-medium">文本模型</label>
              {meta.textModelOptions.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-2">
                  {meta.textModelOptions.map((m) => (
                    <button
                      key={m}
                      onClick={() => setTextModel(m)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold transition',
                        textModel === m
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface-container text-secondary hover:bg-surface-container-high',
                      )}
                    >
                      {m}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={textModel}
                    onChange={(e) => setTextModel(e.target.value)}
                    className="flex-1 min-w-[140px] h-8 px-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:bg-white transition outline-none text-xs font-mono"
                    placeholder="或手动输入"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={textModel}
                  onChange={(e) => setTextModel(e.target.value)}
                  placeholder="模型名称"
                  className="mt-1 w-full h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container-high focus:border-primary focus:bg-white transition outline-none font-mono text-sm"
                />
              )}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={save}
                disabled={meta.needsApiKey && !apiKey.trim()}
                className="flex-1 h-12 rounded-xl bg-gradient-medical text-white font-semibold disabled:opacity-50 transition active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <BadgeCheck className="w-4 h-4" />
                保存配置
              </button>
              {saved && (
                <span className="text-sm text-primary flex items-center gap-1 font-bold animate-in fade-in">
                  <Check className="w-4 h-4" /> 已保存
                </span>
              )}
            </div>

            <div
              className={cn(
                'text-xs rounded-xl px-4 py-3 flex items-center gap-2 font-medium',
                keyValid
                  ? 'bg-primary-fixed/40 text-primary'
                  : 'bg-tertiary-fixed/60 text-on-tertiary-fixed',
              )}
            >
              {keyValid ? (
                <>
                  <Check className="w-4 h-4 shrink-0" />
                  API 配置已就绪，可以生成摘要与识别报告
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {meta.needsApiKey
                    ? '尚未配置 API Key，AI 功能暂不可用'
                    : '本地模型需启动 Ollama 服务'}
                </>
              )}
            </div>
          </div>

          {/* OCR 单独区 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,102,136,0.04)] border border-surface-container space-y-4">
            <div>
              <h3 className="font-bold text-on-surface flex items-center gap-2 font-headline">
                <FileJson className="w-4 h-4 text-primary" />
                报告识别（OCR）
              </h3>
              <p className="text-xs text-secondary mt-1">
                检查报告多模态识别固定使用 <b>阿里通义 VL</b>（多模态识别对医疗版式优化过），不受主 Provider 影响。
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={!ocrUseSeparateKey}
                onChange={(e) => setOcrUseSeparateKey(!e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-on-surface">
                与主 API Key 共用（当主 Provider 是"阿里通义千问"时可用）
              </span>
            </label>

            {ocrUseSeparateKey && (
              <div>
                <label className="text-xs text-secondary font-medium">
                  OCR 独立 API Key（阿里通义）
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showOcrKey ? 'text' : 'password'}
                    value={ocrKey}
                    onChange={(e) => setOcrKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full h-11 px-3 pr-10 rounded-xl bg-surface-container-low border border-surface-container-high focus:border-primary focus:bg-white transition outline-none font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOcrKey((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-secondary hover:text-primary"
                  >
                    {showOcrKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <Field label="VL 模型" value={vlModel} onChange={setVlModel} />
          </div>
        </section>
      )}

      {/* === Tab 2: 会员 === */}
      {tab === 'membership' && <MembershipTab />}

      {/* 数据管理（Tab 外公共） */}
      <DataSection
        patientId={currentPatientId}
        onPatientChange={setCurrentPatientId}
      />

      {/* 关于 */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container space-y-3">
        <h3 className="font-bold text-on-surface font-headline">关于</h3>
        <p className="text-xs text-secondary">
          医前记 · 诊前信息整理与沟通辅助系统
        </p>
        <button
          onClick={() => {
            useAppStore.getState().setOnboarded(false);
            window.location.href = '/onboarding';
          }}
          className="w-full h-11 rounded-xl bg-surface-container text-secondary font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-high transition"
        >
          <RotateCcw className="w-4 h-4" />
          重新查看欢迎引导
        </button>
      </section>

      <footer className="text-center text-xs text-outline py-4">
        医前记 · Built with care · v0.1.0
      </footer>
    </div>
  );
}

/* ============== 子组件 ============== */

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 rounded-xl px-4 py-3 flex flex-col items-start gap-0.5 transition-all',
        active
          ? 'bg-white shadow-sm text-primary'
          : 'text-outline hover:bg-surface-container-highest',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', active && 'text-primary')} />
        <span className="font-bold text-sm">{label}</span>
      </div>
      <span className="text-[11px] opacity-70 font-medium">{hint}</span>
    </button>
  );
}

function ProviderCard({
  meta,
  selected,
  onClick,
}: {
  meta: ReturnType<typeof getRuntimeConfig> extends infer _ ? typeof PROVIDERS[ProviderKey] : never;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group text-left rounded-2xl p-3.5 transition-all relative overflow-hidden border-2',
        selected
          ? 'border-primary bg-primary-fixed/30 shadow-md'
          : 'border-transparent bg-surface-container-low hover:bg-surface-container',
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-[11px] font-extrabold font-headline shadow',
            meta.logoColor,
          )}
        >
          {meta.logoLetter}
        </div>
        {selected && (
          <BadgeCheck className="w-4 h-4 text-primary ml-auto shrink-0" />
        )}
      </div>
      <div className="font-bold text-sm text-on-surface truncate flex items-center gap-1.5">
        {meta.name}
      </div>
      <div className="text-[11px] text-outline mt-0.5 line-clamp-2 leading-relaxed">
        {meta.tagline}
      </div>
      {meta.demoBadge && !selected && (
        <span className="absolute top-2 right-2 bg-primary-fixed text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
          {meta.demoBadge}
        </span>
      )}
    </button>
  );
}

function MembershipTab() {
  const [selected, setSelected] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');

  const plans = [
    {
      key: 'monthly' as const,
      name: '月付',
      price: '¥9.9',
      period: '/ 月',
      hint: '灵活尝鲜',
      tag: null,
    },
    {
      key: 'yearly' as const,
      name: '年付',
      price: '¥88',
      period: '/ 年',
      hint: '平均每月 ¥7.3',
      tag: '省 27%',
    },
    {
      key: 'lifetime' as const,
      name: '终身',
      price: '¥388',
      period: '一次付费',
      hint: '永久升级',
      tag: '限时',
    },
  ];

  return (
    <section className="space-y-5">
      <div className="bg-gradient-medical rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-primary-fixed-dim/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur rounded-full">
            <Crown className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">
              Yiqianji Pro
            </span>
          </div>
          <h3 className="text-2xl font-extrabold font-headline leading-tight">
            无需配置，开箱即用
            <br />
            <span className="text-primary-fixed-dim">医学微调专属模型</span>
          </h3>
          <p className="text-sm opacity-90 font-body leading-relaxed max-w-md">
            我们为你托管了经过医学场景优化的推理服务，无需处理 API Key，也无需付 token 账单，一个订阅全搞定。
          </p>
        </div>
      </div>

      {/* 方案卡 */}
      <div className="grid grid-cols-3 gap-3">
        {plans.map((plan) => (
          <button
            key={plan.key}
            onClick={() => setSelected(plan.key)}
            className={cn(
              'relative rounded-2xl p-4 text-left transition-all border-2',
              selected === plan.key
                ? 'border-primary bg-primary-fixed/40 shadow-md'
                : 'border-transparent bg-surface-container-low hover:bg-surface-container',
            )}
          >
            {plan.tag && (
              <span className="absolute -top-2 right-2 bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                {plan.tag}
              </span>
            )}
            <div className="text-xs text-outline font-bold uppercase tracking-wider">
              {plan.name}
            </div>
            <div className="text-2xl font-extrabold font-headline text-on-surface mt-1">
              {plan.price}
            </div>
            <div className="text-[11px] text-secondary">{plan.period}</div>
            <div className="text-[11px] text-outline mt-2 line-clamp-2">{plan.hint}</div>
          </button>
        ))}
      </div>

      {/* 权益 */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,102,136,0.04)] border border-surface-container">
        <h4 className="font-bold text-on-surface mb-4 font-headline">会员权益</h4>
        <ul className="space-y-3">
          <Perk
            label="免配置直接使用"
            hint="无需申请与管理多家 API Key"
          />
          <Perk
            label="医学微调模型"
            hint="针对中文常见慢病语料优化的 Qianji-Med-7B"
          />
          <Perk
            label="更强 OCR 识别"
            hint="血常规 / 肝肾功 / 心电图等医疗版式深度优化"
          />
          <Perk
            label="云端加密同步（可选）"
            hint="本地仍为主存储，上云端由你手动开启"
          />
          <Perk
            label="优先客服 & 功能内测"
            hint="问题群一对一对接，每周灰度内测通道"
          />
        </ul>
      </div>

      {/* 购买 */}
      <button
        onClick={() =>
          alert(
            `演示：已选择「${plans.find((p) => p.key === selected)?.name}」方案。\n支付功能将在正式发布时接入支付宝/微信。`,
          )
        }
        className="w-full h-14 rounded-2xl bg-gradient-medical text-white font-bold text-lg shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        立即开通 {plans.find((p) => p.key === selected)?.name}
      </button>

      <p className="text-xs text-outline text-center px-8">
        演示版本：支付流程尚未接入。正式发布前会对接支付宝 / 微信 / Apple 内购。
      </p>
    </section>
  );
}

function Perk({ label, hint }: { label: string; hint: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
        <Check className="w-3.5 h-3.5 text-primary" />
      </div>
      <div>
        <div className="font-bold text-sm text-on-surface">{label}</div>
        <div className="text-xs text-secondary mt-0.5 leading-relaxed">{hint}</div>
      </div>
    </li>
  );
}

/* ============== 数据管理 ============== */

function DataSection({
  patientId,
  onPatientChange,
}: {
  patientId: string | null;
  onPatientChange: (id: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<null | 'export' | 'import' | 'demo' | 'wipe'>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const onExport = async () => {
    setBusy('export');
    try {
      await downloadJSON();
      showToast('已下载备份文件');
    } catch (e) {
      showToast('导出失败：' + (e instanceof Error ? e.message : '未知'));
    } finally {
      setBusy(null);
    }
  };

  const onImport = async (file: File) => {
    setBusy('import');
    try {
      const result = await importFromFile(file, { mode: 'replace' });
      if (result.patientId) {
        onPatientChange(result.patientId);
      }
      showToast(
        `已导入：${result.stats.patients} 档案 / ${result.stats.vitals} 体征 / ${result.stats.medications} 用药 / ${result.stats.reports} 报告`,
      );
    } catch (e) {
      showToast('导入失败：' + (e instanceof Error ? e.message : '未知'));
    } finally {
      setBusy(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onLoadDemo = async () => {
    setBusy('demo');
    try {
      let pid = patientId;
      if (!pid) {
        pid = await ensureEmptyPatient();
        onPatientChange(pid);
      } else {
        // 先清掉当前 patient 的旧记录再加载，避免重复叠加
        await wipeRecordsOnly(pid);
      }
      await loadDemoData(pid);
      showToast('演示数据已就绪，回首页看看吧');
    } catch (e) {
      showToast('加载演示失败：' + (e instanceof Error ? e.message : '未知'));
    } finally {
      setBusy(null);
    }
  };

  const onWipe = async () => {
    setBusy('wipe');
    try {
      await wipeAllData();
      const newId = await ensureEmptyPatient();
      onPatientChange(newId);
      setConfirmWipe(false);
      showToast('已清空所有记录，回到了初始状态');
    } catch (e) {
      showToast('清空失败：' + (e instanceof Error ? e.message : '未知'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,102,136,0.04)] border border-surface-container space-y-4">
      <div>
        <h3 className="font-bold text-on-surface flex items-center gap-2 font-headline">
          <Database className="w-4 h-4 text-primary" />
          我的数据
        </h3>
        <p className="text-xs text-secondary mt-1 leading-relaxed">
          你的数据完整保存在浏览器 IndexedDB 中，从不出本机。
          <br />
          支持导出 JSON 备份，换设备时一键还原。
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        <DataButton
          icon={Download}
          label="导出备份"
          hint="下载 JSON"
          onClick={onExport}
          loading={busy === 'export'}
          color="primary"
        />
        <DataButton
          icon={Upload}
          label="导入备份"
          hint="覆盖当前数据"
          onClick={() => fileInputRef.current?.click()}
          loading={busy === 'import'}
          color="primary"
        />
        <DataButton
          icon={Sparkles}
          label="加载演示数据"
          hint="14 天完整案例"
          onClick={onLoadDemo}
          loading={busy === 'demo'}
          color="tertiary"
        />
        <DataButton
          icon={Trash2}
          label="清空所有数据"
          hint="还原到初始状态"
          onClick={() => setConfirmWipe(true)}
          loading={busy === 'wipe'}
          color="error"
        />
      </div>

      {confirmWipe && (
        <div className="flex items-center gap-2 p-3 bg-error-container/40 rounded-xl border border-error/20">
          <AlertTriangle className="w-5 h-5 text-error shrink-0" />
          <div className="flex-1 text-sm text-error font-medium">
            确定要清空全部本地数据吗？此操作不可恢复。
          </div>
          <button
            onClick={onWipe}
            disabled={busy !== null}
            className="px-3 py-1.5 rounded-lg bg-error text-white text-sm font-semibold disabled:opacity-50"
          >
            确定
          </button>
          <button
            onClick={() => setConfirmWipe(false)}
            className="px-3 py-1.5 rounded-lg bg-surface-container text-sm font-medium"
          >
            取消
          </button>
        </div>
      )}

      {toast && (
        <div className="bg-primary-fixed/50 text-primary text-sm rounded-xl px-4 py-3 flex items-center gap-2 font-medium animate-in fade-in slide-in-from-bottom-1">
          <BadgeCheck className="w-4 h-4 shrink-0" />
          {toast}
        </div>
      )}
    </section>
  );
}

function DataButton({
  icon: Icon,
  label,
  hint,
  onClick,
  loading,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  onClick: () => void;
  loading: boolean;
  color: 'primary' | 'tertiary' | 'error';
}) {
  const styles = {
    primary: 'bg-primary-fixed/40 hover:bg-primary-fixed/70 text-primary border-primary/10',
    tertiary: 'bg-tertiary-fixed/50 hover:bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/10',
    error: 'bg-error-container/40 hover:bg-error-container/60 text-error border-error/10',
  }[color];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'h-20 rounded-2xl p-3 border text-left transition-all active:scale-[0.97] disabled:opacity-50 flex flex-col justify-between',
        styles,
      )}
    >
      <div className="flex items-center justify-between">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      </div>
      <div>
        <div className="font-bold text-sm">{label}</div>
        <div className="text-[11px] opacity-80 mt-0.5">{hint}</div>
      </div>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-secondary font-medium">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={cn(
          'mt-1 w-full h-11 px-3 rounded-xl border transition outline-none font-mono text-sm',
          readOnly
            ? 'bg-surface-container-low border-surface-container text-outline cursor-not-allowed'
            : 'bg-surface-container-low border-surface-container-high focus:border-primary focus:bg-white',
        )}
      />
    </div>
  );
}
