// 填 03-AI工具使用说明.docx
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const DOC = path.resolve('submission', 'yiqianji-2026', '03 设计与开发文档', '03-AI工具使用说明.docx');

const tools = [
  // Row 2 · 通义千问 qwen-plus
  {
    name: '通义千问 qwen-plus（阿里云百炼，API 访问，2025年12月 – 2026年04月）',
    purpose: '生产环境核心功能：就诊摘要自动生成（将30天症状记录、体征、用药整合成医生可读的200字诊前摘要）',
    prompt: '基于患者以下30天健康数据，生成200字以内就诊前摘要，包含：主要症状变化趋势、用药依从性、异常体征、就诊建议。数据：{structured_data}',
    reply: '生成结构化中文摘要，平均180字，包含"主诉/近期变化/用药/建议"四段式结构（详见附录2序号1）',
    edit: '前端做了摘要格式化（添加段落标记、高亮关键数据），异常值提示词微调',
    ratio: '采纳率100%，生产环境核心依赖',
  },
  // Row 3 · 通义千问 VL
  {
    name: '通义千问 qwen-vl-plus（阿里云百炼，API 访问，2026年01月 – 2026年04月）',
    purpose: '生产环境：多模态OCR（识别纸质病历、化验单、药盒文字，结构化为电子档案）',
    prompt: '请识别图片中的医疗报告，提取：检查项目、数值、参考范围、异常标记、日期。返回JSON格式',
    reply: '对常见检查报告（血常规、肝功能、CT报告）识别准确率>92%，输出结构化JSON',
    edit: '前端做了JSON校验与异常容错，对OCR低置信度结果触发人工复核提示',
    ratio: '采纳率95%，生产环境核心依赖，5%识别失败通过人工复核兜底',
  },
  // Row 4 · 豆包 TTS
  {
    name: '豆包语音合成大模型（火山引擎，API 访问，2026年04月）',
    purpose: '演示视频AI配音合成（9段中文解说、男声专业播报风格，总时长90秒）',
    prompt: '九段就诊诊前场景解说词，情感：温暖专业 · 语速：中等 · 音色：男声专业播报',
    reply: '生成9段mp3音频文件，配合Remotion视频逐场景播放',
    edit: '对部分音频做了节奏微调（在Remotion中通过Sequence控制播放时机），无需二次编辑',
    ratio: '采纳率100%，演示视频AI配音全部由该模型生成',
  },
  // Row 5 · DeepSeek
  {
    name: 'DeepSeek V3.2（deepseek-chat，DeepSeek 开放平台，API+Web访问，2026年04月）',
    purpose: '开发过程：架构方案讨论、算法思路推演（PWA离线架构选型、IndexedDB数据模型、AI摘要pipeline设计）',
    prompt: '慢病管理PWA应用需支持离线数据记录+在线AI摘要生成，IndexedDB数据模型怎么设计？考虑10万条记录的查询性能',
    reply: '给出3种索引策略对比、Dexie.js使用模式建议、数据分片方案',
    edit: '结合项目实际需求（老年用户设备性能限制），选用轻量化方案并做了性能测试',
    ratio: 'AI建议采纳率约30%（作为参考，非直接代码生成）',
  },
  // Row 6 · Kimi Code
  {
    name: 'Kimi Code K2.6（月之暗面，Web UI v1.34 + CLI + VS Code 插件 + API，2026年04月）',
    purpose: '开发过程：代码辅助生成（React组件脚手架、TypeScript类型、Remotion场景动画、Dexie schema）',
    prompt: '实现Recharts折线图组件展示30天血压趋势，X轴日期Y轴两条线（收缩压/舒张压），异常点用红色加大圆点',
    reply: '生成完整React+TypeScript组件代码约120行，包含props类型、异常点渲染逻辑',
    edit: '对颜色系统（改为项目色板）、响应式尺寸、a11y标签做了人工重构',
    ratio: 'AI生成代码采纳率约50%，生成后经人工重构与测试',
  },
  // Row 7 · Trae IDE
  {
    name: 'Trae IDE（字节跳动 · 底层模型 Doubao-Seed-Code，桌面客户端，2026年04月）',
    purpose: '开发过程：AI辅助编程IDE（与AI Builder协作完成Remotion视频场景动画脚本与React UI组件）',
    prompt: '用Remotion实现9场景串联，每场景10秒，需要做缩放位移动画，BGM音量ducking',
    reply: '生成Remotion Main.tsx的Sequence结构、spring动画参数模板',
    edit: '对动画inputRange做了严格单调性修复、音频ducking做了双通道优化',
    ratio: '采纳率约40%，动画结构采纳，细节人工调优',
  },
  // Row 8 · 智谱 GLM
  {
    name: '智谱清言 GLM-4.5 / GLM-4.5v（智谱 BigModel 开放平台，API+Web，2026年04月）',
    purpose: '开发过程：文档撰写辅助（商业计划书初稿润色、README技术文档生成、PPT文案精简）',
    prompt: '根据以下产品功能清单，生成商业计划书"竞品分析"章节，不超过500字，突出差异化',
    reply: '生成结构化的竞品对比表格、差异化论点',
    edit: '基于实际产品细节做了事实校对与数据更新，删除了AI编造的不准确数据',
    ratio: '采纳率约25%，作为初稿骨架，核心内容人工撰写',
  },
];

const ops = [];
// 填表头上方的作品编号和作品名称
ops.push({ op: 'set', path: '/body/p[@paraId=19BD0303]', props: { find: '作品名称：', replace: '作品名称：医前记' } });

// 填 Row 2-8 每行 6 个 cell
for (let i = 0; i < tools.length; i++) {
  const row = i + 2;
  const t = tools[i];
  const cells = [t.name, t.purpose, t.prompt, t.reply, t.edit, t.ratio];
  for (let c = 0; c < 6; c++) {
    ops.push({
      op: 'add',
      parent: `/body/tbl[1]/tr[${row}]/tc[${c + 2}]/p[1]`,
      type: 'run',
      props: { text: cells[c], font: '仿宋' },
    });
  }
}

// 填附录 2 - 每个序号对应的佐证图
const proofMap = [
  { paraId: '5E875E06', text: '附录2序号1的佐证材料：01-阿里云百炼模型用量.png、02-阿里云账单详情.png（见 AI工具佐证/ 目录）' },
  { paraId: '4E5E823C', text: '附录2序号2的佐证材料：04-阿里云百炼模型用量.png（通义千问VL 的调用记录）' },
  { paraId: '51D0E27C', text: '附录2序号3的佐证材料：06-火山引擎订单管理.png（豆包TTS订单记录）' },
  { paraId: '0A8F541D', text: '附录2序号4的佐证材料：01-DeepSeek开放平台用量.png（951次调用，37.9M tokens，余额94.26元）' },
  { paraId: '0E0E282D', text: '附录2序号5的佐证材料：02-Kimi-Code-K2.6控制台.png、08-VSCode-KimiCode插件.png、09-Kimi-Code-CLI.png、10-Kimi-Code-WebUI.png' },
  { paraId: '53354CB1', text: '附录2序号6的佐证材料：07-Trae-IDE-DoubaoSeedCode.png（Trae IDE 与豆包Seed-Code协作截图）' },
  { paraId: '20596E07', text: '附录2序号7的佐证材料：03-智谱BigModel-GLM-4.5资源包.png（GLM-4.5 / GLM-4.5v 资源包）' },
];
for (const p of proofMap) {
  ops.push({
    op: 'set',
    path: `/body/p[@paraId=${p.paraId}]`,
    props: { find: '的佐证材料：', replace: '的佐证材料：' + p.text.split('的佐证材料：')[1] },
  });
}

const json = JSON.stringify(ops);
console.log(`准备执行 ${ops.length} 个操作...`);

const result = execFileSync('officecli', ['batch', DOC, '--json'], {
  input: json,
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
  maxBuffer: 10 * 1024 * 1024,
});

const parsed = JSON.parse(result);
const results = parsed.results || parsed.data?.results || [];
const okCount = results.filter(r => r.success).length;
console.log(`\n✅ 成功 ${okCount} / ${results.length}`);
for (const r of results) {
  if (!r.success) console.log(`  ❌ [${r.index}] ${r.error}`);
}
