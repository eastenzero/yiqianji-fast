import { AbsoluteFill, useCurrentFrame } from 'remotion';

/**
 * Sweep · 光束扫过
 *
 * 一束柔和的光斜掠过元素/整幅画面，常用于"揭示性转场"或"高光强调"。
 * 是动效分层的 Layer 3/4 重要组件，典型应用：
 *   - P03 产品定位：Before → After 转场前的扫光
 *   - 关键卡片（KPI 数字、徽章）被光扫过
 *   - 页间切换的"过场感"
 *
 * 5 种方向：ltr/rtl/ttb/btt/diagonal（带 angle 参数）
 *
 * 使用示例：
 *   // 水平扫过（最常用）
 *   <Sweep direction="ltr" startFrame={60} durationFrames={30} />
 *
 *   // 斜扫（电影感强）
 *   <Sweep direction="diagonal" angle={-18} intensity={0.5} />
 *
 *   // 屏幕揭示（白色 wipe · 用于 P03）
 *   <Sweep direction="ltr" color="#FFFFFF" intensity={0.9} beamWidthPercent={60} />
 *
 * 注意：Sweep 默认覆盖全屏。想限制在某个区域，包一层 `position: relative; overflow: hidden` 的 div。
 */

export type SweepDirection = 'ltr' | 'rtl' | 'ttb' | 'btt' | 'diagonal';

interface SweepProps {
  /** 方向 · 默认 ltr（从左到右） */
  direction?: SweepDirection;
  /** 触发起始帧（scene 局部帧） · 默认 0 */
  startFrame?: number;
  /** 扫过持续帧 · 默认 36（@30fps = 1.2s） */
  durationFrames?: number;
  /** 光束颜色 · 默认白色 */
  color?: string;
  /** 光束宽度占容器比例 · 0-100 · 默认 25 */
  beamWidthPercent?: number;
  /** 光束峰值不透明度 · 0-1 · 默认 0.6 */
  intensity?: number;
  /** 对角线角度（仅 diagonal 生效）· 默认 -18° */
  angle?: number;
  /** 层级 · 默认 50 */
  zIndex?: number;
  /** 混合模式 · 默认不设置（纯 alpha）· 'screen' 能让光束在深色底上更亮 */
  blendMode?: React.CSSProperties['mixBlendMode'];
}

const alphaHex = (a: number): string =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0');

export const Sweep: React.FC<SweepProps> = ({
  direction = 'ltr',
  startFrame = 0,
  durationFrames = 36,
  color = '#FFFFFF',
  beamWidthPercent = 25,
  intensity = 0.6,
  angle = -18,
  zIndex = 50,
  blendMode,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  // 扫光只在 [0, durationFrames] 期间渲染，结束后自动消失
  if (localFrame < 0 || localFrame > durationFrames) return null;

  const t = Math.max(0, Math.min(1, localFrame / durationFrames));
  const alpha = alphaHex(intensity);

  const beamStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    mixBlendMode: blendMode,
  };

  if (direction === 'ltr' || direction === 'rtl') {
    // 垂直窄带 · 横向平移
    const startLeft = direction === 'ltr' ? -beamWidthPercent : 100;
    const endLeft = direction === 'ltr' ? 100 : -beamWidthPercent;
    const leftPct = startLeft + (endLeft - startLeft) * t;
    Object.assign(beamStyle, {
      top: 0,
      bottom: 0,
      width: `${beamWidthPercent}%`,
      left: `${leftPct}%`,
      background: `linear-gradient(90deg, ${color}00 0%, ${color}${alpha} 50%, ${color}00 100%)`,
    });
  } else if (direction === 'ttb' || direction === 'btt') {
    // 水平窄带 · 纵向平移
    const startTop = direction === 'ttb' ? -beamWidthPercent : 100;
    const endTop = direction === 'ttb' ? 100 : -beamWidthPercent;
    const topPct = startTop + (endTop - startTop) * t;
    Object.assign(beamStyle, {
      left: 0,
      right: 0,
      height: `${beamWidthPercent}%`,
      top: `${topPct}%`,
      background: `linear-gradient(180deg, ${color}00 0%, ${color}${alpha} 50%, ${color}00 100%)`,
    });
  } else {
    // diagonal · 旋转后的垂直窄带
    const startLeft = -beamWidthPercent - 20;
    const endLeft = 100 + 20;
    const leftPct = startLeft + (endLeft - startLeft) * t;
    Object.assign(beamStyle, {
      top: '-30%',
      bottom: '-30%',
      width: `${beamWidthPercent}%`,
      left: `${leftPct}%`,
      background: `linear-gradient(90deg, ${color}00 0%, ${color}${alpha} 50%, ${color}00 100%)`,
      transform: `rotate(${angle}deg)`,
      transformOrigin: 'center center',
    });
  }

  return (
    <AbsoluteFill style={{ overflow: 'hidden', zIndex, pointerEvents: 'none' }}>
      <div style={beamStyle} />
    </AbsoluteFill>
  );
};
