# 医前记 / `yiqianji-fast`

医前记是一个面向慢病患者诊前场景的 AI 辅助项目仓库，当前同时承载了三类内容：

1. `app/` 下的产品原型：纯本地化 React 应用，用于演示“记录 - 整理 - 摘要 - 分享”的完整链路。
2. `app/video/` 下的答辩视频工程：基于 Remotion 的 16:9 计赛答辩版视频与配音、字幕流水线。
3. 根目录下的比赛素材与交付脚本：商业计划书、PPT 设计资料、插画/文档处理脚本、最终提交打包目录等。

如果你只想运行产品原型，直接看 [app/README.md](/Users/Administrator/Documents/code/yiqianji-fast/app/README.md) 即可；本 README 关注整个仓库的总览和协作入口。

## 项目目标

- 帮助患者在就诊前快速整理分散的健康信息，降低“表达不清、遗漏重点、资料分散”的沟通成本。
- 通过 AI 将体征、症状、用药、生活方式和检查报告整理成医生可快速阅读的就诊前摘要。
- 以比赛交付为导向，统一管理 Web 原型、答辩视频、PPT 素材和最终提交文件。

## 核心能力

- 本地记录慢病相关数据：血压、血糖、症状、用药、生活习惯等。
- 用 OCR 识别检查报告并结构化保存。
- 调用通义千问生成“就诊前摘要”与医生端分享页。
- 通过 Remotion 生成带配音、字幕、转场和场景分镜的答辩视频。
- 用脚本辅助批量生成插画、导出字幕、处理比赛提交文档。

## 技术栈

| 范围 | 技术 |
| --- | --- |
| 前端应用 | React 19、Vite 6、TypeScript、Tailwind CSS v4、React Router 7 |
| 本地数据 | Zustand、Dexie / IndexedDB |
| 图表与交互 | Recharts、motion、lucide-react、qrcode.react |
| AI 能力 | 通义千问 OpenAI 兼容接口、通义 VL、火山引擎 TTS |
| 视频生产 | Remotion 4、Tailwind、字幕导出脚本 |
| 根目录辅助脚本 | Node.js、sharp |

## 目录结构

```text
yiqianji-fast/
├── app/                      # React 产品原型 + Remotion 视频工程
│   ├── src/                  # 应用页面、组件、store、AI/OCR/存储服务
│   ├── public/               # 静态资源、音频、PPT SVG、截图
│   ├── video/                # Remotion compositions、scene、字幕与脚本
│   ├── scripts/              # 配音生成、时长测量等脚本
│   └── README.md             # 子项目详细说明
├── docs/                     # 商业计划书、PPT 设计 brief、参考截图
├── scripts/                  # 根目录辅助脚本（插画生成、文档填充等）
├── preview/                  # 预览与中间产物
├── yiqianji-2026/            # 比赛交付打包目录
├── export-subtitles.mjs      # 从 voice-script-v2.json 导出 SRT / VTT
├── PLAN.md                   # 项目与答辩材料制作计划
└── package.json              # 根目录少量辅助依赖
```

## 环境要求

- 建议使用 Node.js 22 或更高版本。
- 前端与视频依赖安装在 `app/` 下。
- 根目录脚本单独依赖根目录 `package.json`。

## 快速开始

### 1. 安装依赖

```powershell
npm install
cd app
npm install
```

### 2. 配置环境变量

复制 [app/.env.example](/Users/Administrator/Documents/code/yiqianji-fast/app/.env.example) 为 `app/.env.local`，至少按需填写以下变量：

- `VITE_QWEN_API_KEY`：前端摘要生成与 OCR 使用。
- `VOLCENGINE_APPID`
- `VOLCENGINE_ACCESS_TOKEN`
- `VOLCENGINE_CLUSTER`

如果要运行根目录插画脚本，还需要在根目录 `.env.local` 中提供：

- `DASHSCOPE_API_KEY`

### 3. 启动产品原型

```powershell
cd app
npm run dev
```

默认地址为 [http://localhost:3000](http://localhost:3000)。

## 常用命令

### `app/` 产品与视频

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动产品原型开发服务器 |
| `npm run build` | 进行 TypeScript 检查并构建前端 |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | 仅执行 `tsc --noEmit` |
| `npm run video:studio` | 打开 Remotion Studio |
| `npm run video:render:v2` | 渲染新版配音答辩视频 |
| `npm run video:render:v2:novoice` | 渲染新版无配音答辩视频 |
| `npm run video:still:v2` | 导出新版海报帧 |
| `npm run voice:generate:v2` | 按 `video/voice-script-v2.json` 批量生成配音 |
| `npm run voice:durations:v2` | 统计配音时长 |
| `npm run voice:subtitles:preview:v2` | 预览字幕 cue 切分 |

### 根目录辅助脚本

| 命令 | 说明 |
| --- | --- |
| `node export-subtitles.mjs` | 导出 `app/video/subtitles.srt` 与 `app/video/subtitles.vtt` |
| `node scripts/generate-illustrations.mjs --priority P0` | 批量生成高优插画 |
| `node scripts/fill-01.mjs` | 填充比赛文档中的作品信息概要表 |

## 主要工作流

### 产品原型

- 路由入口在 [app/src/App.tsx](/Users/Administrator/Documents/code/yiqianji-fast/app/src/App.tsx)。
- 数据默认落在浏览器 IndexedDB，本地优先，不依赖服务端。
- 摘要生成逻辑位于 [app/src/services/summary.ts](/Users/Administrator/Documents/code/yiqianji-fast/app/src/services/summary.ts)。

### 答辩视频

- Remotion 注册入口在 [app/video/Root.tsx](/Users/Administrator/Documents/code/yiqianji-fast/app/video/Root.tsx)。
- 当前主版本 composition 为 `YiqianjiV2`，另保留无配音与静音预览版本。
- 分镜、进度和制作规范见 [app/video/REMOTION_V2_PLAN.md](/Users/Administrator/Documents/code/yiqianji-fast/app/video/REMOTION_V2_PLAN.md)。

### 比赛资料与交付

- [PLAN.md](/Users/Administrator/Documents/code/yiqianji-fast/PLAN.md) 记录了答辩材料的整体制作计划。
- `docs/` 保存商业计划书、PPT 设计 brief 和参考截图。
- `yiqianji-2026/` 用于整理最终提交文件。

## 产物说明

- `app/dist/`：前端构建结果。
- `app/out/`：Remotion 渲染输出。
- `app/public/audio/voice-v2/`：批量生成的新版配音文件。
- `app/video/subtitles.srt` / `app/video/subtitles.vtt`：导出的标准字幕文件。
- `yiqianji-2026.zip`、`app/dist.zip` 等：本地打包产物。

## 注意事项

- 当前仓库包含大量比赛素材和本地产物，体积较大，不适合作为“纯净模板仓库”直接复用。
- 前端版本是“纯本地化演示版”，API Key 会出现在用户设备环境中；正式上线应改为服务端代理。
- 根目录 `.gitignore` 已忽略部分大型输出目录，但历史上已追踪的文件可能仍存在于仓库中。

## 参考文档

- [app/README.md](/Users/Administrator/Documents/code/yiqianji-fast/app/README.md)
- [PLAN.md](/Users/Administrator/Documents/code/yiqianji-fast/PLAN.md)
- [docs/PPT_DESIGN_BRIEF.md](/Users/Administrator/Documents/code/yiqianji-fast/docs/PPT_DESIGN_BRIEF.md)
- [app/video/REMOTION_V2_PLAN.md](/Users/Administrator/Documents/code/yiqianji-fast/app/video/REMOTION_V2_PLAN.md)
