#!/usr/bin/env node
/**
 * 预览字幕拆行效果 · 不渲染视频 · 纯文本检查每条 cue 的文本和帧时长
 *
 * 用法：
 *   cd app
 *   node scripts/preview-subtitle-cues.mjs
 */

import { readFile } from 'node:fs/promises';

const script = JSON.parse(
  await readFile(new URL('../video/voice-script-v2.json', import.meta.url), 'utf8'),
);

const CUE_CHAR_LIMIT = 32;
const FPS = 30;

// 复制自 SubtitleTrack.tsx 的拆行逻辑（保持一致）
function splitIntoCues(text) {
  const strongSentences = [];
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

  const cues = [];
  for (const s of strongSentences) {
    if ([...s].length <= CUE_CHAR_LIMIT) {
      cues.push(s);
      continue;
    }
    const pieces = s.split(/([，；：、—])/g).filter((p) => p !== '');
    const atoms = [];
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

console.log('📝 字幕拆行预览 · cue 列表');
console.log('═'.repeat(90));

let totalCues = 0;

for (const seg of script.segments) {
  const { id, sceneName, startFrame, durationFrames, text } = seg;
  if (!durationFrames) continue;

  const cueTexts = splitIntoCues(text);
  const totalChars = cueTexts.reduce((s, t) => s + [...t].length, 0);

  console.log(`\n▶ [${id}] ${sceneName}  ·  ${cueTexts.length} cues  ·  ${durationFrames}f (${(durationFrames / FPS).toFixed(1)}s)`);
  console.log('─'.repeat(90));

  let cursor = startFrame;
  for (let i = 0; i < cueTexts.length; i++) {
    const ct = cueTexts[i];
    const chars = [...ct].length;
    const frames =
      i === cueTexts.length - 1
        ? startFrame + durationFrames - cursor
        : Math.max(1, Math.round((chars / totalChars) * durationFrames));
    const sec = (frames / FPS).toFixed(2);
    const startSec = (cursor / FPS).toFixed(1);
    const bar = '█'.repeat(Math.max(1, Math.round(chars / 2)));
    console.log(
      `  ${String(i + 1).padStart(2)}. [${startSec}s · ${sec}s · ${chars}字] ${ct}  ${bar}`,
    );
    cursor += frames;
    totalCues++;
  }
}

console.log('\n═'.repeat(90));
console.log(`总计：${totalCues} 条字幕 cue`);
