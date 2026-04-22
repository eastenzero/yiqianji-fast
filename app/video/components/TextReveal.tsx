import { interpolate, useCurrentFrame } from 'remotion';

/**
 * 逐字浮现文本组件 · 打字机风格（带淡入 + 微 Y 位移）
 *
 * 两种计时模式（二选一，给 charDelay 优先）：
 *   - `charDelay` 模式：每字间隔固定帧数（更可控）
 *   - `durationFrames` 模式：总时长，自动按字数均分
 *
 * @example
 * // 40 帧内显示一段 16 字的病史
 * <TextReveal text="头晕 3 天，伴头痛" startFrame={60} durationFrames={40} />
 */
interface TextRevealProps {
  text: string;
  /** 开始显现的帧（相对 scene） */
  startFrame: number;
  /** 总时长帧数 · 与 charDelay 二选一 */
  durationFrames?: number;
  /** 每字间隔帧数 · 优先于 durationFrames */
  charDelay?: number;
  /** 单字淡入的帧数 */
  letterRevealFrames?: number;
  /** 入场 Y 位移（字从下方浮入） */
  translateYPx?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  fontFamily?: string;
  /** 字符间距 */
  letterSpacing?: string;
  /** 行高 */
  lineHeight?: number;
  /** 附加样式 */
  style?: React.CSSProperties;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  startFrame,
  durationFrames = 40,
  charDelay,
  letterRevealFrames = 8,
  translateYPx = 6,
  fontSize = 28,
  fontWeight = 500,
  color = '#0B3446',
  fontFamily = '"Noto Sans SC", "Lexend", system-ui, sans-serif',
  letterSpacing = '0.01em',
  lineHeight = 1.5,
  style,
}) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text); // 按 code point 分（正确处理中文）

  // 自动计算每字间隔：总时长扣除最后一个字的淡入时间，均分
  const effectiveDelay =
    charDelay ??
    (chars.length <= 1
      ? 0
      : (durationFrames - letterRevealFrames) / (chars.length - 1));

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        color,
        fontFamily,
        letterSpacing,
        lineHeight,
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const charStart = startFrame + i * effectiveDelay;

        // 空白字符不做动画（避免 inline span 折叠空格）
        if (ch === ' ') {
          return <span key={i}>&nbsp;</span>;
        }

        const opacity = interpolate(
          frame,
          [charStart, charStart + letterRevealFrames],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );
        const ty = interpolate(
          frame,
          [charStart, charStart + letterRevealFrames],
          [translateYPx, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity,
              transform: `translateY(${ty}px)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};
