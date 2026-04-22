// 修 Row 23-28 的"文件：" 和 "描述：" 两段分开
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const DOC = path.resolve('submission', 'yiqianji-2026', '03 设计与开发文档', '01-作品信息概要表.docx');

const files = [
  // [rowIdx, 文件名, 描述]
  [23, '02-作品报告.pdf', '医前记作品报告（7 章 · 含技术方案、系统实现、测试分析）'],
  [24, '03-AI工具使用说明.pdf', '7 款国产 AI 工具使用明细 + 10 张佐证截图'],
  [25, '演示视频-90秒.mp4', 'Remotion 渲染的 90 秒产品演示视频，含国产 AI 配音（豆包 TTS）与 BGM'],
  [26, 'yiqianji-app-source.zip', 'React 19 + Vite 6 + TypeScript 完整工程源代码'],
  [27, 'yiqianji-app-dist.zip', 'Vite 构建后的可部署 PWA 产物'],
  [28, 'yiqianji-video-source.zip', 'Remotion 视频工程（9 场景源代码 + 配音脚本）'],
];

const ops = [];
for (const [row, fname, desc] of files) {
  // Row 的 tc[2] 里 p[1]="文件：" p[2]="描述："
  ops.push({
    op: 'set',
    path: `/body/tbl[1]/tr[${row}]/tc[2]/p[1]`,
    props: { find: '文件：', replace: `文件：${fname}` },
  });
  ops.push({
    op: 'set',
    path: `/body/tbl[1]/tr[${row}]/tc[2]/p[2]`,
    props: { find: '描述：', replace: `描述：${desc}` },
  });
}

const json = JSON.stringify(ops);
console.log(`准备执行 ${ops.length} 个操作...`);

const result = execFileSync('officecli', ['batch', DOC, '--json'], {
  input: json,
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
});

const parsed = JSON.parse(result);
const results = parsed.results || parsed.data?.results || [];
const okCount = results.filter(r => r.success).length;
console.log(`\n✅ 成功 ${okCount} / ${results.length}`);
for (const r of results) {
  if (!r.success) console.log(`  ❌ [${r.index}] ${r.error}`);
}
