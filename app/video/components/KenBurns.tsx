import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * KenBurns · 电影级图片缩放 + 平移动画
 *
 * 专为"实机截图"设计：给静态 png 带来"镜头在推/拉/扫"的观感，
 * 是演示段穿插（D1-D3）和 P01 封面的核心动效之一。
 *
 * 使用示例：
 *   // 缓慢推近 8%（最常用默认）
 *   <KenBurns src={staticFile('screenshots/phone/06-home-full.png')} />
 *
 *   // 从右上推到左下，缩放 1.0 → 1.18
 *   <KenBurns
 *     src={url}
 *     from={{ scale: 1.0, x: 60, y: -40 }}
 *     to={{ scale: 1.18, x: -30, y: 20 }}
 *   />
 *
 *   // 带入/出淡入
 *   <KenBurns src={url} fadeInFrames={18} fadeOutFrames={14} />
 *
 * 注意：默认 durationFrames 等于场景总帧数（`useVideoConfig().durationInFrames`）。
 */

export interface KenBurnsState {
  /** 缩放倍率 · 1 = 原图 · 1.15 = 放大 15% */
  scale?: number;
  /** X 平移（px · 正值 = 向右） */
  x?: number;
  /** Y 平移（px · 正值 = 向下） */
  y?: number;
}

interface KenBurnsProps {
  /** 图片 src · 通常传 `staticFile('...')` */
  src: string;
  /** 起始状态 · 默认 `{ scale: 1 }` */
  from?: KenBurnsState;
  /** 结束状态 · 默认 `{ scale: 1.08 }` */
  to?: KenBurnsState;
  /** 动画帧数 · 默认等于场景总长 */
  durationFrames?: number;
  /** 起始帧（scene 局部帧） · 默认 0 */
  startFrame?: number;
  /** 图片填充方式 · 默认 cover */
  fit?: 'cover' | 'contain';
  /** 淡入帧数 · 0 表示不淡入 */
  fadeInFrames?: number;
  /** 淡出帧数 · 0 表示不淡出 */
  fadeOutFrames?: number;
  /** 缓动函数 · 输入 [0,1] · 输出 [0,1] · 默认线性 */
  easing?: (t: number) => number;
  /** 外层容器 className */
  className?: string;
  /** 外层容器额外 style（覆盖 inset / overflow） */
  style?: React.CSSProperties;
  /** Img 额外 style（对接 filter / borderRadius 等） */
  imgStyle?: React.CSSProperties;
  /** transform-origin · 默认 center center */
  transformOrigin?: string;
}

/** 常用缓动：easeInOut（S-curve，电影感更强） */
export const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/** 常用缓动：easeOut（前快后慢，适合"推近停住"感） */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

const DEFAULT_FROM: Required<KenBurnsState> = { scale: 1, x: 0, y: 0 };
const DEFAULT_TO: Required<KenBurnsState> = { scale: 1.08, x: 0, y: 0 };

export const KenBurns: React.FC<KenBurnsProps> = ({
  src,
  from,
  to,
  durationFrames,
  startFrame = 0,
  fit = 'cover',
  fadeInFrames = 0,
  fadeOutFrames = 0,
  easing,
  className,
  style,
  imgStyle,
  transformOrigin = 'center center',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const effDur = durationFrames ?? durationInFrames;
  const localFrame = frame - startFrame;

  // 线性时间进度 [0, 1]
  const rawT = Math.max(0, Math.min(1, localFrame / Math.max(1, effDur)));
  const t = easing ? easing(rawT) : rawT;

  const f = { ...DEFAULT_FROM, ...from };
  const dst = { ...DEFAULT_TO, ...to };

  const scale = f.scale + (dst.scale - f.scale) * t;
  const x = f.x + (dst.x - f.x) * t;
  const y = f.y + (dst.y - f.y) * t;

  // 透明度 · 叠加 fadeIn / fadeOut
  let opacity = 1;
  if (fadeInFrames > 0) {
    opacity *= interpolate(localFrame, [0, fadeInFrames], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  if (fadeOutFrames > 0) {
    opacity *= interpolate(
      localFrame,
      [effDur - fadeOutFrames, effDur],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
  }

  return (
    <AbsoluteFill
      className={className}
      style={{ overflow: 'hidden', ...style }}
    >
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit,
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          transformOrigin,
          opacity,
          ...imgStyle,
        }}
      />
    </AbsoluteFill>
  );
};
