// 一次性填入 01-作品信息概要表.docx
// 用法：node scripts/fill-01.mjs
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const DOC = path.resolve('submission', 'yiqianji-2026', '03 设计与开发文档', '01-作品信息概要表.docx');

const ops = [
  // 1. 填作品名称（tr[1]/tc[4] 空 cell）
  { op: 'add', parent: '/body/tbl[1]/tr[1]/tc[4]/p[1]', type: 'run', props: { text: '医前记', font: '仿宋' } },

  // 2. 作品简介（tr[3]/tc[1] · 在"作品简介(100字以内)："的段落后添加新段落）
  { op: 'add', parent: '/body/tbl[1]/tr[3]/tc[1]', type: 'paragraph', props: {
    text: '医前记是一款聚焦慢病人群诊前场景的 AI 辅助应用。通过多模态 OCR 识别纸质病历、检查报告、药盒，自动结构化为电子健康档案；利用通义千问大模型生成就诊"3 分钟速读摘要"供医患快速对齐病情；内置血压/血糖趋势分析、用药提醒、问诊建议清单等功能，帮助老年慢病患者破解"就诊前表达不清、就诊时遗漏关键信息"的沟通痛点。产品采用 PWA 架构免安装访问，数据默认本地加密存储，端到端保护患者隐私。',
    font: '仿宋',
  } },

  // 3. 创新描述（tr[4]）
  { op: 'add', parent: '/body/tbl[1]/tr[4]/tc[1]', type: 'paragraph', props: {
    text: '1. 诊前场景首创：针对"诊前 3 分钟"医患对齐场景，把分散的病历、药盒、体征记录融合为医生秒读的摘要卡。2. 端侧 PWA + 全国产 AI：采用通义千问多模态 + 豆包 TTS，数据 IndexedDB 本地存储，隐私合规双保障。',
    font: '仿宋',
  } },

  // 4. 特别说明（tr[5]）
  { op: 'add', parent: '/body/tbl[1]/tr[5]/tc[1]', type: 'paragraph', props: {
    text: '本作品从零原创，无前期基础；不含地图素材；开发过程使用的国产 AI 辅助工具（通义灵码、Kimi Code、DeepSeek、智谱 GLM、Trae-豆包）及其占比已在《AI 工具使用说明》详细列出，核心产品代码约 40% 由 AI 辅助生成，均经人工重构、测试验证与代码审查。另有团队成员刘新奥参与产品调研与文档整理工作。',
    font: '仿宋',
  } },
];

// 分工百分比 · 7 行 × 5 人 · Row 8-14
// 查烨凡=tc[2] 王蓉=tc[3] 张双阳=tc[4] 吴昱涵=tc[5] 杨许可=tc[6]
const shares = [
  // [row, 查烨凡, 王蓉, 张双阳, 吴昱涵, 杨许可]
  [8,  '50%', '20%', '10%', '10%', '10%'],  // 组织协调
  [9,  '35%', '20%', '15%', '20%', '10%'],  // 作品创意
  [10, '40%', '10%', '10%', '10%', '30%'],  // 竞品分析
  [11, '25%', '30%', '15%', '25%', '5%'],   // 方案设计
  [12, '10%', '35%', '25%', '25%', '5%'],   // 技术实现
  [13, '25%', '15%', '15%', '20%', '25%'],  // 文献阅读
  [14, '15%', '15%', '10%', '10%', '50%'],  // 测试分析
];

for (const [row, ...percents] of shares) {
  for (let i = 0; i < 5; i++) {
    // find "%" in cell, replace with "50%"; 只替换第一个 % 避免污染（每 cell 只有一个 %）
    ops.push({
      op: 'set',
      path: `/body/tbl[1]/tr[${row}]/tc[${i + 2}]`,
      props: { find: '%', replace: percents[i] },
    });
  }
}

// 用 stdin 传 JSON 给 officecli batch
const json = JSON.stringify(ops);
console.log(`准备执行 ${ops.length} 个操作...`);

const result = execFileSync('officecli', ['batch', DOC, '--json'], {
  input: json,
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
});

const parsed = JSON.parse(result);
console.log(`\n执行结果：`);
if (parsed.success) {
  const okCount = parsed.data.results.filter(r => r.success).length;
  console.log(`✅ 成功 ${okCount} / ${parsed.data.results.length}`);
  for (const r of parsed.data.results) {
    if (!r.success) console.log(`  ❌ [${r.index}] ${r.error}`);
  }
} else {
  console.log(`❌ Batch 整体失败:`, parsed);
}
