#!/usr/bin/env node
/**
 * 火山引擎 TTS 批量生成脚本
 *
 * 用法：
 *   cd app
 *   npm run voice:generate         # 旧 V1 脚本（voice-script.json → voice/）
 *   npm run voice:generate:v2      # 新 V2 脚本（voice-script-v2.json → voice-v2/）
 *
 * 或直接指定：
 *   node --env-file=.env.local scripts/generate-voice.mjs \
 *     --script video/voice-script-v2.json \
 *     --out public/audio/voice-v2
 *
 * 环境变量（从 .env.local 加载，Node 22+ 用 --env-file 原生支持）：
 *   VOLCENGINE_APPID            · 火山控制台 AppID
 *   VOLCENGINE_ACCESS_TOKEN     · Access Token
 *   VOLCENGINE_CLUSTER          · 默认 volcano_tts（标准常量）
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';

const APPID = process.env.VOLCENGINE_APPID;
const ACCESS_TOKEN = process.env.VOLCENGINE_ACCESS_TOKEN;
const CLUSTER = process.env.VOLCENGINE_CLUSTER || 'volcano_tts';

if (!APPID || !ACCESS_TOKEN) {
  console.error('❌ 缺少环境变量');
  console.error('   请检查 app/.env.local 是否包含：');
  console.error('   VOLCENGINE_APPID=...');
  console.error('   VOLCENGINE_ACCESS_TOKEN=...');
  process.exit(1);
}

// === 参数解析 · 默认 V1 路径，可被 --script / --out 覆盖 ===
const { values } = parseArgs({
  options: {
    script: { type: 'string', default: 'video/voice-script.json' },
    out: { type: 'string', default: 'public/audio/voice' },
    only: { type: 'string' }, // 只生成指定 segment id（逗号分隔支持多个）· 用于 A1 单段试音
    voice: { type: 'string' }, // 覆盖 meta.defaultVoice · 用于 A1 快速 A/B 测试
  },
});

const onlyIds = values.only ? new Set(values.only.split(',').map((s) => s.trim()).filter(Boolean)) : null;

const TTS_ENDPOINT = 'https://openspeech.bytedance.com/api/v1/tts';
// 路径相对于 app/ 根目录（因为 npm scripts cwd 在 app/）
const SCRIPT_PATH = new URL(`../${values.script}`, import.meta.url);
const OUTPUT_DIR = new URL(`../${values.out}/`, import.meta.url);

/**
 * 调用火山 TTS 合成一段音频
 * @param {string} text 文本
 * @param {string} voiceType 音色 ID
 * @param {number} speed 语速 0.8-1.5
 * @returns {Promise<Buffer>} mp3 字节
 */
async function synthesize(text, voiceType, speed) {
  const body = {
    app: {
      appid: APPID,
      token: ACCESS_TOKEN,
      cluster: CLUSTER,
    },
    user: { uid: 'yiqianji-video' },
    audio: {
      voice_type: voiceType,
      encoding: 'mp3',
      rate: 24000,
      speed_ratio: speed,
      volume_ratio: 1.0,
      pitch_ratio: 1.0,
    },
    request: {
      reqid: randomUUID(),
      text,
      operation: 'query',
    },
  };

  const res = await fetch(TTS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer;${ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  if (data.code !== 3000) {
    throw new Error(`TTS code=${data.code}: ${data.message || JSON.stringify(data)}`);
  }

  return Buffer.from(data.data, 'base64');
}

async function main() {
  const script = JSON.parse(await readFile(SCRIPT_PATH, 'utf8'));
  await mkdir(OUTPUT_DIR, { recursive: true });

  // CLI --voice 覆盖 meta.defaultVoice（A1 音色快速试听时方便）
  const effectiveDefaultVoice = values.voice || script.meta.defaultVoice;

  // 过滤 segments · CLI --only p01-cover / --only p01-cover,p02-background
  const allSegments = script.segments;
  const segments = onlyIds ? allSegments.filter((s) => onlyIds.has(s.id)) : allSegments;

  if (onlyIds && segments.length === 0) {
    console.error(`❌ --only 过滤后没有匹配的 segment: ${[...onlyIds].join(', ')}`);
    console.error(`   可用 IDs: ${allSegments.map((s) => s.id).join(', ')}`);
    process.exit(1);
  }

  console.log('📢 火山引擎 TTS · 批量配音生成');
  console.log('───────────────────────────────────');
  console.log(`   API:    ${TTS_ENDPOINT}`);
  console.log(`   AppID:  ${APPID.substring(0, 4)}****`);
  console.log(`   Script: ${values.script}`);
  console.log(`   Out:    ${values.out}/`);
  console.log(`   Voice:  ${effectiveDefaultVoice}${values.voice ? ' (CLI 覆盖)' : ''}`);
  console.log(`   段数:   ${segments.length}${onlyIds ? ` / ${allSegments.length} (--only)` : ''}`);
  console.log('───────────────────────────────────\n');

  let totalChars = 0;
  let successCount = 0;
  let failCount = 0;

  for (const seg of segments) {
    const chars = [...seg.text].length;
    totalChars += chars;
    const voice = seg.voice || effectiveDefaultVoice;
    const speed = seg.speed || script.meta.defaultSpeed;

    console.log(`🎙  [${seg.id}]  Scene ${seg.scene} · ${seg.sceneName}`);
    console.log(`    "${seg.text}"`);
    console.log(`    ${chars} 字 · voice=${voice} · speed=${speed}`);

    try {
      const mp3 = await synthesize(seg.text, voice, speed);
      const outPath = new URL(`${seg.id}.mp3`, OUTPUT_DIR);
      await writeFile(outPath, mp3);
      console.log(`    ✅ ${seg.id}.mp3  ·  ${(mp3.length / 1024).toFixed(1)} KB\n`);
      successCount++;
    } catch (err) {
      console.error(`    ❌ 失败: ${err.message}\n`);
      failCount++;
    }
  }

  console.log('───────────────────────────────────');
  console.log(`📊 总计 ${totalChars} 字 · ✅ ${successCount} 成功 · ❌ ${failCount} 失败`);
  console.log(`   火山免费额度 100 万字 · 本次消耗 ${totalChars} 字`);
  console.log('───────────────────────────────────');

  if (failCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error('💥 致命错误:', err);
  process.exit(1);
});
