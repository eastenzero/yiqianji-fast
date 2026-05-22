# 医前记 / `yiqianji-fast`

> **赛事**：4C2026 中国大学生计算机设计大赛 · 人工智能应用赛道  
> **团队**：山东第一医科大学医学信息与人工智能学院  
> **在线体验**：[yiqianji.xiaoguan.site/onboarding](https://yiqianji.xiaoguan.site/onboarding)

医前记是一个面向慢病患者**诊前场景**的 AI 辅助应用，致力于把“记录 - 整理 - 摘要 - 分享”做成医患双方都顺手的最短路径。

源码主体位于 [app/](./app/) 子目录；本 README 关注**仓库总览与本地开发入口**，产品级使用细节见 [app/README.md](./app/README.md)。

## 项目目标

- 帮助患者在就诊前快速整理分散的健康信息，降低“表达不清、遗漏重点、资料分散”的沟通成本。
- 通过 AI 将体征、症状、用药、生活方式和检查报告整理成医生可快速阅读的就诊前摘要。

## 核心能力

- 本地记录慢病相关数据：血压、血糖、症状、用药、生活习惯等。
- 用通义 VL 模型识别检查报告并自动结构化保存。
- 调用通义千问生成“就诊前摘要”，并通过二维码分享到医生端只读视图。
- 数据本地优先：所有患者数据保存在浏览器 IndexedDB，不依赖后端服务。

## 技术栈

| 范围       | 技术                                                          |
| ---------- | ------------------------------------------------------------- |
| 前端应用   | React 19、Vite 6、TypeScript、Tailwind CSS v4、React Router 7 |
| 本地数据   | Zustand、Dexie / IndexedDB                                    |
| 图表与交互 | Recharts、motion、lucide-react、qrcode.react                  |
| AI 能力    | 通义千问 OpenAI 兼容接口、通义 VL                             |

## 目录结构

```text
yiqianji-fast/
├── app/                      # 产品主体（React 应用）
│   ├── src/                  # 页面、组件、store、AI / OCR / 存储服务
│   ├── public/               # 静态资源
│   └── README.md             # 子项目详细说明
├── docs/                     # 项目设计与产品文档
└── package.json              # 根目录少量辅助依赖
```

## 运行说明

> **最快方式**：直接访问 <https://yiqianji.xiaoguan.site/onboarding>，无需任何本地配置即可体验完整产品。

如需在本地二次开发或调试源码，按以下步骤启动开发服务器。

> 需要电脑安装 **Node.js 22+** 与 **npm**（推荐用 nvm-windows / fnm 管理版本）。

1. 推荐使用 **Chrome / Edge** 浏览器运行（需支持 IndexedDB 与 ES2022）。
2. 请不要直接双击 HTML 文件，必须先在 `app/` 目录安装依赖并启动 Vite 开发服务器：

   ```powershell
   cd app
   npm install
   npm run dev
   ```

3. 浏览器打开：[http://localhost:3000](http://localhost:3000)。
4. 首次使用需配置 API Key（任选一种方式）：

   - **方式 A · 环境变量**：复制 [app/.env.example](./app/.env.example) 为 `app/.env.local`，填入 `VITE_QWEN_API_KEY`。
   - **方式 B · 应用内填写**：启动后进入“我的 → 设置与 API Key”在页面里填入，保存到浏览器 `localStorage`。

5. 平台需联网：

   - 用于调用**通义千问文本模型**生成“就诊前摘要”；
   - 用于调用**通义 VL 模型**识别检查报告（OCR）。

6. 页面说明：

   - `/onboarding`：4 步欢迎引导（首次自动跳转，已引导过则跳过）；
   - `/`：主页 —— 问候语 + AI 摘要入口 + 快捷记录 + 血压趋势迷你图；
   - `/record`：记录页 —— 切换 Tab 录入“体征 / 症状 / 用药 / 生活”；
   - `/report`：报告页 —— 拍照上传，调用通义 VL 自动 OCR 结构化；
   - `/summary`：摘要页 —— 一键生成就诊前摘要 + 二维码分享；
   - `/doctor-view/:summaryId`：医生端独立全屏视图（无底部导航）；
   - `/profile`、`/settings`：我的与设置（API Key 管理、清除数据、重看引导）。

7. 操作说明：

   - 首次启动会自动播种演示患者“王先生”+ 过去 14 天的血压、血糖、用药、症状、生活习惯演示数据；
   - 底部导航在“首页 / 记录 / 报告 / 摘要 / 我的”五大模块之间切换；
   - **记录** 页顶部 Tab 切换不同类型录入，提交后立即写入 IndexedDB；
   - **报告** 页点拍照按钮上传图片，等待几秒即可看到 AI 自动结构化的检查项；
   - **摘要** 页点击“生成摘要”调用 AI，生成后展示二维码，医生扫码进入 `/doctor-view/:summaryId` 只读视图；
   - **设置** 页可切换 API Key、清除全部本地数据、重新查看引导。

> 如需静态部署：在 `app/` 目录执行 `npm run build`，产物位于 `app/dist/`，可直接托管到 Netlify / Vercel / Nginx 等任意静态服务器。

## 常用命令

> 以下命令在 `app/` 目录下执行。

| 命令              | 说明                           |
| ----------------- | ------------------------------ |
| `npm run dev`     | 启动开发服务器                 |
| `npm run build`   | 进行 TypeScript 检查并构建前端 |
| `npm run preview` | 预览构建结果                   |
| `npm run lint`    | 仅执行 `tsc --noEmit`          |

## 代码导航

- 路由入口在 [app/src/App.tsx](./app/src/App.tsx)。
- 摘要生成业务用例位于 [app/src/services/summary.ts](./app/src/services/summary.ts)。
- AI / OCR Provider 抽象与实现位于 `app/src/services/ai/` 与 `app/src/services/ocr/`。
- 本地数据层基于 Dexie 封装 IndexedDB，业务零改动可迁回服务端（详见 [app/README.md](./app/README.md) 架构抽象节）。

## 注意事项

- **API Key 安全**：当前为纯本地化演示版，`VITE_QWEN_API_KEY` 会随前端代码进入用户浏览器；正式上线必须改为 BFF 代理调用。
- **数据存储**：所有患者数据保存在浏览器 IndexedDB，不上传服务器；清浏览器数据 = 清演示数据。
- **浏览器兼容**：需支持 IndexedDB + ES2022，Chrome / Edge / Firefox / Safari 近 2 年版本均可。
