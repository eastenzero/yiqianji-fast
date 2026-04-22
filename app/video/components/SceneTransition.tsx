import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * SceneTransition · 场景入/出过渡包装器
 *
 * 把一个场景的内容包起来，自动在开头应用 enter 动画、结尾应用 exit 动画。
 * 是动效分层的 Layer 4（转场层）统一入口。
 *
 * 5 种过渡类型：
 *   - zoom         入场 scale 0.94→1 + fade；出场 scale 1→1.06 + fade
 *   - push-left    入场 tx +100%→0% + fade；出场 tx 0→-100% + fade
 *   - push-right   入场 tx -100%→0% + fade；出场 tx 0→+100% + fade
 *   - push-up      入场 ty +100%→0% + fade；出场 ty 0→-100% + fade
 *   - push-down    入场 ty -100%→0% + fade；出场 ty 0→+100% + fade
 *   - fade         纯透明度
 *   - none         无动画
 *
 * 使用示例：
 *   // 常规 PPT 页切换：推拉 + fade
 *   <SceneTransition>
 *     <AmbientBackground />
 *     <MyPptSlide />
 *   </SceneTransition>
 *
 *   // 自定义：入场推进，出场缩小
 *   <SceneTransition enter="push-left" exit="zoom" enterFrames={20} exitFrames={14}>
 *     ...
 *   </SceneTransition>
 *
 * 注意：需要 `useVideoConfig().durationInFrames` 可用（Series.Sequence 会正确提供）。
 */

export type TransitionType =
  | 'zoom'
  | 'push-left'
  | 'push-right'
  | 'push-up'
  | 'push-down'
  | 'fade'
  | 'none';

interface SceneTransitionProps {
  children: React.ReactNode;
  /** 入场类型 · 默认 zoom */
  enter?: TransitionType;
  /** 出场类型 · 默认 zoom */
  exit?: TransitionType;
  /** 入场帧数 · 默认 14 */
  enterFrames?: number;
  /** 出场帧数 · 默认 14 */
  exitFrames?: number;
  /** zoom 的入场起始 scale · 默认 0.94 */
  enterZoomFrom?: number;
  /** zoom 的出场终止 scale · 默认 1.06 */
  exitZoomTo?: number;
  /** push 的平移百分比幅度 · 默认 8（避免太夸张） */
  pushPercent?: number;
  /** 额外 style · 叠加到 AbsoluteFill 包装器 */
  style?: React.CSSProperties;
}

interface TransformState {
  scale: number;
  tx: number; // %
  ty: number; // %
  opacity: number;
}

/** 根据类型 + 进度（0→1）计算入场变换（0 = 刚开始进入, 1 = 完全进入完毕） */
function enterTransform(
  type: TransitionType,
  t: number,
  zoomFrom: number,
  pushPct: number,
): TransformState {
  const s: TransformState = { scale: 1, tx: 0, ty: 0, opacity: 1 };
  switch (type) {
    case 'zoom':
      s.scale = zoomFrom + (1 - zoomFrom) * t;
      s.opacity = t;
      break;
    case 'push-left':
      s.tx = (1 - t) * pushPct;
      s.opacity = t;
      break;
    case 'push-right':
      s.tx = -(1 - t) * pushPct;
      s.opacity = t;
      break;
    case 'push-up':
      s.ty = (1 - t) * pushPct;
      s.opacity = t;
      break;
    case 'push-down':
      s.ty = -(1 - t) * pushPct;
      s.opacity = t;
      break;
    case 'fade':
      s.opacity = t;
      break;
    case 'none':
      break;
  }
  return s;
}

/** 出场变换（0 = 还没开始出场, 1 = 完全出去了） */
function exitTransform(
  type: TransitionType,
  t: number,
  zoomTo: number,
  pushPct: number,
): TransformState {
  const s: TransformState = { scale: 1, tx: 0, ty: 0, opacity: 1 };
  switch (type) {
    case 'zoom':
      s.scale = 1 + (zoomTo - 1) * t;
      s.opacity = 1 - t;
      break;
    case 'push-left':
      s.tx = -t * pushPct;
      s.opacity = 1 - t;
      break;
    case 'push-right':
      s.tx = t * pushPct;
      s.opacity = 1 - t;
      break;
    case 'push-up':
      s.ty = -t * pushPct;
      s.opacity = 1 - t;
      break;
    case 'push-down':
      s.ty = t * pushPct;
      s.opacity = 1 - t;
      break;
    case 'fade':
      s.opacity = 1 - t;
      break;
    case 'none':
      break;
  }
  return s;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  children,
  enter = 'zoom',
  exit = 'zoom',
  enterFrames = 14,
  exitFrames = 14,
  enterZoomFrom = 0.94,
  exitZoomTo = 1.06,
  pushPercent = 8,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const enterT = interpolate(frame, [0, enterFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitT = interpolate(
    frame,
    [durationInFrames - exitFrames, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const ent = enterTransform(enter, enterT, enterZoomFrom, pushPercent);
  const ext = exitTransform(exit, exitT, exitZoomTo, pushPercent);

  // 叠加入场和出场 · 在中间静止段两者都是"中立"（scale=1, tx=0, ty=0, opacity=1）
  const scale = ent.scale * ext.scale;
  const tx = ent.tx + ext.tx;
  const ty = ent.ty + ext.ty;
  const opacity = ent.opacity * ext.opacity;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
        transformOrigin: 'center center',
        opacity,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
