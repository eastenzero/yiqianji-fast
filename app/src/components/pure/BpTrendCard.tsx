import { HeartPulse, Sparkles } from 'lucide-react';

/**
 * 血压趋势迷你卡（Pure Component）
 *
 * 从 `pages/Home.tsx` 的内嵌 BP 趋势区抽取而成 · 纯展示 · 无 Link / Store 依赖
 * 被原页面和视频场景 `video/scenes/04-ProductDemo.tsx` 共用
 */
interface BpTrendCardProps {
  /** 收缩压数组（最近 N 次） · 视频里可传当前"已显示到第 k 个"的子数组 */
  values: number[];
  /** 异常高阈值，默认 135 */
  highThreshold?: number;
  /** 异常低阈值，默认 110 */
  lowThreshold?: number;
  /** 是否显示 CTA（"生成就诊前摘要"）· 视频里可关 */
  showCta?: boolean;
  /** 额外 className */
  className?: string;
  /**
   * 强制移动端布局 · 用于 Remotion 视频（viewport=1920，md: 会被误触）
   * 详见 HomeView 的同名 prop 说明
   */
  forceMobile?: boolean;
}

export function BpTrendCard({
  values,
  highThreshold = 135,
  lowThreshold = 110,
  showCta = true,
  className = '',
  forceMobile = false,
}: BpTrendCardProps) {
  if (values.length === 0) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const hasHigh = values.some((v) => v >= highThreshold);
  const hasLow = values.some((v) => v < lowThreshold);
  const hasAnomaly = hasHigh || hasLow;
  const latest = values[values.length - 1];
  const latestAbnormal = latest >= highThreshold || latest < lowThreshold;

  return (
    <section
      className={`rounded-xl p-8 relative overflow-hidden border ${hasAnomaly
        ? 'bg-tertiary-fixed/30 border-tertiary/20'
        : 'bg-surface-container-low border-surface-container'
        } ${className}`}
    >
      <div
        className={
          forceMobile
            ? 'flex flex-col gap-6 relative z-10'
            : 'flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10'
        }
      >
        {/* 左侧文案 */}
        <div className="space-y-4 max-w-md">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${hasAnomaly
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : 'bg-primary-fixed text-primary'
              }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wider">
              {hasAnomaly ? 'BP ALERT' : 'BP TREND'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface font-headline">
            近 {values.length} 次收缩压
          </h3>
          <p className="text-secondary leading-relaxed text-sm">
            区间 {min} – {max} mmHg
            {hasAnomaly && (
              <>
                ，存在 <span className="text-tertiary font-bold">波动风险</span>
              </>
            )}
            。前往"摘要"页可让 AI 详细分析。
          </p>
          {showCta && (
            <div className="inline-flex items-center gap-1 text-primary text-sm font-bold">
              <Sparkles className="w-4 h-4" />
              生成就诊前摘要
            </div>
          )}
        </div>

        {/* 右侧迷你柱 */}
        <div
          className={
            forceMobile
              ? 'w-full bg-white/80 backdrop-blur p-4 rounded-xl shadow-sm border border-white flex flex-col justify-end h-44'
              : 'w-full md:w-72 bg-white/80 backdrop-blur p-4 rounded-xl shadow-sm border border-white flex flex-col justify-end h-44'
          }
        >
          <div className="flex justify-between items-end gap-2 h-full pb-2 border-b border-surface-container">
            {values.map((v, idx) => {
              const range = Math.max(20, max - min + 10);
              const pct = ((v - (min - 5)) / range) * 100;
              const abnormal = v >= highThreshold || v < lowThreshold;
              const isLatest = idx === values.length - 1;
              return (
                <div
                  key={idx}
                  className={`w-full rounded-t-lg transition-all ${abnormal
                    ? 'bg-tertiary/50 border-t-[3px] border-tertiary'
                    : 'bg-primary/30'
                    } ${isLatest && abnormal ? 'shadow-[0_-8px_16px_rgba(132,80,11,0.2)]' : ''}`}
                  style={{ height: `${Math.max(12, Math.min(95, pct))}%` }}
                  title={`${v} mmHg`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 px-1 text-[10px] font-bold text-secondary">
            <span>起点</span>
            <span
              className={`font-extrabold ${latestAbnormal ? 'text-tertiary' : 'text-primary'
                }`}
            >
              最新 {latest}
            </span>
          </div>
        </div>
      </div>
      <div
        className={`absolute right-0 bottom-0 w-1/2 h-full blur-3xl pointer-events-none ${hasAnomaly ? 'bg-tertiary/10' : 'bg-primary/5'
          }`}
      />
    </section>
  );
}
