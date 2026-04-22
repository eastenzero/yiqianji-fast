/**
 * 快捷入口卡（Pure Component）
 *
 * 从 `pages/Home.tsx` 的内嵌 QuickCard 抽取而成 · 纯展示 · 无 Link 依赖
 * 被原页面（包 Link）和视频场景共用（展示态）
 */
interface QuickCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  color: 'cyan' | 'amber' | 'emerald' | 'purple';
  /** 额外 className · 视频里可用于缩放 */
  className?: string;
}

const COLOR_STYLES = {
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'hover:border-cyan-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'hover:border-amber-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'hover:border-emerald-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'hover:border-purple-100' },
} as const;

export function QuickCard({
  icon: Icon,
  label,
  hint,
  color,
  className = '',
}: QuickCardProps) {
  const styles = COLOR_STYLES[color];
  return (
    <div
      className={`group p-6 bg-white rounded-xl text-left transition-all shadow-[0_4px_20px_-2px_rgba(25,28,29,0.04)] border border-transparent ${styles.border} ${className}`}
    >
      <div
        className={`w-12 h-12 rounded-xl ${styles.bg} flex items-center justify-center mb-4 transition-colors`}
      >
        <Icon className={styles.text} />
      </div>
      <span className="block text-lg font-bold text-on-surface font-headline">
        {label}
      </span>
      <span className="text-xs text-secondary mt-1 block">{hint}</span>
    </div>
  );
}
