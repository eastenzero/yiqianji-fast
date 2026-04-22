import { interpolate, useCurrentFrame } from 'remotion';

/**
 * 全局统一的字幕层组件。
 * 底部居中的大字幕，自动处理淡入淡出。
 *
 * 用法：放在 scene 根元素内，给定字幕文本和显示时间段（帧）。
 *
 * @example
 * <Subtitle text="医前记，改变这一切" from={10} to={80} />
 */
interface SubtitleProps {
  text: string;
  /** 开始显示的帧（相对 scene） */
  from: number;
  /** 结束显示的帧（相对 scene） */
  to: number;
  /** 淡入淡出时长（帧），默认 12 帧 */
  fadeFrames?: number;
  /** 位置，默认 bottom */
  position?: 'bottom' | 'center' | 'top';
  /** 字号，默认 56 */
  fontSize?: number;
  /** 字重，默认 600 */
  fontWeight?: 400 | 500 | 600 | 700;
  /** 字色，默认品牌 ink */
  color?: string;
}

export const Subtitle: React.FC<SubtitleProps> = ({
  text,
  from,
  to,
  fadeFrames = 12,
  position = 'bottom',
  fontSize = 56,
  fontWeight = 600,
  color = '#0B3446',
}) => {
  const frame = useCurrentFrame();

  // 防御式守护：空文本 / 时长不足两倍淡入淡出的场景直接不渲染，
  // 避免 interpolate inputRange 非单调递增的运行时错误。
  if (!text || to <= from + fadeFrames * 2) return null;
  if (frame < from || frame > to) return null;

  // 淡入 + 保持 + 淡出 三段曲线
  const opacity = interpolate(
    frame,
    [from, from + fadeFrames, to - fadeFrames, to],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // 轻微上移入场，下移出场
  const translateY = interpolate(
    frame,
    [from, from + fadeFrames, to - fadeFrames, to],
    [20, 0, 0, -10],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const positionStyle: React.CSSProperties =
    position === 'bottom'
      ? { bottom: 96, left: 0, right: 0 }
      : position === 'top'
        ? { top: 96, left: 0, right: 0 }
        : { top: '50%', left: 0, right: 0, transform: 'translateY(-50%)' };

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyle,
        textAlign: 'center',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          fontSize,
          fontWeight,
          color,
          letterSpacing: '0.02em',
          transform: `translateY(${translateY}px)`,
          textShadow: '0 2px 20px rgba(255,255,255,0.6)',
        }}
      >
        {text}
      </div>
    </div>
  );
};
