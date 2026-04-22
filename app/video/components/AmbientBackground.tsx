import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../constants';

/**
 * AmbientBackground · V2 环境背景层（动效分层 Layer 1）
 *
 * 设计目标：让画面"永远呼吸"，即使静态 PPT 也有生气，但强度极低不抢戏。
 *
 * 三层结构（从底到顶）：
 *   1. 纯色底（variant 决定颜色）
 *   2. 两个漂移的 CSS radial-gradient（品牌色右上 + 暖色左下）
 *   3. 14 个 SVG 粒子光斑（blur 20px · 各自正弦漂浮）
 *   4. 可选底部 ECG 心跳线（strokeDashoffset 10s 扫过）
 *
 * 使用示例：
 *   <AmbientBackground />                                // 默认 · surface · low
 *   <AmbientBackground variant="ink" accent="#F7A072" /> // 深色 + 暖色焦点
 *   <AmbientBackground intensity="medium" showEcg={false} />
 *
 * 注意：本组件接管整个画面，放在 Scene 最底层。其他内容写在它后面（会渲染在上方）。
 */

export type AmbientIntensity = 'low' | 'medium' | 'high';
export type AmbientVariant = 'surface' | 'ink' | 'mist';

interface AmbientBackgroundProps {
  /** 动效强度 · 控制透明度倍率 · 默认 low */
  intensity?: AmbientIntensity;
  /** 底色变体 · 默认 surface（浅底） */
  variant?: AmbientVariant;
  /** 主强调色 · 默认品牌蓝 #006485 */
  accent?: string;
  /** 是否显示底部 ECG 心跳线 · 默认 true */
  showEcg?: boolean;
  /** 粒子数量 · 默认 14 */
  particleCount?: number;
  /**
   * 全局动画时间偏移（帧）· 用于让相邻场景的粒子位置不重叠
   * 默认 0 · 若某场景视觉相似，可传大数错开
   */
  seed?: number;
}

/** 稳定伪随机 · 同一 (i, salt) 永远返回相同值 */
const hash = (i: number, salt = 0): number => {
  const x = Math.sin(i * 9973 + salt * 2777 + 1) * 10000;
  return x - Math.floor(x);
};

/** alpha 0-1 → 2 位 hex */
const alphaToHex = (a: number): string =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0');

const VARIANT_BG: Record<AmbientVariant, string> = {
  surface: COLORS.surface, // #F6FAFC
  ink: COLORS.ink,          // #0B3446
  mist: COLORS.mist,        // #E5EEF3
};

const INTENSITY_FACTOR: Record<AmbientIntensity, number> = {
  low: 0.6,
  medium: 1.0,
  high: 1.5,
};

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  intensity = 'low',
  variant = 'surface',
  accent = COLORS.primary,
  showEcg = true,
  particleCount = 14,
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const f = frame + seed;

  const factor = INTENSITY_FACTOR[intensity];
  const bg = VARIANT_BG[variant];
  const warm = COLORS.accent; // 暖色强调

  // === Mesh 缓慢漂移（正弦曲线，period 约 8-10s） ===
  const dxA = 4 * Math.sin(f / 240);
  const dyA = 3 * Math.cos(f / 180);
  const dxB = -4 * Math.sin(f / 200);
  const dyB = -3 * Math.cos(f / 280);

  const alphaA = 0.12 * factor;
  const alphaB = 0.08 * factor;

  // === ECG 心跳线 · 每 10s 一次循环扫过 ===
  const ecgCycle = fps * 10;
  const ecgPhase = (f % ecgCycle) / ecgCycle;
  const ecgOpacity = 0.10 * factor;

  // ECG path · 一条贯穿全宽的基线，中段有 PQRST 脉冲
  const ecgY = height - 100;
  const pulseX = width * 0.35;
  const p = pulseX;
  const ecgPath = [
    `M 0 ${ecgY}`,
    `L ${p} ${ecgY}`,
    `L ${p + 18} ${ecgY}`,
    `L ${p + 26} ${ecgY - 8}`, // Q
    `L ${p + 34} ${ecgY + 6}`, // S 前半
    `L ${p + 40} ${ecgY - 46}`, // R 峰
    `L ${p + 48} ${ecgY + 36}`, // S 峰
    `L ${p + 56} ${ecgY}`,
    `L ${p + 78} ${ecgY - 10}`, // T
    `L ${p + 100} ${ecgY}`,
    `L ${width} ${ecgY}`,
  ].join(' ');

  // 在深色底上 ECG 需稍微提亮
  const ecgStroke = variant === 'ink' ? '#8FB4C2' : accent;

  return (
    <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
      {/* Mesh layer A · 主色 · 右上方 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse ${58 + dxA}% ${62 + dyA}% at ${82 + dxA}% ${14 + dyA}%, ${accent}${alphaToHex(alphaA)} 0%, ${accent}00 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Mesh layer B · 暖色 · 左下方 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse ${52 + dxB}% ${56 + dyB}% at ${18 + dxB}% ${86 + dyB}%, ${warm}${alphaToHex(alphaB)} 0%, ${warm}00 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* SVG layer · 粒子 + ECG */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {/* 浮动粒子 · blur bokeh */}
        {Array.from({ length: particleCount }).map((_, i) => {
          const baseX = hash(i, 1) * width;
          const baseY = hash(i, 2) * height;
          const size = 20 + hash(i, 3) * 50;
          const speed = 0.18 + hash(i, 4) * 0.32;
          const phase = hash(i, 5) * Math.PI * 2;
          const amp = 35 + hash(i, 6) * 75;
          const t = f / fps;
          const dx = Math.sin(t * speed + phase) * amp;
          const dy = Math.cos(t * speed * 0.7 + phase + 1.3) * amp * 0.6;
          const particleOpacity = (0.04 + hash(i, 7) * 0.1) * factor;
          const color = hash(i, 8) < 0.5 ? accent : warm;
          return (
            <circle
              key={i}
              cx={baseX + dx}
              cy={baseY + dy}
              r={size}
              fill={color}
              opacity={particleOpacity}
              style={{ filter: 'blur(22px)' }}
            />
          );
        })}

        {/* 底部 ECG 心跳线 */}
        {showEcg && (
          <path
            d={ecgPath}
            fill="none"
            stroke={ecgStroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${width * 0.35} ${width * 0.65}`}
            strokeDashoffset={-ecgPhase * width}
            opacity={ecgOpacity}
          />
        )}
      </svg>
    </AbsoluteFill>
  );
};
