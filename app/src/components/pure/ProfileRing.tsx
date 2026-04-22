/**
 * 问诊准备度环形得分卡（Pure Component）
 *
 * 从 `pages/Profile.tsx` 的 `PreparednessCard` 抽取而成 · 纯展示 · 无副作用
 * 被原页面和视频场景 `video/scenes/04-ProductDemo.tsx` 共用
 */
interface ProfileRingProps {
  /** 分数 0-100 · 视频里可传动画值 */
  score: number;
  /** 右侧副标题（如"优秀准备"） */
  level: string;
  /** 右侧描述文本 */
  hint: string;
  /** 圆环尺寸（px）· 默认 112 · 视频可传更大 */
  size?: number;
  /** 是否包含整张卡片外壳（背景 + padding）· 默认 true · 视频可 false 单独用圆环 */
  withCard?: boolean;
  /** 额外 className 叠加 */
  className?: string;
}

export function ProfileRing({
  score,
  level,
  hint,
  size = 112,
  withCard = true,
  className = '',
}: ProfileRingProps) {
  const radius = size * 0.446; // 按原 112/50 比例
  const stroke = size * 0.071; // 112/8
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);

  const ring = (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-surface-container-high"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          className="text-primary-container transition-all duration-1000 ease-out"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
      </svg>
      <span
        className="absolute font-extrabold font-headline text-primary-container"
        style={{ fontSize: size * 0.32 }}
      >
        {Math.round(score)}
      </span>
    </div>
  );

  if (!withCard) {
    return <div className={className}>{ring}</div>;
  }

  return (
    <div
      className={`bg-surface-container-lowest rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,102,136,0.04)] border border-surface-container ${className}`}
    >
      <h3 className="text-lg font-bold font-headline mb-4 text-on-surface">
        问诊准备度得分
      </h3>
      <div className="flex items-end gap-5">
        {ring}
        <div className="pb-2 flex-1 min-w-0">
          <p className="text-sm font-bold text-primary mb-1">{level}</p>
          <p className="text-xs text-secondary leading-relaxed font-medium">{hint}</p>
        </div>
      </div>
    </div>
  );
}
