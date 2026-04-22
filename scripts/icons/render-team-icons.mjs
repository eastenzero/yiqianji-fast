#!/usr/bin/env node
// 从 Iconify 下载 Lucide SVG 图标，渲染为白色 PNG 放到 app/icons/team/
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ICONS = [
  { name: 'compass',         usage: '查烨凡 · 项目负责人（领航）' },
  { name: 'server',          usage: '王蓉 · 技术负责人（后端）' },
  { name: 'smartphone',      usage: '张双阳 · 前端开发' },
  { name: 'brain',           usage: '吴昱涵 · AI 工程师' },
  { name: 'shield-check',    usage: '杨许可 · 测试 · 隐私合规' },
  { name: 'graduation-cap',  usage: '冯敏 · 专业指导' }
];

const outDir = path.resolve('app/icons/team');
await fs.mkdir(outDir, { recursive: true });

for (const icon of ICONS) {
  const url = `https://api.iconify.design/lucide:${icon.name}.svg?color=white&width=256&height=256`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`✗ fetch ${icon.name} ${res.status}`);
    continue;
  }
  const svg = await res.text();
  const outPath = path.join(outDir, `${icon.name}.png`);
  await sharp(Buffer.from(svg), { density: 400 })
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
  const stat = await fs.stat(outPath);
  console.log(`✓ ${icon.name.padEnd(16)} ${(stat.size / 1024).toFixed(1)}KB  ${icon.usage}`);
}

console.log(`\ndone → ${outDir}`);
