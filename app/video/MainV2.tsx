import { AbsoluteFill, Audio, Sequence, Series, interpolate, staticFile } from 'remotion';
import {
  BGM_ENABLED,
  BGM_FILE,
  V2_BGM_VOLUME_NO_VOICE,
  V2_BGM_VOLUME_WITH_VOICE,
  V2_SCENE_DURATIONS,
  V2_TOTAL_FRAMES,
} from './constants';
import voiceScriptV2 from './voice-script-v2.json';
import { P01Cover } from './scenes/v2/P01-Cover';
import { P02Background } from './scenes/v2/P02-Background';
import { P03Positioning } from './scenes/v2/P03-Positioning';
import { D1RecordFlow } from './scenes/v2/D1-RecordFlow';
import { P04Features } from './scenes/v2/P04-Features';
import { P05RecordOrganize } from './scenes/v2/P05-RecordOrganize';
import { D2AiSummary } from './scenes/v2/D2-AiSummary';
import { P06SummarySharing } from './scenes/v2/P06-SummarySharing';
import { D3DoctorScan } from './scenes/v2/D3-DoctorScan';
import { P07Architecture } from './scenes/v2/P07-Architecture';
import { P08Security } from './scenes/v2/P08-Security';
import { P09Team } from './scenes/v2/P09-Team';

/**
 * V2 主视频组合 · 计赛答辩版
 *
 * 9 页 PPT (P01-P09) + 3 段穿插演示 (D1-D3) 共 12 段
 * 时间轴见 constants.ts 的 V2_SCENE_DURATIONS
 *
 * 双版本架构：
 *   - MainV2        · 带 TTS 配音 + BGM（压低）
 *   - MainV2NoVoice · 仅 BGM（音量回升）
 *
 * 配音脚本：`voice-script-v2.json` · mp3 由 `npm run voice:generate:v2` 生成到 `public/audio/voice-v2/`
 */

const V2_VOICE_DIR = 'audio/voice-v2';

type MainV2BodyProps = {
  withVoice: boolean;
};

const MainV2Body: React.FC<MainV2BodyProps> = ({ withVoice }) => {
  const bgmVolume = withVoice ? V2_BGM_VOLUME_WITH_VOICE : V2_BGM_VOLUME_NO_VOICE;

  return (
    <AbsoluteFill className="bg-[#F6FAFC]">
      {/* ============ BGM 音频层 ============ */}
      {BGM_ENABLED && (
        <Audio
          src={staticFile(BGM_FILE)}
          volume={(f) =>
            interpolate(
              f,
              [0, 30, V2_TOTAL_FRAMES - 45, V2_TOTAL_FRAMES],
              [0, bgmVolume, bgmVolume, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            )
          }
        />
      )}

      {/* ============ 配音层 · 仅 withVoice=true 时挂载 ============ */}
      {/* 每段配音在 startFrame 挂载 Sequence · mp3 由 npm run voice:generate:v2 产出 */}
      {withVoice &&
        voiceScriptV2.segments.map((seg) => (
          <Sequence
            key={seg.id}
            from={seg.startFrame}
            name={`Voice-${seg.id}`}
          >
            <Audio
              src={staticFile(`${V2_VOICE_DIR}/${seg.id}.mp3`)}
              volume={1.0}
            />
          </Sequence>
        ))}

      {/* ============ 12 段 Series 串联 ============ */}
      <Series>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.p01_cover}
          name="P01-Cover"
        >
          <P01Cover />
        </Series.Sequence>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.p02_background}
          name="P02-Background"
        >
          <P02Background />
        </Series.Sequence>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.p03_positioning}
          name="P03-Positioning"
        >
          <P03Positioning />
        </Series.Sequence>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.d1_recordFlow}
          name="D1-RecordFlow"
        >
          <D1RecordFlow />
        </Series.Sequence>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.p04_features}
          name="P04-Features"
        >
          <P04Features />
        </Series.Sequence>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.p05_recordOrganize}
          name="P05-RecordOrganize"
        >
          <P05RecordOrganize />
        </Series.Sequence>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.d2_aiSummary}
          name="D2-AiSummary"
        >
          <D2AiSummary />
        </Series.Sequence>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.p06_summarySharing}
          name="P06-SummarySharing"
        >
          <P06SummarySharing />
        </Series.Sequence>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.d3_doctorScan}
          name="D3-DoctorScan"
        >
          <D3DoctorScan />
        </Series.Sequence>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.p07_architecture}
          name="P07-Architecture"
        >
          <P07Architecture />
        </Series.Sequence>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.p08_security}
          name="P08-Security"
        >
          <P08Security />
        </Series.Sequence>
        <Series.Sequence
          durationInFrames={V2_SCENE_DURATIONS.p09_team}
          name="P09-Team"
        >
          <P09Team />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

/** 配音版 · 提交给评委的主版本 */
export const MainV2: React.FC = () => <MainV2Body withVoice={true} />;

/** 无配音版 · 备用 · 现场答辩人自己讲 */
export const MainV2NoVoice: React.FC = () => <MainV2Body withVoice={false} />;
