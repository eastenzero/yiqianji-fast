import { AbsoluteFill, Audio, Sequence, Series, interpolate, staticFile } from 'remotion';
import {
  BGM_ENABLED,
  BGM_FILE,
  BGM_VOLUME,
  SCENE_DURATIONS,
  TOTAL_FRAMES,
  VOICE_ENABLED,
} from './constants';
import voiceScript from './voice-script.json';
import { CoverScene } from './scenes/_archive/01-Cover';
import { ProblemScene } from './scenes/_archive/02-Problem';
import { RevealScene } from './scenes/_archive/03-Reveal';
import { ProductDemoScene } from './scenes/_archive/04-ProductDemo';
import { AiSummaryScene } from './scenes/_archive/05-AiSummary';
import { TechnologyScene } from './scenes/_archive/06-Technology';
import { BusinessScene } from './scenes/_archive/07-Business';
import { TeamScene } from './scenes/_archive/08-Team';
import { EndingScene } from './scenes/_archive/09-Ending';

/**
 * 主视频组合 · 把 9 个 Scene 按时间轴串联 + BGM + 配音层。
 * 时间轴定义见 constants.ts 的 SCENE_DURATIONS。
 * 配音分段见 voice-script.json，每段对应 public/audio/voice/<id>.mp3。
 */
export const Main: React.FC = () => {
  return (
    <AbsoluteFill className="bg-[#F6FAFC]">
      {/* ============ BGM 音频层 ============ */}
      {BGM_ENABLED && (
        <Audio
          src={staticFile(BGM_FILE)}
          volume={(f) =>
            interpolate(
              f,
              [0, 30, TOTAL_FRAMES - 45, TOTAL_FRAMES],
              [0, BGM_VOLUME, BGM_VOLUME, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            )
          }
        />
      )}

      {/* ============ 配音层 · 每段 Sequence 从对应 startFrame 开始播放 ============ */}
      {VOICE_ENABLED &&
        voiceScript.segments.map((seg) => (
          <Sequence key={seg.id} from={seg.startFrame} name={`Voice-${seg.id}`}>
            <Audio
              src={staticFile(`audio/voice/${seg.id}.mp3`)}
              volume={1.0}
            />
          </Sequence>
        ))}

      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.cover} name="Cover">
          <CoverScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.problem} name="Problem">
          <ProblemScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.reveal} name="Reveal">
          <RevealScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.productDemo} name="ProductDemo">
          <ProductDemoScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.aiSummary} name="AiSummary">
          <AiSummaryScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.technology} name="Technology">
          <TechnologyScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.business} name="Business">
          <BusinessScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.team} name="Team">
          <TeamScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.ending} name="Ending">
          <EndingScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
