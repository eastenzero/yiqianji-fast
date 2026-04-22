import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../constants';

/**
 * TouchRipple · 手势点击水波涟漪
 *
 * 模拟用户手指在触摸屏上点击的涟漪效果。用于演示段（D1-D3）标记
 * "用户这一刻点击了这里" 的时刻，配合随后的界面变化引导观众视线。
 *
 * 动画逻辑（共 duration 帧）：
 *   1. 中心实心圆点 spring 弹入（0-4 帧）· 保持（4-12 帧）· 淡出（12-duration 帧）
 *   2. 外圈 ring 从 r=0 → r=maxRadius 线性扩散 + opacity 1→0
 *   3. 可选第二圈 ring 延后 4 帧触发（"双层波"更像真实 iOS tap）
 *
 * 使用示例：
 *   <PhoneFrame>
 *     <HomeScreen />
 *     <TouchRipple x={204} y={420} triggerFrame={40} />
 *   </PhoneFrame>
 *
 * 坐标系：x/y 是相对父元素（通常 PhoneFrame 屏幕区域）的 px 坐标。
 */

interface TouchRippleProps {
  /** X 坐标（px，相对父元素） */
  x: number;
  /** Y 坐标（px，相对父元素） */
  y: number;
  /** 触发帧（scene 局部帧） */
  triggerFrame: number;
  /** 涟漪最大半径（px） · 默认 90 */
  maxRadius?: number;
  /** 涟漪持续帧数 · 默认 28 */
  durationFrames?: number;
  /** 涟漪颜色 · 默认品牌 primary */
  color?: string;
  /** 中心点直径（px）· 默认 22 */
  dotSize?: number;
  /** 是否显示中心实心点 · 默认 true */
  showDot?: boolean;
  /** 是否双层 ring（更像真实 iOS tap）· 默认 true */
  doubleRing?: boolean;
  /** z-index · 默认 100（要高于被点击的 UI） */
  zIndex?: number;
}

export const TouchRipple: React.FC<TouchRippleProps> = ({
  x,
  y,
  triggerFrame,
  maxRadius = 90,
  durationFrames = 28,
  color = COLORS.primary,
  dotSize = 22,
  showDot = true,
  doubleRing = true,
  zIndex = 100,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - triggerFrame;

  // 触发前不渲染 · 触发后持续 durationFrames + 缓冲帧
  if (localFrame < 0 || localFrame > durationFrames + 6) return null;

  // 第一圈 ring · 0 → durationFrames
  const ring1T = Math.max(0, Math.min(1, localFrame / durationFrames));
  const ring1Radius = ring1T * maxRadius;
  const ring1Opacity = 0.55 * (1 - ring1T);

  // 第二圈 ring · 延后 4 帧
  const ring2Local = localFrame - 4;
  const ring2T = Math.max(0, Math.min(1, ring2Local / durationFrames));
  const ring2Radius = ring2T * maxRadius * 0.7;
  const ring2Opacity = doubleRing && ring2Local > 0 ? 0.35 * (1 - ring2T) : 0;

  // 中心点 · spring-like 弹入（用 interpolate 模拟，避免 spring from===to 报错）
  const dotOpacity = interpolate(
    localFrame,
    [0, 3, 10, durationFrames],
    [0, 1, 0.85, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const dotScale = interpolate(
    localFrame,
    [0, 4, 10],
    [0.4, 1.15, 1.0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 0,
        height: 0,
        zIndex,
        pointerEvents: 'none',
      }}
    >
      {/* Ring 1 · 主涟漪 */}
      <div
        style={{
          position: 'absolute',
          left: -ring1Radius,
          top: -ring1Radius,
          width: ring1Radius * 2,
          height: ring1Radius * 2,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          opacity: ring1Opacity,
        }}
      />

      {/* Ring 2 · 延后触发，强化点击感 */}
      {doubleRing && ring2Local > 0 && (
        <div
          style={{
            position: 'absolute',
            left: -ring2Radius,
            top: -ring2Radius,
            width: ring2Radius * 2,
            height: ring2Radius * 2,
            borderRadius: '50%',
            border: `1.5px solid ${color}`,
            opacity: ring2Opacity,
          }}
        />
      )}

      {/* 中心实心点 · 标记"这一刻点了这里" */}
      {showDot && (
        <div
          style={{
            position: 'absolute',
            left: -dotSize / 2,
            top: -dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: color,
            opacity: dotOpacity,
            transform: `scale(${dotScale})`,
            boxShadow: `0 0 12px ${color}66`,
          }}
        />
      )}
    </div>
  );
};
