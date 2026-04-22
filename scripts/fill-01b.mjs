// 续填 Row 15-28（指导教师/平台/工具/相关文件）
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const DOC = path.resolve('submission', 'yiqianji-2026', '03 设计与开发文档', '01-作品信息概要表.docx');

const ops = [
  // Row 15 指导教师作用 · 勾选 项目创意 / 理论指导 / 技术方案 / 组织协调
  { op: 'set', path: '/body/tbl[1]/tr[15]/tc[2]', props: { find: '□项目创意', replace: '■项目创意' } },
  { op: 'set', path: '/body/tbl[1]/tr[15]/tc[2]', props: { find: '□理论指导', replace: '■理论指导' } },
  { op: 'set', path: '/body/tbl[1]/tr[15]/tc[2]', props: { find: '□技术方案', replace: '■技术方案' } },
  { op: 'set', path: '/body/tbl[1]/tr[15]/tc[2]', props: { find: '□组织协调', replace: '■组织协调' } },

  // Row 16 开发制作平台 · Windows + Linux + macOS
  { op: 'set', path: '/body/tbl[1]/tr[16]/tc[2]', props: { find: '□Windows', replace: '■Windows' } },
  { op: 'set', path: '/body/tbl[1]/tr[16]/tc[2]', props: { find: '□Linux', replace: '■Linux' } },
  { op: 'set', path: '/body/tbl[1]/tr[16]/tc[2]', props: { find: '□macOS', replace: '■macOS' } },

  // Row 17 运行展示平台 · 全勾
  { op: 'set', path: '/body/tbl[1]/tr[17]/tc[2]', props: { find: '□Windows', replace: '■Windows' } },
  { op: 'set', path: '/body/tbl[1]/tr[17]/tc[2]', props: { find: '□Linux', replace: '■Linux' } },
  { op: 'set', path: '/body/tbl[1]/tr[17]/tc[2]', props: { find: '□macOS', replace: '■macOS' } },
  { op: 'set', path: '/body/tbl[1]/tr[17]/tc[2]', props: { find: '□iOS', replace: '■iOS' } },
  { op: 'set', path: '/body/tbl[1]/tr[17]/tc[2]', props: { find: '□Android', replace: '■Android' } },

  // Row 18 开发制作工具 · 加一段正文
  {
    op: 'add', parent: '/body/tbl[1]/tr[18]/tc[2]', type: 'paragraph', props: {
      text: '【开发工具】VS Code（含 Kimi Code 插件）、Trae IDE（豆包 Seed-Code）、Git + Gitee、飞书 / WPS 云文档。【前端】React 19、TypeScript 5.8、Vite 6、Tailwind CSS v4、Zustand、Dexie.js、Recharts、Lucide React、motion/react。【视频】Remotion 4.0。【后台大语言模型（均为国赛规定范围内的国产模型）】阿里云百炼通义千问 qwen-plus（摘要生成）、qwen-vl-plus（多模态 OCR）；火山引擎豆包语音合成大模型（视频配音 TTS）。',
      font: '仿宋',
    }
  },

  // Row 19 参考作品 · 无
  { op: 'set', path: '/body/tbl[1]/tr[19]/tc[2]', props: { find: '1、', replace: '1、无（本作品为原创项目，无参考作品）' } },

  // Row 20 提交内容 · 勾选 报告文档 / 演示视频 / PPT / 源代码 / 部署文件
  { op: 'set', path: '/body/tbl[1]/tr[20]/tc[2]', props: { find: '□报告文档', replace: '■报告文档' } },
  { op: 'set', path: '/body/tbl[1]/tr[20]/tc[2]', props: { find: '□演示视频', replace: '■演示视频' } },
  { op: 'set', path: '/body/tbl[1]/tr[20]/tc[2]', props: { find: '□PPT', replace: '■PPT' } },
  { op: 'set', path: '/body/tbl[1]/tr[20]/tc[2]', props: { find: '□源代码', replace: '■源代码' } },
  { op: 'set', path: '/body/tbl[1]/tr[20]/tc[2]', props: { find: '□部署文件', replace: '■部署文件' } },

  // Row 23-28 相关文件清单（6 行）· 填具体文件信息
  // Row 23 · 作品报告
  { op: 'set', path: '/body/tbl[1]/tr[23]/tc[2]', props: { find: '文件：描述：', replace: '文件：02-作品报告.pdf  描述：医前记作品报告（7 章 · 含技术方案、系统实现、测试分析等）' } },
  { op: 'set', path: '/body/tbl[1]/tr[23]/tc[3]', props: { find: '□已上传到网盘', replace: '■已上传到网盘' } },
  { op: 'set', path: '/body/tbl[1]/tr[23]/tc[4]', props: { find: '□自制', replace: '■自制' } },

  // Row 24 · AI 工具使用说明
  { op: 'set', path: '/body/tbl[1]/tr[24]/tc[2]', props: { find: '文件：描述：', replace: '文件：03-AI工具使用说明.pdf  描述：7 款国产 AI 工具使用明细 + 10 张佐证截图' } },
  { op: 'set', path: '/body/tbl[1]/tr[24]/tc[3]', props: { find: '□已上传到网盘', replace: '■已上传到网盘' } },
  { op: 'set', path: '/body/tbl[1]/tr[24]/tc[4]', props: { find: '□自制', replace: '■自制' } },

  // Row 25 · 演示视频
  { op: 'set', path: '/body/tbl[1]/tr[25]/tc[2]', props: { find: '文件：描述：', replace: '文件：演示视频-90秒.mp4  描述：Remotion 渲染的 90 秒产品演示视频，含国产 AI 配音（豆包 TTS）与 BGM' } },
  { op: 'set', path: '/body/tbl[1]/tr[25]/tc[3]', props: { find: '□已上传到网盘', replace: '■已上传到网盘' } },
  { op: 'set', path: '/body/tbl[1]/tr[25]/tc[4]', props: { find: '□自制', replace: '■自制' } },

  // Row 26 · 源代码
  { op: 'set', path: '/body/tbl[1]/tr[26]/tc[2]', props: { find: '文件：描述：', replace: '文件：yiqianji-app-source.zip  描述：React 19 + Vite 6 + TypeScript 完整工程源代码' } },
  { op: 'set', path: '/body/tbl[1]/tr[26]/tc[3]', props: { find: '□已上传到网盘', replace: '■已上传到网盘' } },
  { op: 'set', path: '/body/tbl[1]/tr[26]/tc[4]', props: { find: '□自制', replace: '■自制' } },

  // Row 27 · 部署产物
  { op: 'set', path: '/body/tbl[1]/tr[27]/tc[2]', props: { find: '文件：描述：', replace: '文件：yiqianji-app-dist.zip  描述：Vite 构建后的可部署 PWA 产物' } },
  { op: 'set', path: '/body/tbl[1]/tr[27]/tc[3]', props: { find: '□已上传到网盘', replace: '■已上传到网盘' } },
  { op: 'set', path: '/body/tbl[1]/tr[27]/tc[4]', props: { find: '□自制', replace: '■自制' } },

  // Row 28 · 视频工程源码
  { op: 'set', path: '/body/tbl[1]/tr[28]/tc[2]', props: { find: '文件：描述：', replace: '文件：yiqianji-video-source.zip  描述：Remotion 视频工程（9 场景源代码 + 配音脚本）' } },
  { op: 'set', path: '/body/tbl[1]/tr[28]/tc[3]', props: { find: '□已上传到网盘', replace: '■已上传到网盘' } },
  { op: 'set', path: '/body/tbl[1]/tr[28]/tc[4]', props: { find: '□自制', replace: '■自制' } },
];

const json = JSON.stringify(ops);
console.log(`准备执行 ${ops.length} 个操作...`);

const result = execFileSync('officecli', ['batch', DOC, '--json'], {
  input: json,
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
});

console.log('raw:', result);
const parsed = JSON.parse(result);
console.log('parsed:', JSON.stringify(parsed, null, 2).slice(0, 2000));
