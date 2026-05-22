/**
 * 运行时配置。
 * 优先级：localStorage（用户设置页填的） > 环境变量（.env.local） > 默认值
 * 这样打包好的 PWA 也可以让用户在设置页填自己的 Key。
 */

const LS_KEY = 'yiqianji.config.v1';
const TRIAL_LS_KEY = 'yiqianji.trial.v1';
const TRIAL_TOTAL = 5;

/** Provider 标识 */
export type ProviderKey =
  | 'qwen'
  | 'openai'
  | 'deepseek'
  | 'moonshot'
  | 'ollama'
  | 'custom';

/** Provider 元数据（UI 展示 + 预设参数） */
export interface ProviderMeta {
  key: ProviderKey;
  name: string;
  tagline: string;
  baseUrl: string;
  defaultTextModel: string;
  textModelOptions: string[];
  keyPrefix?: string;
  docsUrl?: string;
  logoColor: string;
  logoLetter: string;
  /** 是否支持多模态 OCR（目前仅展示提示） */
  visionCapable: boolean;
  /** 是否需要 API Key（本地模型不用） */
  needsApiKey: boolean;
  /** 演示用 badge */
  demoBadge?: '官方推荐' | '本地隐私' | '高性价比';
}

export const PROVIDERS: Record<ProviderKey, ProviderMeta> = {
  qwen: {
    key: 'qwen',
    name: '阿里通义千问',
    tagline: '医疗领域表现优秀 · 原生多模态报告识别',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultTextModel: 'qwen-plus',
    textModelOptions: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
    keyPrefix: 'sk-',
    docsUrl: 'https://bailian.console.aliyun.com/?apiKey=1#/api-key',
    logoColor: 'from-[#615ced] to-[#3a6df0]',
    logoLetter: '通',
    visionCapable: true,
    needsApiKey: true,
    demoBadge: '官方推荐',
  },
  openai: {
    key: 'openai',
    name: 'OpenAI',
    tagline: 'GPT-4 / 4o · 通用能力标杆',
    baseUrl: 'https://api.openai.com/v1',
    defaultTextModel: 'gpt-4o-mini',
    textModelOptions: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.openai.com/api-keys',
    logoColor: 'from-[#10a37f] to-[#0d8265]',
    logoLetter: 'AI',
    visionCapable: true,
    needsApiKey: true,
  },
  deepseek: {
    key: 'deepseek',
    name: 'DeepSeek',
    tagline: '国产开源代表 · 长上下文 · 超高性价比',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultTextModel: 'deepseek-v4-flash',
    textModelOptions: ['deepseek-v4-flash', 'deepseek-chat', 'deepseek-reasoner'],
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    logoColor: 'from-[#4d6bfe] to-[#3054e3]',
    logoLetter: 'DS',
    visionCapable: false,
    needsApiKey: true,
    demoBadge: '高性价比',
  },
  moonshot: {
    key: 'moonshot',
    name: '月之暗面 Kimi',
    tagline: '超长上下文窗口 · 中文场景细腻',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultTextModel: 'moonshot-v1-32k',
    textModelOptions: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.moonshot.cn/console/api-keys',
    logoColor: 'from-[#1a1a2e] to-[#4338ca]',
    logoLetter: 'K',
    visionCapable: false,
    needsApiKey: true,
  },
  ollama: {
    key: 'ollama',
    name: '本地模型 · Ollama',
    tagline: '完全离线 · 数据不出本机',
    baseUrl: 'http://localhost:11434/v1',
    defaultTextModel: 'qwen2.5:7b',
    textModelOptions: ['qwen2.5:7b', 'llama3.1:8b', 'deepseek-r1:7b', 'gemma2:9b'],
    docsUrl: 'https://ollama.com/download',
    logoColor: 'from-[#0f172a] to-[#334155]',
    logoLetter: 'OL',
    visionCapable: false,
    needsApiKey: false,
    demoBadge: '本地隐私',
  },
  custom: {
    key: 'custom',
    name: '自定义 OpenAI 兼容',
    tagline: '接入私有化网关 / 企业端自建推理',
    baseUrl: '',
    defaultTextModel: '',
    textModelOptions: [],
    logoColor: 'from-[#475569] to-[#1e293b]',
    logoLetter: '⚙',
    visionCapable: false,
    needsApiKey: true,
  },
};

export interface RuntimeConfig {
  /** 当前选中的 Provider */
  provider: ProviderKey;
  /** 主 Provider 的 API Key */
  qwenApiKey: string; // 为了历史兼容，名字保留 qwenApiKey，但语义是 "主 Provider Key"
  /** 主 Provider 的 Base URL（可被 Provider 预设覆盖） */
  qwenBaseUrl: string;
  /** 主 Provider 的文本模型 */
  qwenTextModel: string;
  /** OCR 专用 Provider（当前固定通义 VL） */
  qwenVlModel: string;
  /** OCR 是否单独使用通义 Key（true）或与主 Key 相同（false） */
  ocrUseSeparateKey: boolean;
  /** OCR 独立 Key（仅当 ocrUseSeparateKey = true 时使用） */
  ocrQwenApiKey: string;
}

const DEFAULTS: RuntimeConfig = {
  provider: 'qwen',
  qwenApiKey: '',
  qwenBaseUrl: PROVIDERS.qwen.baseUrl,
  qwenTextModel: PROVIDERS.qwen.defaultTextModel,
  qwenVlModel: 'qwen-vl-plus',
  ocrUseSeparateKey: false,
  ocrQwenApiKey: '',
};

function readLocalStorage(): Partial<RuntimeConfig> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Partial<RuntimeConfig>) : {};
  } catch {
    return {};
  }
}

function readEnv(): Partial<RuntimeConfig> {
  // Vite 注入的 env 变量
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};
  return {
    provider: env.VITE_AI_PROVIDER as ProviderKey | undefined,
    qwenApiKey: env.VITE_QWEN_API_KEY,
    qwenBaseUrl: env.VITE_QWEN_BASE_URL,
    qwenTextModel: env.VITE_QWEN_TEXT_MODEL,
    qwenVlModel: env.VITE_QWEN_VL_MODEL,
  };
}

function readEnvValue(key: string): string {
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};
  return env[key] || '';
}

export function getRuntimeConfig(): RuntimeConfig {
  const env = readEnv();
  const ls = readLocalStorage();
  const provider = (ls.provider as ProviderKey) || (env.provider as ProviderKey) || DEFAULTS.provider;
  const providerMeta = PROVIDERS[provider];

  return {
    provider,
    qwenApiKey: ls.qwenApiKey || env.qwenApiKey || DEFAULTS.qwenApiKey,
    qwenBaseUrl: ls.qwenBaseUrl || env.qwenBaseUrl || providerMeta.baseUrl || DEFAULTS.qwenBaseUrl,
    qwenTextModel:
      ls.qwenTextModel || env.qwenTextModel || providerMeta.defaultTextModel || DEFAULTS.qwenTextModel,
    qwenVlModel: ls.qwenVlModel || env.qwenVlModel || DEFAULTS.qwenVlModel,
    ocrUseSeparateKey: ls.ocrUseSeparateKey ?? DEFAULTS.ocrUseSeparateKey,
    ocrQwenApiKey: ls.ocrQwenApiKey || DEFAULTS.ocrQwenApiKey,
  };
}

export function setRuntimeConfig(patch: Partial<RuntimeConfig>): void {
  const current = readLocalStorage();
  const merged = { ...current, ...patch };
  localStorage.setItem(LS_KEY, JSON.stringify(merged));
}

/** 切换 Provider：自动带入该 Provider 的预设 baseUrl / model */
export function setProvider(key: ProviderKey): void {
  const meta = PROVIDERS[key];
  setRuntimeConfig({
    provider: key,
    qwenBaseUrl: meta.baseUrl,
    qwenTextModel: meta.defaultTextModel,
  });
}

export function getProviderMeta(key?: ProviderKey): ProviderMeta {
  const k = key ?? getRuntimeConfig().provider;
  return PROVIDERS[k];
}

export function hasValidAPIKey(): boolean {
  const cfg = getRuntimeConfig();
  const meta = PROVIDERS[cfg.provider];
  if (!meta.needsApiKey) return true; // 本地 Ollama 不需要 Key
  if (!cfg.qwenApiKey) return false;
  if (meta.keyPrefix && !cfg.qwenApiKey.startsWith(meta.keyPrefix)) return false;
  return true;
}

export function hasValidUserAPIKey(): boolean {
  const ls = readLocalStorage();
  const provider = (ls.provider as ProviderKey) || DEFAULTS.provider;
  const meta = PROVIDERS[provider];
  if (!meta.needsApiKey) return true;
  if (!ls.qwenApiKey) return false;
  if (meta.keyPrefix && !ls.qwenApiKey.startsWith(meta.keyPrefix)) return false;
  return true;
}

export function getPlatformTrialTotal(): number {
  return TRIAL_TOTAL;
}

export function getPlatformTrialUsed(): number {
  if (typeof localStorage === 'undefined') return 0;
  const raw = Number(localStorage.getItem(TRIAL_LS_KEY) || '0');
  return Number.isFinite(raw) ? Math.max(0, Math.min(TRIAL_TOTAL, raw)) : 0;
}

export function getPlatformTrialRemaining(): number {
  return Math.max(0, TRIAL_TOTAL - getPlatformTrialUsed());
}

export function hasPlatformTrialKey(): boolean {
  const key = readEnvValue('VITE_TRIAL_QWEN_API_KEY') || readEnvValue('VITE_QWEN_API_KEY');
  return !!key && key.startsWith('sk-');
}

export function canUsePlatformTrial(): boolean {
  return !hasValidUserAPIKey() && hasPlatformTrialKey() && getPlatformTrialRemaining() > 0;
}

export function consumePlatformTrial(): number {
  const used = getPlatformTrialUsed();
  const next = Math.min(TRIAL_TOTAL, used + 1);
  localStorage.setItem(TRIAL_LS_KEY, String(next));
  return Math.max(0, TRIAL_TOTAL - next);
}

export function getPlatformTrialAIConfig(): Pick<RuntimeConfig, 'qwenApiKey' | 'qwenBaseUrl' | 'qwenTextModel'> {
  return {
    qwenApiKey: readEnvValue('VITE_TRIAL_QWEN_API_KEY') || readEnvValue('VITE_QWEN_API_KEY'),
    qwenBaseUrl: readEnvValue('VITE_TRIAL_QWEN_BASE_URL') || readEnvValue('VITE_QWEN_BASE_URL') || PROVIDERS.qwen.baseUrl,
    qwenTextModel:
      readEnvValue('VITE_TRIAL_QWEN_TEXT_MODEL') || readEnvValue('VITE_QWEN_TEXT_MODEL') || PROVIDERS.qwen.defaultTextModel,
  };
}

/** OCR 需要的通义 VL Key（可能独立，也可能复用主 Key） */
export function getOCRApiKey(): string {
  const cfg = getRuntimeConfig();
  return cfg.ocrUseSeparateKey ? cfg.ocrQwenApiKey : cfg.qwenApiKey;
}

export function hasValidOCRKey(): boolean {
  const key = getOCRApiKey();
  return !!key && key.startsWith('sk-');
}
