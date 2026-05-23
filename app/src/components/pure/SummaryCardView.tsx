import { Clock, Share2 } from 'lucide-react';

/**
 * 就诊前摘要卡视图（Pure Component）
 *
 * 从 `pages/Summary.tsx` 和 `pages/DoctorView.tsx` 的 SummaryCard 合并抽取 ·
 * 无 Link / dexie / 日期格式化依赖。两种变体：
 *   - `variant="patient"` · 患者端 Summary 页的布局（带"生成于 / 分享给医生"header）
 *   - `variant="doctor"`  · 医生端 DoctorView 页的布局（带"Consultation Summary" eyebrow）
 *
 * 支持 `revealedSections` 控制分节渐显 · 视频场景用来"打字机式"逐节浮入。
 *
 * 用法示例：
 *   <SummaryCardView
 *     summary={{
 *       chiefComplaint: '近 7 天晨起血压偏高，伴头晕',
 *       focusPoints: ['晨峰血压', '用药 100% 达标但血压仍超标'],
 *       symptoms: '头晕 3 次，均在晨起 1 小时内',
 *       vitalsTrend: '平均 145/92 mmHg · 超阈值',
 *       medications: '缬沙坦 80mg qd · 依从性 100%',
 *       lifestyle: '晚饭 19:30 · 运动 3 次/周',
 *       reportHighlights: '',
 *     }}
 *     patientName="王先生"
 *     coverageLabel="覆盖 14 天 · 生成于今天 09:15"
 *     revealedSections={new Set(['chiefComplaint', 'focusPoints'])}
 *   />
 */

export interface SummaryLike {
  chiefComplaint?: string;
  focusPoints?: string[];
  symptoms?: string;
  vitalsTrend?: string;
  medications?: string;
  lifestyle?: string;
  reportHighlights?: string;
}

/** 每个 section 的 key · 用于 revealedSections 过滤 */
export type SummarySection =
  | 'chiefComplaint'
  | 'focusPoints'
  | 'symptoms'
  | 'vitalsTrend'
  | 'medications'
  | 'lifestyle'
  | 'reportHighlights';

export interface SummaryCardViewProps {
  summary: SummaryLike;
  patientName?: string;
  /** 变体 · patient (Summary 页) / doctor (DoctorView 页) */
  variant?: 'patient' | 'doctor';
  /** 例如"生成于今天 09:15 · 覆盖 4-08 – 4-22" */
  coverageLabel?: string;
  /** 摘要 ID 后 8 位（仅 doctor 模式显示） */
  idTail?: string;
  /**
   * 受控"已显示的 section"集合 · 视频里按帧逐步加入
   * 若不传则所有 section 都显示
   */
  revealedSections?: Set<SummarySection>;
  /**
   * 流式打字进度（0-1） · Remotion 视频场景驱动 · undefined/1 = 完整显示无光标
   *   - 只对 chiefComplaint 和 focusPoints 生效（核心信息 · 最吸引注意力）
   *   - 其它 section 用 revealedSections 简单浮入
   */
  typingProgress?: {
    chiefComplaint?: number;
    /** 数组索引对齐 summary.focusPoints */
    focusPoints?: number[];
  };
  /**
   * 强制移动端布局 · 详见 HomeView 的同名 prop 说明
   * Remotion 视频场景放在手机 PhoneFrame 里时必须传 true
   */
  forceMobile?: boolean;
}

/** 按进度截断文字 + 光标 · 0-1 */
function sliceByProgress(text: string, progress: number): {
  text: string;
  showCursor: boolean;
} {
  if (progress >= 1) return { text, showCursor: false };
  if (progress <= 0) return { text: '', showCursor: true };
  const charCount = Math.max(1, Math.floor(text.length * progress));
  return { text: text.slice(0, charCount), showCursor: true };
}

/** 光标组件 · CSS 闪烁 */
function TypingCursor() {
  return (
    <span
      className="inline-block align-middle"
      style={{
        width: 2,
        height: '1em',
        marginLeft: 2,
        background: 'currentColor',
        animation: 'yq-typing-blink 0.6s steps(1) infinite',
      }}
    />
  );
}

export function SummaryCardView({
  summary,
  patientName,
  variant = 'patient',
  coverageLabel,
  idTail,
  revealedSections,
  typingProgress,
  forceMobile = false,
}: SummaryCardViewProps) {
  const visible = (k: SummarySection) =>
    !revealedSections || revealedSections.has(k);

  // 核心主诉打字 · progress undefined = 完整显示 · <1 = 截取并显示光标
  const chiefTyping = sliceByProgress(
    summary.chiefComplaint ?? '',
    typingProgress?.chiefComplaint ?? 1,
  );

  // focus points 每项独立打字 · 缺失进度值默认 1 (完整显示)
  const focusTyping = (summary.focusPoints ?? []).map((p, i) =>
    sliceByProgress(p, typingProgress?.focusPoints?.[i] ?? 1),
  );

  const detailsGrid = forceMobile
    ? 'grid grid-cols-1 gap-4'
    : 'grid grid-cols-1 md:grid-cols-2 gap-4';
  const articleCls = forceMobile
    ? 'bg-white rounded-xl p-6 shadow-sm border border-surface-container space-y-6'
    : 'bg-white rounded-xl p-6 md:p-8 shadow-sm border border-surface-container space-y-6';

  return (
    <article className={articleCls}>
      {/* === Header · 两种变体 === */}
      {variant === 'patient' ? (
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-dashed border-surface-container-high">
          <div className="flex items-center gap-2 text-xs text-secondary">
            <Clock className="w-3.5 h-3.5" />
            {coverageLabel ?? '覆盖近 14 天'}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary px-3 py-1.5 rounded-lg">
            <Share2 className="w-4 h-4" />
            分享给医生
          </div>
        </div>
      ) : (
        <header className="pb-4 border-b border-dashed border-surface-container-high">
          <div className="text-xs font-bold text-primary-container uppercase tracking-widest mb-1">
            Consultation Summary
          </div>
          <h1 className="text-2xl font-bold text-on-surface">
            {patientName || '患者'} 就诊前摘要
          </h1>
          {(coverageLabel || idTail) && (
            <div className="text-xs text-outline mt-2">
              {coverageLabel}
              {coverageLabel && idTail ? ' · ' : ''}
              {idTail ? `ID: ${idTail}` : ''}
            </div>
          )}
        </header>
      )}

      {/* === 核心主诉 · accent 样式 · 支持流式打字 === */}
      {summary.chiefComplaint && visible('chiefComplaint') && (
        <Section title="核心主诉" accent>
          {chiefTyping.text}
          {chiefTyping.showCursor && <TypingCursor />}
        </Section>
      )}

      {/* === 重点关注 · 编号列表 · 每项支持独立流式打字 === */}
      {summary.focusPoints &&
        summary.focusPoints.length > 0 &&
        visible('focusPoints') && (
          <div>
            <h3 className="text-xs font-bold text-primary-container mb-2 uppercase tracking-widest">
              供医生核对的信息
            </h3>
            {variant === 'doctor' ? (
              <ol className="space-y-2 list-decimal list-inside">
                {focusTyping.map((t, i) => (
                  <li key={i} className="text-sm text-on-surface">
                    {t.text}
                    {t.showCursor && <TypingCursor />}
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="space-y-2">
                {focusTyping.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-on-surface bg-primary-fixed/30 rounded-lg px-3 py-2"
                  >
                    <span className="text-primary font-bold shrink-0">
                      {i + 1}.
                    </span>
                    <span className="flex-1">
                      {t.text}
                      {t.showCursor && <TypingCursor />}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      {/* === 详情四栏（forceMobile 时单列） === */}
      <div className={detailsGrid}>
        {summary.symptoms && visible('symptoms') && (
          <Section title="症状详情">{summary.symptoms}</Section>
        )}
        {summary.vitalsTrend && visible('vitalsTrend') && (
          <Section title="体征趋势">{summary.vitalsTrend}</Section>
        )}
        {summary.medications && visible('medications') && (
          <Section title="用药情况">{summary.medications}</Section>
        )}
        {summary.lifestyle && visible('lifestyle') && (
          <Section title="生活习惯">{summary.lifestyle}</Section>
        )}
        {summary.reportHighlights && visible('reportHighlights') && (
          <div className={forceMobile ? '' : 'md:col-span-2'}>
            <Section title="报告异常点">{summary.reportHighlights}</Section>
          </div>
        )}
      </div>

      {/* 免责 */}
      {variant === 'patient' ? (
        <div className="text-center text-xs text-outline pt-4 border-t border-surface-container">
          本摘要仅作信息整理，不可替代医生诊断
        </div>
      ) : null}
    </article>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-bold text-primary-container mb-2 uppercase tracking-widest">
        {title}
      </h3>
      <p
        className={
          accent
            ? 'text-lg font-medium text-on-surface leading-relaxed bg-primary-fixed/30 rounded-lg p-4'
            : 'text-sm text-on-surface leading-relaxed'
        }
      >
        {children}
      </p>
    </section>
  );
}
