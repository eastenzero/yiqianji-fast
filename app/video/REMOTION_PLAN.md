# 医前记 · Remotion 视频生产计划（SSoT）

> 本文件是视频生产的**单一真实来源 Single Source of Truth**。
> 所有分镜、时间轴、进度、决策、参考资料统一在此维护。
> 每完成一步请在对应 checkbox 打勾，对话 TODO 与本文件保持双向同步。

---

## 0. 项目目标

产出一支 **90 秒 · 1920×1080 · 16:9 · 无配音 · 字幕 + 温暖钢琴 BGM** 的产品 demo 视频，用于：

- 大赛答辩 / 路演开场片
- 官网 Hero 区嵌入
- B 站 / 视频号冷启动内容

## 1. 关键决策（已拍板）

| 项 | 决定 |
|---|---|
| 时长 | **90 秒** |
| 分辨率 / FPS | **1920 × 1080 · 30fps** → 2700 帧 |
| 画面比例 | **16:9 横屏**（仅此一版） |
| 叙事方式 | **无配音 + 大字幕 + BGM**（Apple 默片风格） |
| BGM 风格 | 温暖 · 轻钢琴主题 |
| 产品演示段 | **全代码重建 UI**（import 真实产品 pure component） |
| 文件组织 | **同包共存**（`app/video/` 与 `app/src/` 共享依赖） |

## 2. 时间轴（9 个 Scene · 总 2700 帧）

| # | Scene | In | Out | Dur | Frames | 核心动作 |
|---|---|---|---|---|---|---|
| 1 | Cover | 0:00 | 0:05 | 5s | 150 | Logo 淡入放大 · 竖琴 ping |
| 2 | Problem | 0:05 | 0:20 | 15s | 450 | 数字轰炸 2.45 亿 / 1.18 亿 / 3-5 分钟 + 3 张困境卡滑入 |
| 3 | Reveal | 0:20 | 0:23 | 3s | 90 | 白场淡出 → Logo + "医前记"大字 |
| 4 | ProductDemo | 0:23 | 0:43 | 20s | 600 | 手机内串演 Onboarding / Home / Record / Report / Profile |
| 5 | AiSummary | 0:43 | 0:55 | 12s | 360 | 就诊摘要打字机逐行 + "2,400+ 位医生使用"徽标 |
| 6 | Technology | 0:55 | 1:05 | 10s | 300 | 三栏小卡 + 抽象 ECG 背景 |
| 7 | Business | 1:05 | 1:17 | 12s | 360 | Y1-Y5 柱状图生长 · 用户 / 营收双轴 |
| 8 | Team | 1:17 | 1:26 | 9s | 270 | 6 圆徽 3×2 阵列 + 学校署名 |
| 9 | Ending | 1:26 | 1:30 | 4s | 120 | Slogan 大字 + Logo + 年份 |

**Total: 5+15+3+20+12+10+12+9+4 = 90s ✓** / **150+450+90+600+360+300+360+270+120 = 2700 frames ✓**

## 3. 项目结构

```
app/
├── src/                              # 现有 React 产品（原封不动）
│   └── components/pure/              # [Phase 3] 抽取的无状态组件（产品+视频共享）
├── video/                            # Remotion 视频项目
│   ├── index.ts                      # registerRoot(Root)
│   ├── Root.tsx                      # <Composition /> 注册
│   ├── Main.tsx                      # 主视频组合（串联 9 个 Scene）
│   ├── constants.ts                  # 时间轴 / 色板 / 时长
│   ├── tailwind.css                  # Tailwind v4 入口
│   ├── scenes/
│   │   ├── 01-Cover.tsx
│   │   ├── 02-Problem.tsx
│   │   ├── 03-Reveal.tsx
│   │   ├── 04-ProductDemo.tsx
│   │   ├── 05-AiSummary.tsx
│   │   ├── 06-Technology.tsx
│   │   ├── 07-Business.tsx
│   │   ├── 08-Team.tsx
│   │   └── 09-Ending.tsx
│   ├── components/
│   │   ├── Subtitle.tsx              # 底部大字幕层
│   │   ├── SceneLabel.tsx            # 调试用场景标签（渲染时开关）
│   │   ├── TextReveal.tsx            # [Phase 2] 逐字浮现
│   │   ├── NumberCounter.tsx         # [Phase 2] 数字滚动缓动
│   │   ├── PhoneFrame.tsx            # [Phase 3] iPhone 外壳
│   │   └── ChartGrow.tsx             # [Phase 3] 柱状图生长
│   ├── assets/
│   │   ├── audio/                    # BGM / 音效
│   │   └── images/                   # 静态图（暂未用）
│   └── REMOTION_PLAN.md              # 本文件
├── remotion.config.ts                # Remotion webpack + Tailwind 配置
└── package.json                      # 共享依赖
```

## 4. 技术栈

| 层 | 选型 | 版本 |
|---|---|---|
| 视频框架 | **Remotion** | 4.0.450 |
| Tailwind 集成 | **@remotion/tailwind-v4** | 4.0.450 |
| React | React | 19.0 |
| 动画 | Remotion `interpolate` + `spring` | 内置 |
| 增强动画 | motion/react | 12.23 |
| 图表 | Recharts + 自写 SVG 柱状图 | 3.8 |
| 图标 | lucide-react | 0.546 |
| BGM | （待选 · Phase 4） | - |

## 5. 进度跟踪

### Phase 0 · 环境初始化 ✅ 完成

- [x] 安装 Remotion 4.x 依赖（remotion / @remotion/cli / @remotion/tailwind-v4 / @remotion/bundler / @remotion/renderer）
- [x] 创建 `app/remotion.config.ts`（Tailwind v4 webpack override）
- [x] 创建 `app/video/` 目录结构
- [x] 在 `package.json` 加 scripts（video:studio / video:render / video:render:4k / video:still / video:bundle）
- [x] 创建 `app/video/tailwind.css` 入口（含品牌色 @theme）
- [x] 扩展 `tsconfig.json` include 到 `video` + `remotion.config.ts`
- [x] `npx tsc --noEmit` 编译 0 错误验收通过

### Phase 1 · 骨架与时间轴 ✅ 完成

- [x] 写 `constants.ts`（FPS / 分辨率 / 9 个 scene 的帧时长 / 起始帧 / COLORS 色板 / DEBUG 开关）
- [x] 写 `Root.tsx`（注册 YiqianjiMain Composition · 1920×1080 · 30fps · 2700 帧）
- [x] 写 `index.ts`（registerRoot + import tailwind.css）
- [x] 写 9 个 Scene 占位组件（01-Cover / 02-Problem / 03-Reveal / 04-ProductDemo / 05-AiSummary / 06-Technology / 07-Business / 08-Team / 09-Ending）
- [x] 写 `Main.tsx`（`<Series>` 串联 9 个 scene）
- [x] 01-Cover 已做真实动画（spring logo + 副标题淡入 + 光线扫过）
- [x] 03-Reveal 已做真实动画（白场 wipe + spring 大字）
- [x] 09-Ending 已做真实动画（slogan 淡入 + logo 延后 + 底部脉动光线）

### Phase 2 · 基础动画组件与 Studio 启动

- [x] 实现 `Subtitle.tsx`（字幕层：底部/居中/顶部 · 淡入淡出 · 上下位移 · 品牌色）
- [x] 实现 `SceneLabel.tsx`（调试：左上角场景名 + 时间码 + 可全局开关）
- [x] 实现 `TextReveal.tsx`（逐字浮现 · 按 code point 正确分中文字 · 支持 charDelay/durationFrames 双模式 · 入场 Y 位移）
- [x] 实现 `NumberCounter.tsx`（数字滚动 · ease-out 缓动 · 支持前缀/后缀/小数位/千分位）
- [x] 启动 `npm run video:studio`（Port 7777，避开 Vite 3000）· Studio 就绪 @ http://localhost:7777

### Phase 3 · 场景逐个实现

- [x] 抽取 pure components 到 `app/src/components/pure/`（Batch 1: `ProfileRing` / `BpTrendCard` / `QuickCard` · 原页面 Profile/Home 重构使用 · 产品与视频共用展示层）
- [ ] Scene 01 Cover（5s · 已有骨架动画，精修可选）
- [x] Scene 02 Problem（15s · 数字 + 困境卡）· **真实动画已实现**：2.45/1.18 亿 NumberCounter 依次滚动 + 3-5 分钟红色冲击 + 3 张困境卡 translateX 交错滑入
- [ ] Scene 03 Reveal（3s · 已有骨架动画，精修可选）
- [x] Scene 04 ProductDemo（20s · 工作量最大）· **真实动画已实现**：PhoneFrame 外壳 + 5 屏串演（Onboarding spring logo → Home 4 快捷卡 + BP 迷你图 → Record 血压 135/90 数字生长 + 键盘 → Report 30 天 SVG 面积图从左到右生长 + AVG/ALERT 汇总 → Profile 准备度 Ring 从 0 滚到 93 + 3 统计卡）· 3 段字幕切换
- [x] Scene 05 AiSummary（12s · 打字机 + 徽标）· **真实动画已实现**：摘要文档卡 spring 弹入 + 头部（患者 58 岁 / 心内科 / 2026-04-21）+ 5 段病历（主诉/现病史/既往史/用药依从性/近 7 天数据）TextReveal 逐字浮现 + 右下角 "2,400+ 位医生使用" 徽标从右滑入
- [x] Scene 06 Technology（10s · 三栏 + ECG 背景）· **真实动画已实现**：背景 30 个心跳 ECG 波（strokeDashoffset 划线）+ 12 个装饰数据节点（双圆晕染）+ 顶部 eyebrow + 三栏技术卡 translateY 弹入（primary/mint/accent 三色分配）
- [x] Scene 07 Business（12s · 柱状图生长）· **真实动画已实现**：顶部双 KPI NumberCounter + 5 根 sqrt 缩放柱子交错生长（含柱顶真实数字标签）+ 营收折线 strokeDashoffset 划出 + 5 节点 spring 弹出 + 年份 Y1-Y5 + 图例
- [x] Scene 08 Team（9s · 6 圆徽阵列）· **真实动画已实现**：3×2 圆徽阵列使用 `app/public/icons/team/` 下 6 个角色意象 PNG（compass/server/smartphone/brain/shield-check/graduation-cap） · 依次 spring 弹入（0.4s 交错） · 三色轮替（primary/mint/accent）· 底部学校署名淡入
- [ ] Scene 09 Ending（4s · Slogan + Logo · 已有骨架动画，精修可选）

### Phase 4 · 音频与精修

- [ ] 选定 BGM（温暖钢琴）并加入 Main.tsx
- [ ] 字幕节奏精修（停留时长、淡入曲线、字重对比）
- [ ] 添加关键转场音效（ping / swoosh）
- [ ] 通审 3 次，细节打磨

### Phase 5 · 渲染导出

- [ ] 导出 1920×1080 mp4（H.264 + AAC）
- [ ] 导出 3840×2160 4K 备份
- [ ] 导出封面 still（poster.jpg）
- [ ] 交付清单归档

## 6. 分镜脚本（详细）

### Scene 01 · Cover（0:00 – 0:05）

- **画面**：纯 Surface 背景 `#F6FAFC`，无噪点
- **中央**：`医前记` Lexend 字体，从 `scale(0.8) opacity(0)` 放大到 `scale(1.0) opacity(1)`，spring 缓动
- **副标题**：`Empathetic Guardian` Eyebrow Style，字号 24px，logo 稳定后淡入
- **细节**：一根 1px 极细光线从左到右扫过 logo 下方，2s 完成
- **音效**：竖琴 ping（0:00.2）

### Scene 02 · Problem（0:05 – 0:20）

> 内部分为两个子段：数字段 5-13s，卡片段 13-20s

**数字段（0:05 – 0:13）**
- 左侧：3 个大数字依次滚动（NumberCounter），每个 2.5s 停留
  - `2.45 亿` 高血压患者
  - `1.18 亿` 糖尿病患者
  - `3-5 分钟` 问诊时长
- 右侧：`医前记ui/stitch_product_ui_design/_6/` 的 editorial 插画淡入
- 字幕：`中国高血压患者 2.45 亿 / 糖尿病患者 1.18 亿 / 三甲医院平均问诊 3-5 分钟`

**卡片段（0:13 – 0:20）**
- 3 张白底圆角卡从右侧依次滑入（交错 0.4s）
  - `资料散落四方` · 图标 FolderOpen
  - `话到嘴边讲不清` · 图标 MessagesSquare
  - `3 分钟说完半年` · 图标 Clock
- 字幕：`患者带着一整年病史匆匆而去 医生听得云里雾里`

### Scene 03 · Reveal（0:20 – 0:23）

- **画面**：前景全屏白色蒙版从左到右扫过（WhiteWipe），1s 完成
- **中央**：揭示后，logo + `医前记` 大字（160px）居中弹出
- **字幕**：`医前记，改变这一切`（字号 64px）

### Scene 04 · ProductDemo（0:23 – 0:43）

- **画面**：中央 iPhone 14 Pro 外壳（自绘 rounded-[60px] + notch），内部 390×844 产品 UI
- **串演顺序**（每段约 4s · 交叉淡入淡出）：
  1. Onboarding 4 屏快速滑过（2s）
  2. Home 空态 → 数据填充（3s · 卡片逐个 spring 弹入）
  3. Record 输入血压 `135/90` + 症状 `头晕`（4s · 键盘动画 + 数字变化）
  4. Report 30 天面积图从 0 生长到满（4s · Recharts animationDuration）
  5. Profile `问诊准备度 93 分` Ring 从 0 滚到 93（3s · SVG strokeDashoffset）
- **字幕**（每段同步切换）：
  - `每日 30 秒记录`
  - `AI 自动整理`
  - `生成医生秒懂的摘要`

### Scene 05 · AiSummary（0:43 – 0:55）

- **画面**：手机从 ProductDemo 无缝放大到屏幕中央 80%
- **内容**：就诊摘要白底卡，文字**打字机逐行出现**：
  ```
  【主诉】头晕 3 天，伴头痛
  【现病史】近 30 天血压偏高，最高 152/98
  【既往史】原发性高血压 3 年
  【用药依从性】缬沙坦 90% 按时服用
  【近 7 天数据】血压均值 135/88，3 次峰值
  ```
- **右下角**：徽标 `已有 2,400+ 位医生使用` 从右滑入，2s 后淡出
- **字幕**：`一份专业摘要 让医生 30 秒掌握病史`

### Scene 06 · Technology（0:55 – 1:05）

- **背景**：抽象 ECG 波 + 数据节点，低透明度循环（参考 PPT BRIEF Prompt #4 v2）
- **前景**：三栏小卡横向展开（间距 80px）
  - `多模态时序建模` · 图标 Activity
  - `本地优先 · 端到端加密` · 图标 Shield
  - `数据一键导出` · 图标 Download
- **字幕**：`多模态 AI · 轻量化部署 · 数据完全在你手里`

### Scene 07 · Business（1:05 – 1:17）

- **画面**：Y1-Y5 双轴柱状图从 0 长到满（3s）
  - 左轴 · 用户（万）：0.5 / 5 / 20 / 50 / 100
  - 右轴 · 营收（万元）：5 / 30 / 100 / 300 / 800（折线叠加）
- **顶部 KPI 卡**：`100 万用户 · 800 万营收`（NumberCounter 滚动）
- **字幕**：`5 年服务 100 万患者 800 万营收`

### Scene 08 · Team（1:17 – 1:26）

- **画面**：6 圆徽 3×2 阵列，直径 140px，依次 spring 弹入（0.2s 交错）
  - Z W Z W Y F（创始人字母徽，参考 `app/icons/team/`）
- **中央顶部**：山东第一医科大学校徽（原图，直径 80px）
- **底部**：`山东第一医科大学 · 医学信息与人工智能学院`
- **字幕**：`来自山东第一医科大学`

### Scene 09 · Ending（1:26 – 1:30）

- **画面**：大字 `让每一次就诊都更高效`（180px，Lexend）居中
- **底部**：Logo + `医前记 · 2026`
- **过渡**：从 Team 黑场渐入，最后 0.5s 渐出

## 7. 开发命令

```bash
# 在 app/ 目录执行：
npm run video:studio         # 启动 Remotion Studio（浏览器预览）
npm run video:render         # 渲染 mp4 到 app/out/
npm run video:still          # 导出首帧 poster
npm run video:preview        # 启动 Remotion Preview（轻量）
```

## 8. 参考资料

### 必看手法学习（不抄代码，借鉴手法）

| 类型 | 项目 / 链接 | 借鉴点 |
|---|---|---|
| 官方模板骨架 | [remotion-dev/templates](https://github.com/remotion-dev/template-tailwind-v4) | Tailwind v4 集成最佳实践 |
| 产品 demo 节奏 | Raycast / Linear / Vercel launch video | 极简字幕切换、停顿节奏 |
| 数字动画 | Remotion Showcase "Build in Public" | 数字滚动缓动 |
| 动画库 | [Remotion Examples](https://www.remotion.dev/docs/examples) | interpolate + spring 组合 |
| 过渡 | @remotion/transitions | wipe / fade / slide |

### 原始资料

- `PPT_DESIGN_BRIEF.md` · 视觉 DNA + 分镜素材
- `医前记ui/stitch_product_ui_design/` · UI 设计参考
- `app/screenshots/` · 产品真实截图 29 张
- `app/icons/team/` · 团队圆徽 SVG
- `医前记商业计划书_完善版 (1)_pdf.md` · 数据与叙事素材

## 9. 风险与 Plan B

| 风险　　　　　　　　　　　　　　　　　　　　　　　　　| Plan B　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　 |
| -------------------------------------------------------| ------------------------------------------------------------------------------------------------------|
| Tailwind v4 在 Remotion 里表现有差异　　　　　　　　　| 改用 inline style，已列为备用　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　|
| 复用 `app/src/` pure component 时出现 SSR 错误　　　　| 在 scene 里重写纯展示版本　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　|
| 90 秒节奏不够讲完 9 个 scene　　　　　　　　　　　　　| 压缩 Technology / Team 时间，或延长到 100s　　　　　　　　　　　　　　　　　　　　　　　　　　　　　 |
| 渲染速度慢（Windows）　　　　　　　　　　　　　　　　 | 用 `--concurrency=8` 并行；或部署到 Remotion Lambda　　　　　　　　　　　　　　　　　　　　　　　　　|
| ~~Remotion 子包版本不一致（4.0.448/449/450 混用）~~　 | ✅ 已修复 · package.json 去 `^` pin 到 `4.0.450` + 精准升级 12 个子包 · `npx remotion versions` 验收通过 |
| npm optional deps bug（rspack native binding 未下载） | 已手动 `npm install @rspack/binding-win32-x64-msvc --save-optional` 修复　　　　　　　　　　　　　　 |

## 10. 变更日志

| 日期 | 变更 | 原因 |
|---|---|---|
| 初版 | 确立 90s / 16:9 / 无配音方案 · 9 scene 骨架 | 用户决策 |
| Checkpoint 1 | Phase 0 + Phase 1 + Phase 2 部分完成 · Studio 启动验收 | Remotion 4.0.450 环境就绪 · 9 scene 占位 + Subtitle/SceneLabel 组件到位 |
| Bug fix #1 | 删除 Cover 的占位 `<Subtitle text="" from={0} to={0} />` + 给 Subtitle 加防御式 early return（空文本 / 时长 ≤ 2×fadeFrames 时不渲染） | `interpolate inputRange must be strictly monotonically increasing but got [0,12,-12,0]` 运行时错误；用户在 Studio 看到红色报错页 |
| 知识沉淀 | `.windsurfrules` 末尾追加 Remotion 陷阱清单 + 落盘 `app/video/REMOTION_NOTES.md` field notes（含 Trap #1-3） | 用户提及 Remotion Skills；替代方案锁定本地规则+笔记 |
| Checkpoint 2 | Remotion 全部包对齐到 4.0.450 · Studio 运行中 · 开始 Phase 3 Scene 02 | 版本一致性风险消除，可以安全进入场景实现阶段 |
| Scene 02 完成 | NumberCounter 组件（ease-out）+ 2.45/1.18 亿数字滚动 + 3-5 分钟 danger 色冲击 + 3 张困境卡 translateX 交错滑入（0.5s 间隔） + 两段字幕切换 | 路线 C 第一个真实动画场景，验证组件复用模式 |
| Scene 07 完成 | 顶部 KPI 双 NumberCounter（100 万用户 / 800 万营收）+ SVG 柱状图（sqrt 缩放 · 5 根交错生长 · 柱顶标真实数字 · linearGradient 渐变）+ 营收折线（strokeDashoffset + 5 节点 spring 弹出）+ 年份滑入 + 图例 | 复用 NumberCounter · 验证 SVG 动画路线 · 为 Scene 08 Team 圆徽阵列打基础 |
| Bug fix #2 | Scene 07 柱顶标签自适应：长柱（≥80px）数字标签**内嵌白字**，短柱（Y1）保留外置蓝字 | Y5 柱顶 "100 万"（蓝）与节点 "800 万"（橙）坐标完全重叠；Y2 也有 5px 粘连。改内嵌后 Y5 相隔 60px · Y2 相隔 47px · 完全分离 |
| Scene 05 完成 | TextReveal 逐字浮现组件 + 就诊摘要文档卡（患者 + 日期 + 5 段病历：主诉/现病史/既往史/用药依从性/近 7 天数据）+ 右下角"2,400+ 位医生使用"徽标滑入 | 最后一个基础动画组件补齐 · 叙事从"手机输入"转为"医生交付物" |
| Scene 06 完成 | 30 心跳 ECG 背景 + 12 数据节点晕染 + 三栏技术卡弹入（多模态建模/本地加密/数据导出 · primary/mint/accent 三色） | 完成"技术可信度"叙事段 · 为最后 Scene 08 Team 留出渐进情绪空间 |
| 资源迁移 | 复制 `app/icons/` → `app/public/icons/`（6 个 team PNG） | Remotion 的 `staticFile()` 仅从 public 目录读取，Scene 08 Team 需要 |
| Scene 08 完成 | 3×2 团队圆徽阵列（6 成员 · 6 张角色意象 PNG · 三色轮替）· spring 交错弹入 · 顶部"医学 × AI"标题 + 底部山东一医大署名 | Phase 3 第 5 个真实动画场景 · 仅剩 Scene 04 ProductDemo（最大工作量 · 留最后）|
| Pure Components Batch 1 | 落盘 3 个 pure components（`ProfileRing` / `BpTrendCard` / `QuickCard`）到 `app/src/components/pure/` · 重构 Profile.tsx 和 Home.tsx 引用它们 · 原页面功能保持，展示层抽离 · Scene 04 里也复用思路一致的简化 UI | 路线 C 承诺的"产品与视频共用组件"基础设施 · 解耦展示与业务 · Profile 页面代码从 671 行降到约 620 行 |
| Scene 04 完成 | Scene 04 ProductDemo 落地：PhoneFrame（iPhone 14 Pro 外壳 + Dynamic Island）+ 5 屏串演（Onboarding / Home / Record / Report / Profile · 每屏 ~100-120 帧 · 16 帧 crossfade 过渡）+ 3 段字幕 · 总计 600 帧 20s | Phase 3 收官 · 9 个 scene 全部有真实动画 · 视频 MVP 可渲染 |
| Bug fix #3 | Scene 04 手机 scale 1.08→0.92 + translateY -36 + 字幕字号 56→44 | 原 scale 1.08 手机顶天立地，默认 bottom:96 字幕落在手机内；缩小上移后手机 bottom≈901 vs 字幕 top≈944 完全分离 |
| Bug fix #4 | Scene 07 折线节点标签双保险：从节点正上方（x=0,y=-26,middle）改为右上方（x=16,y=-18,start），最后一根 Y5 偏左（x=-16,end）避免出界 | 即便柱顶 labelInside 未生效（浏览器缓存），节点标签也绝不在柱顶中心上方 |
| Bug fix #5 | Scene 08 圆徽图标：从 `staticFile('icons/team/*.png')` 迁移到 lucide-react 图标（Compass/Server/Smartphone/Brain/ShieldCheck/GraduationCap）+ 阵列整体上移（-40% → -46%）+ 字幕字号 40 | PNG 通过 Studio 启动后新增的 public 目录未被识别 → 圆徽全白；lucide 图标不依赖资源加载，永远可显示 |
