import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { DEBUG_SHOW_SCENE_LABEL } from '../constants';

/**
 * 调试用场景标签 · 左上角浮层展示当前场景名与时间码。
 * 生产渲染前把 constants.ts 的 DEBUG_SHOW_SCENE_LABEL 设为 false 即可全局隐藏。
 */
interface SceneLabelProps {
  name: string;
  index: number;
}

export const SceneLabel: React.FC<SceneLabelProps> = ({ name, index }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  if (!DEBUG_SHOW_SCENE_LABEL) return null;

  const seconds = (frame / fps).toFixed(2);
  const totalSeconds = (durationInFrames / fps).toFixed(0);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div className="absolute left-8 top-8 flex items-center gap-3 rounded-full bg-black/70 px-5 py-2 text-white backdrop-blur">
        <span className="text-sm font-semibold tracking-wide">
          #{String(index).padStart(2, '0')}
        </span>
        <span className="text-base font-medium">{name}</span>
        <span className="ml-2 font-mono text-xs text-white/60">
          {seconds}s / scene · {totalSeconds}s total
        </span>
      </div>
    </AbsoluteFill>
  );
};
