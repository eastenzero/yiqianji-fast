import { useCurrentFrame } from 'remotion';
import { COLORS } from '../constants';

/**
 * Highlight · 通用脉冲/光晕强调层
 *
 * 给一个元素（数字、卡片、QR 码、徽章等）加上脉冲光晕，把观众的视线
 * 拉到画面的这个点上。是动效分层的 Layer 3（强调高亮层）核心组件。
 *
 * 两种用法：
 *   1. 脉冲模式（默认）：波峰出现 pulseCount 次后淡出
 *   2. 静态模式（staticGlow=true）：持续发光
 *
 * 使用示例：
 *   // P02 "3-5 分钟"红色脉冲 3 次
 *   <Highlight color="#BA1A1A" pulseCount={3} startFrame={60}>
 *     <span style={{ padding: '10px 20px', borderRadius: 14 }}>3-5 分钟</span>
 *   </Highlight>
 *
 *   // P06 QR 码持续微光
 *   <Highlight staticGlow maxGlowSize={40}>
 *     <img src={qr} />
 *   </Highlight>
 *
 * 注意：Highlight 用 box-shadow 实现，child 需要有可见的 border（即普通元素都行，
 * 但不要传 Fragment 或纯文本 · 请包一层 span/div）。
 */

interface HighlightProps {
  children: React.ReactNode;
  /** 光晕颜色 · 默认品牌 primary */
  color?: string;
  /** 触发起始帧（scene 局部帧） · 默认 0 */
  startFrame?: number;
  /** 单次脉冲周期（帧） · 默认 30（@30fps = 1 秒一次） */
  pulsePeriod?: number;
  /** 脉冲次数 · 默认 3 */
  pulseCount?: number;
  /** 脉冲结束后是否保留微弱光晕 · 默认 false（完全淡出） */
  retainAfter?: boolean;
  /** 脉冲最大扩散半径 · 默认 40（box-shadow blur） */
  maxGlowSize?: number;
  /** 脉冲最大 spread · 默认 6（box-shadow spread） */
  maxSpread?: number;
  /** 静态模式 · 不脉冲，持续发光 */
  staticGlow?: boolean;
  /**
   * 强调模式
   *   - 'pulse'（默认）· box-shadow blur+spread 脉冲（老效果 · 易抖）
   *   - 'colorShift' · 覆盖层颜色淡入淡出 · 不改变 shadow · **不抖**
   *   - 'breathing'  · 覆盖层"呼吸"持续循环 · 柔和不尖锐 · **更温和**
   */
  mode?: 'pulse' | 'colorShift' | 'breathing';
  /** colorShift 模式下覆盖层最大不透明度 · 默认 0.22 */
  colorShiftMaxAlpha?: number;
  /** breathing 模式下单次呼吸周期（帧） · 默认 90（@30fps = 3s 一次呼吸） */
  breathingPeriod?: number;
  /** breathing 模式下覆盖层最大不透明度 · 默认 0.14（比 colorShift 更淡） */
  breathingMaxAlpha?: number;
  /** 包装器 display · 默认 inline-block */
  display?: 'inline-block' | 'block' | 'inline-flex' | 'flex';
  /** 包装器 borderRadius · 默认 'inherit'（跟随 child） */
  borderRadius?: React.CSSProperties['borderRadius'];
  /** 额外 style · 叠加到包装器 */
  style?: React.CSSProperties;
}

/** alpha 0-1 → 2 位 hex（#RRGGBBAA） */
const alphaHex = (a: number): string =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0');

export const Highlight: React.FC<HighlightProps> = ({
  children,
  color = COLORS.primary,
  startFrame = 0,
  pulsePeriod = 30,
  pulseCount = 3,
  retainAfter = false,
  maxGlowSize = 40,
  maxSpread = 6,
  staticGlow = false,
  mode = 'pulse',
  colorShiftMaxAlpha = 0.22,
  breathingPeriod = 90,
  breathingMaxAlpha = 0.14,
  display = 'inline-block',
  borderRadius = 'inherit',
  style,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  // 计算强度 [0, 1]（pulse 模式下 = 光晕强度；colorShift 模式下 = 覆盖层不透明度）
  let intensity: number;

  if (staticGlow) {
    intensity = 0.5;
  } else if (localFrame < 0) {
    intensity = 0;
  } else {
    const totalPulseDur = pulsePeriod * pulseCount;

    if (localFrame < totalPulseDur) {
      // 脉冲进行中：正弦波 0 → 1 → 0 每周期
      const phase = (localFrame % pulsePeriod) / pulsePeriod;
      intensity = Math.sin(phase * Math.PI); // 0..1..0
    } else if (retainAfter) {
      intensity = 0.25; // 残留微光
    } else {
      intensity = 0;
    }
  }

  // === colorShift 模式 · 仅叠一个半透明色块 · 无 box-shadow · 不抖 ===
  if (mode === 'colorShift') {
    const overlayAlpha = colorShiftMaxAlpha * intensity;
    return (
      <div
        style={{
          display,
          position: 'relative',
          borderRadius,
          ...style,
        }}
      >
        {children}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius,
            background: `${color}${alphaHex(overlayAlpha)}`,
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }

  // === breathing 模式 · 持续循环的柔和呼吸 · 比 colorShift 更温和 ===
  //   intensity 用 (1 - cos) / 2 曲线 · 0 → 1 → 0 一个完整周期 · 两端导数为 0（比 sin 更平）
  //   不受 startFrame/pulseCount 约束 · 从 scene 局部 frame=0 开始一直循环
  if (mode === 'breathing') {
    const breathPhase = (frame / breathingPeriod) * 2 * Math.PI;
    const breath = 0.5 * (1 - Math.cos(breathPhase)); // 0..1..0 per cycle, smooth at both ends
    const overlayAlpha = breathingMaxAlpha * breath;
    return (
      <div
        style={{
          display,
          position: 'relative',
          borderRadius,
          ...style,
        }}
      >
        {children}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius,
            background: `${color}${alphaHex(overlayAlpha)}`,
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }

  // === pulse 模式（默认） · box-shadow 双层阴影 ===
  const glowBlur = maxGlowSize * intensity;
  const glowSpread = maxSpread * intensity;
  const glowAlpha = 0.7 * intensity;
  const outerGlowAlpha = 0.35 * intensity;

  const shadow =
    intensity > 0
      ? `0 0 ${glowBlur}px ${glowSpread}px ${color}${alphaHex(glowAlpha)}, ` +
      `0 0 ${glowBlur * 2}px ${glowSpread * 1.5}px ${color}${alphaHex(outerGlowAlpha)}`
      : 'none';

  return (
    <div
      style={{
        display,
        position: 'relative',
        borderRadius,
        boxShadow: shadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
