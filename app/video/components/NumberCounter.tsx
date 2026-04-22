import { interpolate, useCurrentFrame, Easing } from 'remotion';

/**
 * 数字滚动计数器 · ease-out 曲线（前快后慢，有冲击力）
 *
 * 场景：Problem 痛点数字轰炸 / Business 柱状图 KPI 头牌
 *
 * @example
 * <NumberCounter value={2.45} startFrame={10} durationFrames={40} decimals={2} suffix="亿" />
 */
interface NumberCounterProps {
  /** 目标值（动画结束时的值） */
  value: number;
  /** 起始值，默认 0 */
  from?: number;
  /** 开始滚动的帧（相对 scene） */
  startFrame: number;
  /** 滚动持续帧数 */
  durationFrames: number;
  /** 小数位，默认 0 */
  decimals?: number;
  /** 前缀，如 "¥" */
  prefix?: string;
  /** 后缀，如 "亿" "%" */
  suffix?: string;
  /** 是否启用千分位分隔，默认 true */
  useThousands?: boolean;
  /** 字号，默认 120 */
  fontSize?: number;
  /** 字重，默认 700 */
  fontWeight?: number;
  /** 字色，默认 primary */
  color?: string;
  /** 字体，默认 Lexend 数字优化 */
  fontFamily?: string;
  /** 附加 style */
  style?: React.CSSProperties;
}

export const NumberCounter: React.FC<NumberCounterProps> = ({
  value,
  from = 0,
  startFrame,
  durationFrames,
  decimals = 0,
  prefix = '',
  suffix = '',
  useThousands = true,
  fontSize = 120,
  fontWeight = 700,
  color = '#006485',
  fontFamily = 'Lexend, "Noto Sans SC", system-ui, sans-serif',
  style,
}) => {
  const frame = useCurrentFrame();

  // ease-out: 前快后慢，冲击力强
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );

  const current = from + (value - from) * progress;

  // 格式化
  let formatted = current.toFixed(decimals);
  if (useThousands && decimals === 0) {
    formatted = Number(formatted).toLocaleString('en-US');
  }

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        color,
        fontFamily,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        ...style,
      }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
