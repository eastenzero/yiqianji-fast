import { useCurrentFrame } from 'remotion';
import { useMemo } from 'react';
import voiceScriptV2 from '../voice-script-v2.json';
import { COLORS } from '../constants';

/**
 * V2 全局字幕层 · 覆盖整个视频时长
 *
 * 策略：
 *  1. 读 `voice-script-v2.json` 的每段 `segment`：`id` / `startFrame` / `durationFrames`
 *  2. 按强标点（。！？）拆成"句"，再对超长句按弱标点（，；：、—）拆成"短句"（控制每条 <= CUE_CHAR_LIMIT 字）
 *  3. 每条 cue 的帧区间 = segment 帧区间 × (该 cue 字数 / segment 总字数)
 *  4. 当前全局帧 → 查找命中的 cue → 渲染
 *  5. 风格：**文字辉光风**（无底条）
 *     - 浅底场景：ink 深文 + 白色外辉 + 轻深色投影
 *     - 暗底场景（P01/P03/P07）：白文 + 深蓝/黑外辉 + 高对比
 *
 * 注意：放在 MainV2 `<Series>` 之外才能拿到**全局帧**。
 */

/** 暗底场景 segment id 集合 · 字幕在这几个场景自动用白文反色 */
const DARK_SCENE_IDS = new Set<string>([
  'p01-cover',
  'p03-positioning',
  'p07-architecture',
]);

/**
 * 跳过字幕的 segment id 集合
 * - p01-cover：封面底部已有 SVG 团队信息 + 大赛信息，字幕会压到他们上面
 *   且封面文案「今天带来一款诊前信息整理与沟通辅助系统」与 SVG 副标题重复
 */
const SKIP_SUBTITLE_SEGMENT_IDS = new Set<string>(['p01-cover']);

type Cue = { from: number; to: number; text: string; dark: boolean };

const CUE_CHAR_LIMIT = 32; // 每条字幕最多多少个 CJK 字符（视频 1920 宽度下 44px 字号约容纳 30-34 字）
const FADE_FRAMES = 4;

/** 把一段 text 拆成若干 cue 文本 */
function splitIntoCues(text: string): string[] {
  // 第一层：按强标点 "。！？" 切
  const strongSentences: string[] = [];
  {
    const pieces = text.split(/([。！？])/g);
    let cur = '';
    for (const p of pieces) {
      if (p === '') continue;
      if (/^[。！？]$/.test(p)) {
        cur += p;
        strongSentences.push(cur);
        cur = '';
      } else {
        cur += p;
      }
    }
    if (cur) strongSentences.push(cur);
  }

  // 第二层：对超长句按弱标点 "，；：—" 继续切
  const cues: string[] = [];
  for (const s of strongSentences) {
    if ([...s].length <= CUE_CHAR_LIMIT) {
      cues.push(s);
      continue;
    }
    // 切成最小单元 · 再贪心合并到 CUE_CHAR_LIMIT 以内
    const pieces = s.split(/([，；：、—])/g).filter((p) => p !== '');
    const atoms: string[] = [];
    let cur = '';
    for (const p of pieces) {
      if (/^[，；：、—]$/.test(p)) {
        cur += p;
        atoms.push(cur);
        cur = '';
      } else {
        cur += p;
      }
    }
    if (cur) atoms.push(cur);

    // 贪心合并 · 不跨 CUE_CHAR_LIMIT
    let merged = '';
    for (const atom of atoms) {
      if ([...merged].length + [...atom].length <= CUE_CHAR_LIMIT) {
        merged += atom;
      } else {
        if (merged) cues.push(merged);
        merged = atom;
      }
    }
    if (merged) cues.push(merged);
  }

  return cues.map((s) => s.trim()).filter((s) => s.length > 0);
}

/** 从 voice-script-v2.json 预计算所有 cue */
function buildAllCues(): Cue[] {
  const all: Cue[] = [];
  for (const seg of voiceScriptV2.segments) {
    const { id, startFrame, durationFrames, text } = seg as {
      id: string;
      startFrame: number;
      durationFrames?: number;
      text: string;
    };
    if (!durationFrames || durationFrames <= 0) continue;
    if (SKIP_SUBTITLE_SEGMENT_IDS.has(id)) continue;

    const dark = DARK_SCENE_IDS.has(id);
    const cueTexts = splitIntoCues(text);
    if (cueTexts.length === 0) continue;

    const totalChars = cueTexts.reduce((sum, t) => sum + [...t].length, 0);
    if (totalChars === 0) continue;

    let cursor = startFrame;
    for (let i = 0; i < cueTexts.length; i++) {
      const ct = cueTexts[i];
      const chars = [...ct].length;
      // 最后一条吃满尾帧 · 避免因四舍五入造成漏帧
      const frames =
        i === cueTexts.length - 1
          ? startFrame + durationFrames - cursor
          : Math.max(1, Math.round((chars / totalChars) * durationFrames));
      all.push({ from: cursor, to: cursor + frames, text: ct, dark });
      cursor += frames;
    }
  }
  return all;
}

/** 二分查找当前 frame 命中的 cue · O(log n) · cue 列表按 from 有序 */
function findActiveCue(frame: number, cues: Cue[]): Cue | null {
  let lo = 0;
  let hi = cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const c = cues[mid];
    if (frame < c.from) hi = mid - 1;
    else if (frame >= c.to) lo = mid + 1;
    else return c;
  }
  return null;
}

export const SubtitleTrack: React.FC = () => {
  const frame = useCurrentFrame();

  // useMemo 缓存 cue 列表 · 组件只计算一次
  const cues = useMemo(() => buildAllCues(), []);

  const active = findActiveCue(frame, cues);
  if (!active) return null;

  // 淡入淡出 · 避免 cue 切换时硬跳
  const localFrame = frame - active.from;
  const dur = active.to - active.from;
  // 防御：cue 太短不做淡入淡出
  const fade = Math.min(FADE_FRAMES, Math.floor(dur / 3));
  let opacity = 1;
  if (fade > 0) {
    if (localFrame < fade) opacity = localFrame / fade;
    else if (localFrame > dur - fade) opacity = Math.max(0, (dur - localFrame) / fade);
  }

  // 暗底 vs 浅底 两套字色 + 辉光
  //   浅底：ink 深文字 + 白色外辉（饱和范围 0-0.9）+ 轻深色投影
  //   暗底：白文字 + 深蓝外辉（提高暗部对比）+ 黑色投影
  const color = active.dark ? '#FFFFFF' : COLORS.ink;
  // 辉光 = 多层 textShadow 叠加 · 高 alpha 近距 + 中 alpha 中距 + 轻投影
  const glowColor = active.dark ? 'rgba(4, 28, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const glowColorSoft = active.dark ? 'rgba(4, 28, 40, 0.75)' : 'rgba(255, 255, 255, 0.70)';
  const dropShadow = active.dark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(11, 52, 70, 0.35)';
  const textShadow = [
    `0 0 4px ${glowColor}`,
    `0 0 12px ${glowColor}`,
    `0 0 28px ${glowColorSoft}`,
    `0 2px 6px ${dropShadow}`,
  ].join(', ');

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 160,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: '82%',
          padding: '0 48px',
          color,
          fontSize: 42,
          fontWeight: 600,
          letterSpacing: '0.035em',
          lineHeight: 1.25,
          textAlign: 'center',
          textShadow,
        }}
      >
        {active.text}
      </div>
    </div>
  );
};
