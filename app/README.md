# 医前记 · Yiqianji

> 诊前信息整理与沟通辅助系统 —— **本地优先版本**

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | React 19 + Vite 6 + TypeScript |
| 样式 | Tailwind CSS v4（CSS-first 主题） |
| 路由 | React Router 7 |
| 状态 | Zustand（持久化到 localStorage） |
| 本地存储 | Dexie.js（IndexedDB 封装） |
| 动画 | motion (Framer Motion) |
| 图表 | Recharts |
| 图标 | lucide-react |
| 二维码 | qrcode.react |
| PWA | vite-plugin-pwa |
| AI | 阿里通义千问（OpenAI 兼容接口） |
| 分享短链 | Netlify Functions + Netlify Blobs |

## 目录结构

```
app/
├── src/
│   ├── pages/          # Onboarding / Home / Record / Report / Profile / Summary / DoctorView / Settings
│   ├── components/     # Layout（顶栏 + 底部导航）
│   ├── services/
│   │   ├── storage/    # IRepository 接口 + IndexedDBRepository 实现
│   │   ├── ai/         # IAIProvider 接口 + QwenProvider 实现
│   │   ├── ocr/        # IOCRProvider 接口 + QwenVLProvider 实现
│   │   ├── summary.ts  # 业务用例：生成就诊前摘要
│   │   └── seed.ts     # 演示种子数据
│   ├── stores/         # zustand 全局状态
│   ├── types/          # 领域模型
│   ├── lib/            # utils + runtime config
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── favicon.svg
├── netlify/
│   └── functions/     # 医生短链分享 API
├── package.json
├── netlify.toml       # Netlify 构建、函数与 SPA 回退配置
├── vite.config.ts
├── tsconfig.json
├── .env.example        # 环境变量示例
└── README.md
```

## 快速开始

### 1. 安装依赖

```powershell
cd app
npm install
```

### 2. 申请通义千问 API Key

访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/?apiKey=1#/api-key) 开通并创建 API Key。

### 3. 配置 Key（两种方式，选一种）

**方式 A：环境变量（推荐开发时）**

复制 `.env.example` 为 `.env.local`：

```powershell
Copy-Item .env.example .env.local
```

编辑 `.env.local`，把 `VITE_QWEN_API_KEY` 换成你的真实 Key。

**方式 B：运行后在应用内填入**

启动后点击底部导航 "我的" → "设置与 API Key"，在页面里填入 Key（保存到浏览器 localStorage）。

### 4. 启动开发服务器

```powershell
npm run dev
```

默认运行在 <http://localhost:3000>。

### 5. 生产构建

```powershell
npm run build
npm run preview
```

构建产物在 `dist/`。如果需要使用医生短链二维码，请部署到支持 `/api/share-summary` 的环境；当前默认配置为 Netlify Functions + Netlify Blobs。

## 核心演示路径

1. 首次进入 → 4 步欢迎引导
2. 自动创建种子患者"王先生"+ 过去 14 天血压 / 血糖 / 用药 / 症状 / 生活习惯演示数据
3. 首页：问候语 + AI 摘要入口 + 快捷记录 + 血压趋势迷你图
4. **记录** 页：切换 Tab 可录入"体征 / 症状 / 用药 / 生活"
5. **报告** 页：点拍照上传 → 通义 VL 模型 OCR → 自动结构化展示
6. **摘要** 页：一键调 AI 生成"就诊前摘要"→ 生成短链二维码给医生扫码查看
7. **DoctorView**：`/doctor-view/:summaryId` 独立页面，全屏展示摘要；`/s/:shareToken` 为医生短链入口
8. **设置**：切换 API Key / 清除数据 / 重看引导

## 架构抽象：未来迁回服务端的路径

纯本地化只是当前阶段。所有业务代码仅依赖以下接口：

```ts
// 数据层
IRepository<T>       // CRUD + 条件查询
Repositories         // 聚合所有领域仓储

// AI 层
IAIProvider          // 文本生成
IOCRProvider         // 多模态识别
```

**迁到服务端时**，只需新增实现：

```ts
class HttpRepository<T> implements IRepository<T> { ... }
class ServerAIProxy implements IAIProvider { ... }
```

替换 `src/services/storage/index.ts` 和 `src/services/ai/index.ts` 中的工厂函数即可，**业务页面零改动**。

## 数据安全

- 默认数据保存在浏览器 IndexedDB 中
- 用户主动点击"生成短链二维码"时，会上传本次医生视图所需的精简摘要字段到临时分享存储
- 短链分享不上传原始报告图片、完整本地数据库或 AI 原始 Markdown，有效期为 7 天
- API Key 仅存在浏览器 localStorage（配置时），调 API 时直接从浏览器 → 通义千问
- **提示：** 纯前端场景下 API Key 会被用户设备看到。生产上线前应改为 BFF 代理调用。

## 注意事项

1. **短链部署**：默认短链接口为同源 `/api/share-summary`。Netlify 部署会由 `netlify.toml` 转发到函数；非 Netlify 环境需提供等价后端，并通过 `VITE_DOCTOR_SHARE_API_BASE` 配置地址。
2. **本地开发**：纯 `vite dev` 不提供 Netlify Functions；需要完整测试短链时请使用 `netlify dev` 或部署后测试。
3. **离线兜底**：医生视图仍保留折叠的离线备用链接，可在无后端时使用，但二维码不再默认承载整份摘要。
4. **浏览器兼容**：需支持 IndexedDB + ES2022。Chrome / Edge / Firefox / Safari 近 2 年版本均可。
5. **通义千问费用**：按 token 计费，演示级调用基本可忽略（单次摘要 < 0.01 元）。可在阿里云控制台查看用量。

## 许可证

© 2026 医前记团队 · 山东第一医科大学医学信息与人工智能学院
