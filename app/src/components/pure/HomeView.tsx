import {
  Calendar,
  Brain,
  Activity,
  Stethoscope,
  Utensils,
  Pill,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { QuickCard } from './QuickCard';
import { BpTrendCard } from './BpTrendCard';

/**
 * 首页视觉（Pure Component）
 *
 * 从 `pages/Home.tsx` 的展示层抽取 · 无 Link / store / dexie 依赖
 * 被原页面（包 Link）和视频场景（D1/D2 的手机 Home 屏）共用。
 *
 * 设计原则：
 *   - 所有交互用 div 或 a 代替 Link，样式保持原样
 *   - 所有状态由 props 传入，组件完全无状态
 *   - 保留 app 真实的 Tailwind classes，保证视觉和产品一致
 */

export interface HomeViewProps {
  /** 用户称呼，如"王先生" */
  name: string;
  /** 慢病标签，如 ["高血压二期", "糖尿病"] */
  conditions: string[];
  /** 连续记录天数 */
  continuousDays: number;
  /** 记录完整度百分比（0-99 · 来自 continuousDays × 7 的近似） */
  recordCompletenessPct?: number;
  /** 最近 7 次收缩压（传空数组则不渲染 BP 卡） */
  bpTrend: number[];
  /** 最近摘要的核心主诉（没有则显示默认"立即生成"文案） */
  summaryTeaser?: string | null;
  /** 是否已填入 API Key（false 则显示警告 banner） */
  hasApiKey?: boolean;
  /** 视频场景下可临时隐藏 footer 小字 */
  hideFooter?: boolean;
  /**
   * 强制移动端布局 · true 时所有 md:/lg: 桌面样式都不启用
   *
   * ⚠️ Remotion 视频场景必须传 true ⚠️
   * 因为 Remotion 渲染在 1920×1080 视口下，CSS 媒体查询 `md:` (768px+) / `lg:` (1024px+)
   * 会错误地按"桌面"匹配，导致 408×818 手机画布里出现双列布局。
   * 原 app 在浏览器里 PhoneFrame 不存在，可保持默认 (false) 走自适应。
   */
  forceMobile?: boolean;
}

export function HomeView({
  name,
  conditions,
  continuousDays,
  recordCompletenessPct,
  bpTrend,
  summaryTeaser,
  hasApiKey = true,
  hideFooter = false,
  forceMobile = false,
}: HomeViewProps) {
  const completeness =
    recordCompletenessPct ?? Math.min(99, Math.max(1, continuousDays * 7));

  // forceMobile 时剥离所有 md:/lg: 类，只保留移动端基础布局
  const cls = {
    greetingSection: forceMobile
      ? 'flex flex-col gap-4'
      : 'flex flex-col md:flex-row md:items-end justify-between gap-4',
    summarySection: forceMobile
      ? 'flex flex-col gap-6'
      : 'grid grid-cols-1 md:grid-cols-12 gap-6',
    summaryHero: forceMobile
      ? 'w-full relative overflow-hidden bg-gradient-to-br from-primary-container to-primary text-white rounded-xl p-6 shadow-xl'
      : 'md:col-span-8 relative overflow-hidden bg-gradient-to-br from-primary-container to-primary text-white rounded-xl p-8 shadow-xl cursor-pointer',
    summaryTeaser: forceMobile
      ? 'text-lg font-medium leading-relaxed font-body'
      : 'text-lg md:text-xl font-medium leading-relaxed max-w-2xl font-body',
    ringCard: forceMobile
      ? 'w-full bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-3 shadow-sm border border-surface-container-high/50'
      : 'md:col-span-4 bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-3 shadow-sm border border-surface-container-high/50',
    quickGrid: forceMobile
      ? 'grid grid-cols-2 gap-4'
      : 'grid grid-cols-2 lg:grid-cols-4 gap-4',
  };

  return (
    <div className="space-y-8">
      {/* API Key 未配置警告 · 和 Home.tsx 一致 */}
      {!hasApiKey && (
        <div className="flex items-center gap-3 rounded-xl bg-tertiary-fixed/80 text-on-tertiary-fixed px-5 py-4 border border-tertiary/20">
          <KeyRound className="w-5 h-5 text-tertiary" />
          <div className="flex-1">
            <div className="font-bold text-sm">先去设置里填一下 API Key</div>
            <div className="text-xs opacity-80">
              AI 摘要和报告 OCR 需要，点我前往设置页。
            </div>
          </div>
        </div>
      )}

      {/* 问候 + 连续记录 */}
      <section className={cls.greetingSection}>
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
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">
              已连续记录
            </p>
            <p className="text-2xl font-bold text-primary">
              {continuousDays}{' '}
              <span className="text-sm font-medium text-secondary">天</span>
            </p>
          </div>
        </div>
      </section>

      {/* AI 摘要卡片 + 记录完整度 */}
      <section className={cls.summarySection}>
        <div className={cls.summaryHero}>
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="text-primary-fixed-dim w-5 h-5" />
              <h3 className="text-sm font-bold tracking-widest uppercase opacity-90">
                Recent 14-day highlight
              </h3>
            </div>
            <p className={cls.summaryTeaser}>
              {summaryTeaser ||
                '点此生成最近 14 天的就诊前摘要，交给 AI 帮你整理重点。'}
            </p>
            <div className="flex items-center gap-2 text-primary-fixed-dim text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              {summaryTeaser ? '查看完整摘要' : '立即生成'}
            </div>
          </div>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-primary-fixed-dim/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        <div className={cls.ringCard}>
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-primary font-headline">
              {completeness}%
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
        <div className={cls.quickGrid}>
          <QuickCard icon={Activity} label="测体征" hint="血压、血糖等" color="cyan" />
          <QuickCard icon={Stethoscope} label="记症状" hint="身体不适感" color="amber" />
          <QuickCard icon={Utensils} label="生活习惯" hint="饮食与运动" color="emerald" />
          <QuickCard icon={Pill} label="记用药" hint="定时提醒打卡" color="purple" />
        </div>
      </section>

      {/* 血压趋势 / 预警 */}
      {bpTrend.length >= 2 && (
        <BpTrendCard values={bpTrend} forceMobile={forceMobile} />
      )}

      {!hideFooter && (
        <footer className="py-12 text-center text-sm text-outline font-medium tracking-wide">
          本工具仅做信息整理，不作诊断建议
        </footer>
      )}
    </div>
  );
}
