#!/usr/bin/env node
/**
 * 测量 public/audio/voice-v2/*.mp3 的实际时长
 * 用于 A3 字幕区间分配 + 校验不超出 scene 时长
 *
 * 用法：
 *   cd app
 *   node scripts/measure-voice-durations.mjs
 *
 * 输出：
 *   - 控制台表格（segment id / 字数 / 配音秒数 / 配音帧数 / scene 余量）
 *   - 更新 voice-script-v2.json：给每个 segment 补一个 "durationSeconds"/"durationFrames" 字段（便于字幕时间轴分配）
 */

import { parseMedia } from '@remotion/media-parser';
import { nodeReader } from '@remotion/media-parser/node';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const FPS = 30;

const SCRIPT_URL = new URL('../video/voice-script-v2.json', import.meta.url);
const AUDIO_DIR_URL = new URL('../public/audio/voice-v2/', import.meta.url);

const script = JSON.parse(await readFile(SCRIPT_URL, 'utf8'));

// 每段 scene 的 durationInFrames（从 constants.ts 抠出来 · 保持和主代码一致）
// 这里硬编码来避免让这个脚本 import TypeScript
const V2_SCENE_DURATIONS = {
  'p01-cover': 420, // 14s
  'p02-background': 1290, // 43s
  'p03-positioning': 660, // 22s
  'd1-record-flow': 1140, // 38s
  'p04-features': 780, // 26s
  'p05-record-organize': 660, // 22s
  'd2-ai-summary': 1260, // 42s
  'p06-summary-sharing': 600, // 20s
  'd3-doctor-scan': 1050, // 35s
  'p07-architecture': 1320, // 44s
  'p08-security': 1050, // 35s
  'p09-team': 840, // 28s
};

// 每段 scene 的全局起始帧
const V2_SCENE_START_FRAMES = {};
{
  let cursor = 0;
  for (const [key, dur] of Object.entries(V2_SCENE_DURATIONS)) {
    V2_SCENE_START_FRAMES[key] = cursor;
    cursor += dur;
  }
}

console.log('🎧 测量 voice-v2 mp3 实际时长');
console.log('────────────────────────────────────────────────────────────────────────────────');
console.log('id'.padEnd(22) + 'chars  sec     frames  sceneFrames  leadIn  voiceEnd  sceneEnd  margin');
console.log('────────────────────────────────────────────────────────────────────────────────');

let hasOverrun = false;
for (const seg of script.segments) {
  const mp3Path = fileURLToPath(new URL(`${seg.id}.mp3`, AUDIO_DIR_URL));
  const result = await parseMedia({
    src: mp3Path,
    fields: { durationInSeconds: true },
    reader: nodeReader,
    acknowledgeRemotionLicense: true,
  });
  const durSec = result.durationInSeconds ?? 0;
  const durFrames = Math.round(durSec * FPS);
  seg.durationSeconds = Number(durSec.toFixed(3));
  seg.durationFrames = durFrames;

  const sceneStart = V2_SCENE_START_FRAMES[seg.id];
  const sceneFrames = V2_SCENE_DURATIONS[seg.id];
  const sceneEnd = sceneStart + sceneFrames;
  const leadIn = seg.startFrame - sceneStart;
  const voiceEnd = seg.startFrame + durFrames;
  const margin = sceneEnd - voiceEnd;
  const overrun = margin < 0;
  if (overrun) hasOverrun = true;

  const chars = [...seg.text].length;
  console.log(
    seg.id.padEnd(22) +
    String(chars).padStart(4) + '   ' +
    durSec.toFixed(2).padStart(5) + '   ' +
    String(durFrames).padStart(5) + '   ' +
    String(sceneFrames).padStart(6) + '       ' +
    String(leadIn).padStart(4) + '    ' +
    String(voiceEnd).padStart(6) + '   ' +
    String(sceneEnd).padStart(6) + '   ' +
    (overrun ? `❌ ${margin}` : `✅ ${String(margin).padStart(4)}`),
  );
}
console.log('────────────────────────────────────────────────────────────────────────────────');

if (hasOverrun) {
  console.log('\n⚠️  有 scene 的配音超出了 scene 时长 · 需要调整 text 或 scene duration');
} else {
  console.log('\n✅ 所有 scene 配音都在时长预算内');
}

await writeFile(SCRIPT_URL, JSON.stringify(script, null, 2) + '\n', 'utf8');
console.log(`\n📝 已把 durationSeconds / durationFrames 写回 voice-script-v2.json`);
