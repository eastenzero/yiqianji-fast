import { Composition } from 'remotion';
import { Main } from './Main';
import { MainV2, MainV2NoVoice, MainV2NoVoiceWithSubtitles } from './MainV2';
import {
  FPS,
  TOTAL_FRAMES,
  V2_TOTAL_FRAMES,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
} from './constants';

/**
 * Remotion Composition 注册表。
 *
 * 当前 Composition：
 *   1. YiqianjiMain                 · 旧版 90s 商业路演风（历史参考）
 *   2. YiqianjiV2                   · 新版 6:09 计赛答辩版 · 带 TTS 配音 + 字幕（主版本 · 待提交）
 *   3. YiqianjiV2NoVoice            · 同上但无配音、无字幕（备用 · 现场答辩人自己讲）
 *   4. YiqianjiV2NoVoiceWithSubtitles · 静音预览版 · 带字幕、无配音（便于静音审阅）
 *
 * 如需输出竖屏 / 方图版，复制一份并覆盖 width/height 即可。
 */
export const Root: React.FC = () => {
  return (
    <>
      {/* === 旧版 · 保留作对比参考 === */}
      <Composition
        id="YiqianjiMain"
        component={Main}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />

      {/* === V2 · 配音版（提交主版本） === */}
      <Composition
        id="YiqianjiV2"
        component={MainV2}
        durationInFrames={V2_TOTAL_FRAMES}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />

      {/* === V2 · 无配音版（现场讲解 · 无字幕 · 备用） === */}
      <Composition
        id="YiqianjiV2NoVoice"
        component={MainV2NoVoice}
        durationInFrames={V2_TOTAL_FRAMES}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />

      {/* === V2 · 静音+字幕版（便于静音环境预览） === */}
      <Composition
        id="YiqianjiV2NoVoiceWithSubtitles"
        component={MainV2NoVoiceWithSubtitles}
        durationInFrames={V2_TOTAL_FRAMES}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
