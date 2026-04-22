#!/usr/bin/env node
// 通义万相 wan2.6-t2i 批量生图脚本
// 用法:
//   node scripts/generate-illustrations.mjs                  # 默认跑所有 P0 优先级
//   node scripts/generate-illustrations.mjs --priority P0,P1 # 指定优先级组
//   node scripts/generate-illustrations.mjs --ids cover-hero,user-50-chronic
//   node scripts/generate-illustrations.mjs --all            # 跑全部
//   node scripts/generate-illustrations.mjs --n 2            # 每条 prompt 生 2 张（总价 x2）

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const ENDPOINT = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

// ---------- utils ----------
async function loadEnv() {
  try {
    const envText = await fs.readFile(path.join(projectRoot, '.env.local'), 'utf8');
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}

function parseArgs(argv) {
  const out = { ids: null, priority: null, all: false, n: 1, concurrency: 1, maxRetries: 4 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--all') out.all = true;
    else if (a === '--ids') out.ids = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
    else if (a === '--priority') out.priority = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
    else if (a === '--n') out.n = parseInt(argv[++i], 10) || 1;
    else if (a === '--concurrency') out.concurrency = parseInt(argv[++i], 10) || 2;
  }
  return out;
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m${s % 60}s`;
}

function timestampTag() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

// ---------- API ----------
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generateOne({ id, text, negative, size, seed, apiKey, model, maxRetries = 4, onRetry }) {
  const body = {
    model,
    input: {
      messages: [{ role: 'user', content: [{ text }] }]
    },
    parameters: {
      prompt_extend: false,
      watermark: false,
      n: 1,
      negative_prompt: negative,
      size,
      ...(seed != null ? { seed } : {})
    }
  };
  const payload = JSON.stringify(body);

  let attempt = 0;
  while (true) {
    attempt++;
    const startedAt = Date.now();
    let res, json;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: payload
      });
      json = await res.json();
    } catch (netErr) {
      if (attempt <= maxRetries) {
        const wait = 1500 * Math.pow(2, attempt - 1);
        onRetry?.({ id, attempt, reason: `network: ${netErr.message}`, wait });
        await sleep(wait);
        continue;
      }
      throw netErr;
    }
    const ms = Date.now() - startedAt;

    const isRateLimited = res.status === 429 || json?.code === 'Throttling.RateQuota' || json?.code === 'Throttling';
    const isServer5xx = res.status >= 500 && res.status < 600;

    if ((isRateLimited || isServer5xx) && attempt <= maxRetries) {
      const wait = isRateLimited
        ? 3000 * Math.pow(2, attempt - 1) + Math.random() * 800
        : 1500 * Math.pow(2, attempt - 1);
      onRetry?.({ id, attempt, reason: `${res.status} ${json?.code || ''}`, wait });
      await sleep(wait);
      continue;
    }

    if (!res.ok || json.code) {
      throw new Error(`[${id}] API error (${res.status}) code=${json?.code || 'N/A'} message=${json?.message || JSON.stringify(json).slice(0, 400)}`);
    }

    const url = json?.output?.choices?.[0]?.message?.content?.[0]?.image;
    if (!url) {
      throw new Error(`[${id}] No image in response: ${JSON.stringify(json).slice(0, 500)}`);
    }
    return { url, ms, requestId: json.request_id, size: json?.usage?.size, attempts: attempt };
  }
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buf);
  return buf.length;
}

// ---------- main ----------
async function main() {
  await loadEnv();
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    console.error('[ERR] DASHSCOPE_API_KEY not set. Put it in .env.local');
    process.exit(1);
  }

  const args = parseArgs(process.argv);
  const promptsPath = path.join(__dirname, 'illustrations', 'prompts.json');
  const cfg = JSON.parse(await fs.readFile(promptsPath, 'utf8'));
  const model = cfg.model || 'wan2.6-t2i';
  const negative = cfg.globalNegative || '';

  let tasks = cfg.prompts;
  if (args.ids && args.ids.length) {
    tasks = tasks.filter(t => args.ids.includes(t.id));
  } else if (args.priority && args.priority.length) {
    tasks = tasks.filter(t => args.priority.includes(t.priority));
  } else if (!args.all) {
    tasks = tasks.filter(t => t.priority === 'P0'); // 默认只跑 P0
  }
  if (tasks.length === 0) {
    console.error('[ERR] No prompts matched. Available:', cfg.prompts.map(p => `${p.id}(${p.priority})`).join(', '));
    process.exit(1);
  }

  const tag = timestampTag();
  const outDir = path.join(projectRoot, 'app', 'illustrations', tag);
  await fs.mkdir(outDir, { recursive: true });

  console.log(`\n== wanx illustration generator ==`);
  console.log(`model:  ${model}`);
  console.log(`output: ${path.relative(projectRoot, outDir)}`);
  console.log(`tasks:  ${tasks.length}  × n=${args.n}  (concurrency=${args.concurrency})`);
  console.log(`ids:    ${tasks.map(t => t.id).join(', ')}`);
  console.log('');

  const startedAll = Date.now();
  const results = [];
  const queue = [];
  for (const t of tasks) {
    for (let i = 0; i < args.n; i++) {
      queue.push({ task: t, variant: i });
    }
  }

  let cursor = 0;
  async function worker(workerId) {
    while (cursor < queue.length) {
      const item = queue[cursor++];
      const { task, variant } = item;
      const seed = task.seed != null ? task.seed + variant : undefined;
      const label = `${task.id}${args.n > 1 ? `-v${variant + 1}` : ''}`;
      const startedAt = Date.now();
      try {
        console.log(`[w${workerId}] ▶ ${label}  size=${task.size}  seed=${seed ?? 'random'}`);
        const r = await generateOne({
          id: label,
          text: task.text,
          negative,
          size: task.size,
          seed,
          apiKey,
          model,
          maxRetries: args.maxRetries,
          onRetry: ({ attempt, reason, wait }) =>
            console.log(`[w${workerId}] ⟳ ${label}  attempt ${attempt} failed (${reason}), retry in ${Math.round(wait)}ms`)
        });
        const dest = path.join(outDir, `${label}.png`);
        const bytes = await downloadImage(r.url, dest);
        const ms = Date.now() - startedAt;
        console.log(`[w${workerId}] ✓ ${label}  ${formatDuration(ms)}  ${(bytes / 1024 / 1024).toFixed(2)}MB  ${path.relative(projectRoot, dest)}`);
        results.push({ ok: true, id: label, usage: task.usage, file: dest, seed, ms, bytes, requestId: r.requestId });
      } catch (e) {
        console.error(`[w${workerId}] ✗ ${label}  ${e.message}`);
        results.push({ ok: false, id: label, error: e.message });
      }
    }
  }

  const workers = Array.from({ length: Math.min(args.concurrency, queue.length) }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  // manifest
  const manifest = {
    tag,
    model,
    generatedAt: new Date().toISOString(),
    totalMs: Date.now() - startedAll,
    results
  };
  await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  const ok = results.filter(r => r.ok).length;
  const fail = results.length - ok;
  console.log(`\n== done ==  ok=${ok}  fail=${fail}  total=${formatDuration(manifest.totalMs)}`);
  console.log(`manifest: ${path.relative(projectRoot, path.join(outDir, 'manifest.json'))}`);
  if (fail > 0) process.exitCode = 2;
}

main().catch(e => { console.error(e); process.exit(1); });
