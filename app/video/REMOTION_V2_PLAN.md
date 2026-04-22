# 医前记 · Remotion V2 生产计划（SSoT · 计赛答辩版）

> 本文件是新版视频生产的**单一真实来源 Single Source of Truth**。
> 每完成一项请打勾 `[x]`。对话 todo list 与本文件保持双向同步。
>
> **旧版计划** `REMOTION_PLAN.md` 保持原样作为历史参考，不要删除。

---

## 0. 背景与理念

### 0.1 为什么要做 V2

旧版 90s 视频偏**商业路演**风格（大创气质），不符合**计算机设计大赛**对"项目本身演示"的核心诉求。
V2 重构目标：**以 PPT 叙事骨架为主 + 穿插实机演示 + 多层动效烘托**。

### 0.2 关键决策（2026-04-22 讨论拍板）

| 项 | 决定 |
|---|---|
| 目标时长 | **7-8 分钟**（6-10 区间内中位） |
| 分辨率 / FPS | **1920 × 1080 · 30fps** |
| 画面比例 | 16:9 横屏 |
| 叙事骨架 | **9 页 PPT SVG + 3 段穿插演示** |
| 配音 | **TTS 配音版**（主） + **无配音版**（副）· 两版都交付 |
| TTS 供应商 | 豆包 / 通义（复用现有 `scripts/generate-voice.mjs`） |
| BGM | 温暖钢琴（沿用 `bathed-in-the-light.mp3` 或另选） |
| 动效方针 | **4 层叠加**（环境 / 进场 / 强调 / 转场），主体不被抢戏 |

### 0.3 设计 DNA（与 PPT 对齐）

- **品牌色**：`#006485` 主 · `#2C7DA0` 辅 · `#F7A072` 强调 · `#F6FAFC` 底 · `#0B3446` 深
- **字体**：PingFang SC / Microsoft YaHei · Lexend（数字）
- **调性**：专业医疗 + 温度 · 无花哨渐变 · 无 emoji · 无 3D 图表

### 0.4 金句库（反复在画面强化）

- **一句话**：30 秒记录 · AI 整理 · 医生秒懂
- **核心主张**：辅助医生而不替代医生
- **愿景**：让每一次就诊都有充分的准备
- **技术标签**：多模态时序建模 · 轻量化 AI · 本地优先

---

## 1. 动效分层原则（贯穿全片）

### Layer 1 · 环境背景层（整片常驻 · 强度极低）

| 效果 | 实现 |
|---|---|
| 品牌色渐变 mesh | SVG `radialGradient` · 缓慢 rotate/shift |
| 浮动光斑 / 粒子 | 12-20 个半透明圆 · 不同速度漂浮 |
| ECG 波纹（品牌暗号） | 底部长条 · 极淡 · 偶尔划过 |
| 微噪点纹理 | 叠加 `feTurbulence` filter（可选） |

### Layer 2 · 主体进场层（每页 / 每段触发）

| 效果 | 应用场景 |
|---|---|
| SVG 整体淡入 + 轻微 scale-up（0.98→1.0） | 每张 PPT 切入 |
| 数字 NumberCounter 滚动 | P02 的 2.45 亿 / 1.18 亿 |
| 文字逐字 TextReveal | 标题 / slogan / 金句 |
| 卡片交错 translateY + fade | P04 四卡 / P07 三栏 |
| Ken Burns（scale 1.0→1.15 + 平移） | 所有演示段的截图 |

### Layer 3 · 强调高亮层（精准时刻触发）

| 效果 | 应用场景 |
|---|---|
| 关键数字脉冲光晕 | P02 "3-5 分钟" 红色脉冲 |
| 触摸热区 ripple（圆形水波） | 演示段"用户点击"时刻 |
| 扫光（光束斜向扫过） | P03 Before→After 揭示 |
| 箭头 / 连线 `strokeDashoffset` 划出 | P04 流程 / P08 同心圆 |
| 徽章弹入 + 微 shake | "首创" / "2400+ 医生" |

### Layer 4 · 转场层（页间过渡）

| 效果 | 触发 |
|---|---|
| 镜头推拉（scale-out → scale-in） | 常规页切换 |
| 白场 wipe | P03 揭示性转场 |
| 手机外壳入场 | 穿插演示前 |
| 屏幕翻页 | 演示段内部屏切换 |

---

## 2. 时间轴（12 段 · 总时长 ~7:45）

| # | Section | Type | Dur | In | Out | 核心动作 |
|---|---|---|---|---|---|---|
| 1 | P01 封面 | PPT | 15s | 0:00 | 0:15 | SVG 淡入 + 标题 glow + ECG 入场 |
| 2 | P02 项目背景 | PPT | 50s | 0:15 | 1:05 | 数字 NumberCounter + 痛点卡交错滑入 + "3-5 分钟"红脉冲 |
| 3 | P03 产品定位 | PPT | 25s | 1:05 | 1:30 | Before 左侧滑入 → 白场 wipe → After 右侧滑入 |
| 4 | **Demo 1 · 记录流程** | DEMO | 55s | 1:30 | 2:25 | 手机外壳入场 → Home → 点击"测体征"ripple → Record 屏 → 数字录入 → OCR 模拟 |
| 5 | P04 核心功能 | PPT | 35s | 2:25 | 3:00 | 四卡依次弹入 + chevron 流程箭头 strokeDashoffset |
| 6 | P05 记录与整理 | PPT | 25s | 3:00 | 3:25 | 双手机对比 + 关键标签（30 秒 / OCR / 时间轴）浮现 |
| 7 | **Demo 2 · AI 摘要生成** | DEMO | 60s | 3:25 | 4:25 | Home → 点击"生成摘要" ripple → Loading → 摘要卡打字机逐段 |
| 8 | P06 AI 摘要分享 | PPT | 30s | 4:25 | 4:55 | 结构化摘要 + QR 码脉冲 + "30 秒读完" 大字 |
| 9 | **Demo 3 · 医生端扫码** | DEMO | 40s | 4:55 | 5:35 | QR 放大 → 扫码动画 → 医生端页面切入 → Ken Burns |
| 10 | P07 技术架构 | PPT | 45s | 5:35 | 6:20 | 4 层架构叠楼 + 6 AI chip 墙滑入 |
| 11 | P08 安全与创新 | PPT | 45s | 6:20 | 7:05 | 同心圆四层防御 `strokeDashoffset` + 4 首创徽章弹入 |
| 12 | P09 团队与展望 | PPT | 35s | 7:05 | 7:40 | 六人名字依次浮现 + slogan "让每一次就诊都有充分的准备" |

**Total: ~7:40 = 460s = 13800 frames @ 30fps**

> ⚠️ 以上时长为初始估算，会在 Phase 4 TTS 生成后按实际配音时长反推调整。

---

## 3. 项目结构调整

```
app/video/
├── index.ts                          # registerRoot(Root)
├── Root.tsx                          # 注册 2 个 Composition（WithVoice / NoVoice）
├── MainV2.tsx                        # 新版主组合（12 段）
├── MainV2NoVoice.tsx                 # 无配音版（去除 voice 层）
├── constants.ts                      # 扩展 V2 时间轴
├── voice-script-v2.json              # 新配音脚本（Phase 4 产出）
├── tailwind.css                      # 保持
├── scenes/
│   ├── _archive/                     # 【新】旧 9 个 scene 归档此处
│   │   ├── 01-Cover.tsx
│   │   └── ...
│   └── v2/                           # 【新】新版 12 个 scene
│       ├── P01-Cover.tsx
│       ├── P02-Background.tsx
│       ├── P03-Positioning.tsx
│       ├── D1-RecordFlow.tsx
│       ├── P04-Features.tsx
│       ├── P05-RecordOrganize.tsx
│       ├── D2-AiSummary.tsx
│       ├── P06-SharingSummary.tsx
│       ├── D3-DoctorScan.tsx
│       ├── P07-Architecture.tsx
│       ├── P08-Security.tsx
│       └── P09-Team.tsx
├── components/
│   ├── Subtitle.tsx                  # [旧] 保留
│   ├── SceneLabel.tsx                # [旧] 保留
│   ├── TextReveal.tsx                # [旧] 保留
│   ├── NumberCounter.tsx             # [旧] 保留
│   ├── PhoneFrame.tsx                # [旧] 保留
│   ├── AmbientBackground.tsx         # 【新】Layer 1 环境背景
│   ├── KenBurns.tsx                  # 【新】图片缩放平移
│   ├── TouchRipple.tsx               # 【新】手势水波
│   ├── Highlight.tsx                 # 【新】脉冲/光晕强调
│   ├── Sweep.tsx                     # 【新】扫光效果
│   └── SceneTransition.tsx           # 【新】页间推拉转场
├── REMOTION_NOTES.md                 # 踩坑清单（持续维护）
├── REMOTION_PLAN.md                  # 【旧】V1 计划（保留）
└── REMOTION_V2_PLAN.md               # 【本文件】V2 SSoT
```

**静态资源新位置**：

```
app/public/
├── ppt/                              # 【新】9 张 PPT SVG
│   ├── 01_封面.svg
│   └── ...
├── screenshots/                      # 【新】产品截图 · 从 app/screenshots/ 复制或软链
│   ├── phone/
│   ├── component/
│   └── hero/
└── audio/                            # 现有
    ├── bgm.mp3
    └── voice-v2/                     # 【新】V2 配音片段
        ├── 01.mp3
        └── ...
```

---

## 4. 进度跟踪

### Phase 0 · 准备与归档 ✅ 完成

- [x] 0.1 归档旧 scenes（`app/video/scenes/*.tsx` → `scenes/_archive/` · 内部 import 同步改为 `../../`）
- [x] 0.2 创建 `app/video/scenes/v2/` 目录 + 12 段 Scene 占位 + `_PlaceholderScene.tsx`
- [x] 0.3 把 9 张 SVG 复制到 `app/public/ppt/`（最大 03_产品定位.svg 2.6MB · 含 base64 内嵌图）
- [x] 0.4 把 29 张产品截图复制到 `app/public/screenshots/`（phone 12 + component 14 + hero 3）
- [x] 0.5 扩展 `constants.ts`：新增 `V2_SCENE_DURATIONS` / `V2_TOTAL_FRAMES` / `V2_SCENE_START_FRAMES` / 双版本 BGM 音量
- [x] 0.6 `Root.tsx` 新增两个 Composition（`YiqianjiV2` / `YiqianjiV2NoVoice`）+ `MainV2.tsx` 双版本导出
- [x] 0.7 `npx tsc --noEmit` 编译 0 错误通过

### Phase 1 · 6 个新通用组件 ✅ 完成

- [x] 1.1 `AmbientBackground.tsx`（渐变 mesh + 浮动光斑 + ECG 波纹 · `intensity` / `variant` / `accent` / `seed` / `particleCount`）
- [x] 1.2 `KenBurns.tsx`（图片 scale+translate + fade · 支持 easeInOut/easeOut 缓动 · from/to 状态插值）
- [x] 1.3 `TouchRipple.tsx`（双层 ring + 中心点 · 模拟 iOS 真实点击感 · `triggerFrame` / `maxRadius` / `doubleRing`）
- [x] 1.4 `Highlight.tsx`（双层 box-shadow 开晕 · 脉冲/静态两种模式 · `pulseCount` / `retainAfter`）
- [x] 1.5 `Sweep.tsx`（ltr/rtl/ttb/btt/diagonal 5 方向 · linear-gradient 柔和光束 · `blendMode` 可选）
- [x] 1.6 `SceneTransition.tsx`（zoom / push-left/right/up/down / fade / none · enter/exit 可分别配置）
- [x] 1.7 4 个旧组件复用性检查：Subtitle (✅无修改) / TextReveal (✅无修改) / NumberCounter (✅无修改) / PhoneFrame (✅无修改)

### Phase 2 · 9 个 PPT 页 Scene ✅ 完成

- [x] 2.1 P01 封面（15s · 黑场淡入 + SVG KenBurns 缓慢推近 + 对角线 Sweep + 右下角 4C 2026 徽章 + SceneTransition 出入场）
- [x] 2.2 P02 项目背景（50s · 3 痛点卡依次脉冲「3 分钟 RED」+ KPI 条 + 2 单数字 + 2 次 Sweep）
- [x] 2.3 P03 产品定位（25s · BEFORE/AI/AFTER pill 依次 + AI 变换 ltr Sweep + 3 合规 tag + push-left 出场）
- [x] 2.4 P04 核心功能（35s · 4 功能卡（AI 橙色 3 次 hero）+ Chevron 首尾 2 次 Sweep）
- [x] 2.5 P05 记录与整理（25s · 左侧手机区 Sweep + 4 要点卡（OCR/时间轴重点）+ 底部 4 录入模式 tag 快速连续）
- [x] 2.6 P06 AI 摘要与医生端（30s · 左侧 TTB Sweep + 4 feature（AI 生成橙色 hero）+ Share flow 三段（QR 橙色 3 次）+ diagonal Sweep）
- [x] 2.7 P07 技术架构（45s · ink variant + 4 层架构由下到上依次脉冲（AI 层橙色 3 次）+ btt Sweep）
- [x] 2.8 P08 安全与创新（45s · 左栏 4 层防御由内向外（L3 合规橙 3 次）+ 右栏 4 创新（首创橙 3 次）+ ltr Sweep）
- [x] 2.9 P09 团队与展望（35s · mist variant + 6 成员三色依次 + 指导教师 + 学校署名 Sweep + Vision 大字 slogan 橙色 3 次 retainAfter）

### Phase 3 · 3 段穿插演示 ✅ 完成（初版 · 基于截图）

- [x] 3.1 Demo 1 · 记录流程（55s · 手机从右滑入 + Home→Record→Summary 三屏截图切换 + 3 次 TouchRipple + 左右浮动 3 Step 说明）
- [x] 3.2 Demo 2 · AI 摘要生成（60s · 手机从左入 + Home→Loading→Summary 截图 + 自制 Loading spinner + 5 段右侧滚动注释 + 底部金句 TextReveal）
- [x] 3.3 Demo 3 · 医生端扫码（40s · split 左手机 + 中间伪 QR（三角 finder + 随机格）+ 扫描线 + 成功闪绿 + 右侧 Safari mockup 摘要卡 + slogan TextReveal）

### Phase 3.5 · 演示段真实化改造 ✅ 完成（编译验证 · 待 Studio 验收）

> **背景**：用户反馈 Phase 3 初版直接用 png 截图 + KenBurns 平移，感觉太"廉价"——点击没反馈、
> 输入没实感、生成过程全靠转圈。**决定改用真实 app 代码（抽取到 pure components 里）**，
> 让 D1/D2/D3 渲染出真实的 Home/Record/Summary/DoctorView 页面，并用帧驱动真实 state 变化。
>
> **关键约束**（`.windsurfrules` 强制）：
>   - 避免 `react-router-dom`（Remotion 渲染无浏览器路由）
>   - 避免 `dexie` / `useLiveQuery`（IndexedDB 在 headless Chrome 受限）
>   - 真正展示层抽到 `app/src/components/pure/` 下的无状态组件，product + video 共用
>
> **技术决策记录**：Remotion 1920 视口会错误触发 `md:` / `lg:` 媒体查询，
> 导致手机 408 画布里出现桌面布局。解决方案：pure 组件加 `forceMobile` 开关，
> 视频场景传 `true` 剥离桌面样式，真实 app 默认 `false` 保持自适应。

- [x] 3.5.1 `app/video/tailwind.css` 扩展：把 `app/src/index.css` 的 @theme 完整同步（primary/secondary/surface-container/error/outline/font-headline 等 token）+ `.bg-gradient-medical` / `.editorial-shadow` / `.hide-scrollbar` 工具类；保留旧 brand-* tokens 兼容 _archive 场景
- [x] 3.5.2 新增 `HomeView.tsx`（pure 抽取自 `pages/Home.tsx` · 无 Link/store/dexie）+ `forceMobile` prop 剥离 md:/lg: 类
- [x] 3.5.3 新增 `RecordVitalView.tsx`（pure 抽取自 `pages/Record.tsx` 的 VitalTab）· 4 Tab + kind 选择 + 血压 / 单值输入 + 保存按钮 + 最近记录列表
- [x] 3.5.4 新增 `SummaryCardView.tsx`（pure · Summary + DoctorView 共用 · variant='patient'/'doctor'）· 支持 `revealedSections` 控制分节浮入
- [x] 3.5.4a BpTrendCard 加 `forceMobile` prop 剥离 md: 类
- [x] 3.5.5 重写 **D1 记录流程**：真实 HomeView（13 天 · BP 正常）→ 点击"测体征" ripple → RecordVitalView（systolic 打字 135 · diastolic 打字 90 · saving 状态）→ 点击"保存"ripple → 回 HomeView（14 天 · BP_TREND 新增 135 触发 BP ALERT 形态）· 帧驱动垂直滚动
- [x] 3.5.6 重写 **D2 AI 摘要生成**：真实 HomeView（14 天 BP ALERT）→ 点击 Summary 卡 ripple → Loading 屏（进度条 0→100% · spinner 转动）→ 真实 SummaryCardView 分节浮入（chiefComplaint → focusPoints → symptoms → vitalsTrend → medications → lifestyle · 6 段）+ 5 段右侧 Step 注释滚动
- [x] 3.5.7 重写 **D3 医生端扫码**：左侧 PhoneFrame 内真实 SummaryCardView(patient) → QR 弹出 + 扫描线 + 成功闪绿 → 右侧 Safari mockup 内真实 SummaryCardView(doctor 变体 · 同一 PATIENT_SUMMARY 数据) · 剧情连贯
- [x] 3.5.8 `npx tsc --noEmit` 编译 0 错误
- [ ] 3.5.9 Studio 预览验证 D1/D2/D3 三段真实感 · **待用户验收**

### Phase 4 · 配音与音效 🔄 进行中

- [x] 4.1 基于 `notes/total.md` 精炼为 12 段视频脚本 · 产出 `voice-script-v2.json` · 总 1302 字 · 对应 12 个场景的 startFrame
- [x] 4.2 选定 TTS 音色 · 火山引擎豆包大模型 · `zh_female_xiaohe_uranus_bigtts`（小何 · 女声 · 清爽年轻 · 面对评委 V2 首选）· 语速 1.0
- [x] 4.3 扩展 `generate-voice.mjs` 支持 `--script` / `--out` 参数 + 新增 `npm run voice:generate:v2` + 12 段 mp3 全部生成成功到 `app/public/audio/voice-v2/`（1302 字 · 火山免费额度剩 998,698 字）
- [x] 4.3a 更新 `MainV2.tsx` · 从 `voice-script-v2.json` import + 每段用 `<Sequence from={startFrame}>` 包 `<Audio>` · 配音/无配音双版本共用 segments
- [ ] 4.4 **Studio 预览对齐时间轴** · 听实际 TTS 时长 · 可能需要调整个别 startFrame 或 scene 时长（配音节奏调整）
- [x] 4.5 BGM 沿用 `bathed-in-the-light.mp3` · 音量曲线已在 constants.ts 定义（配音版 0.18，无配音版 0.42）
- [ ] 4.6 （可选）转场音效（ping / swoosh / 扫码声 · 3-5 个）· 优先级低 · 等时间轴锁定后再考虑

### Phase 5 · 主组装与渲染

- [x] 5.1 `MainV2.tsx` · `<Series>` 串联 12 段 + BGM + 配音 `<Sequence>` 层（Phase 0.6 + 4.3a 完成）
- [x] 5.2 `MainV2NoVoice` 作为 MainV2Body 的 `withVoice=false` 变体（共享场景 · 只切音频层）
- [ ] 5.3 Studio 完整预览 · 通审 3 次 · 节奏 / 字幕 / 色彩校对 · **等 Phase 4.4 时间轴锁定后**
- [ ] 5.4 渲染配音版 mp4（`npm run video:render:v2`）
- [ ] 5.5 渲染无配音版 mp4（`npm run video:render:v2:novoice`）
- [ ] 5.6 （可选）4K 备份 3840×2160
- [ ] 5.7 封面 still.jpg 导出（`npm run video:still:v2`）

### Phase 6 · 交付

- [ ] 6.1 把两版 mp4 放到 `submission/yiqianji-2026/04 作品演示视频/`
- [ ] 6.2 更新 `submission/README.md` 标注两版区别与推荐场景
- [ ] 6.3 让组员试看两版 · A/B 决定最终提交版
- [ ] 6.4 归档 Remotion 源码 zip（`yiqianji-video-v2-source.zip`）

---

## 5. 旧版资产去留决策

| 资产 | 决策 |
|---|---|
| `scenes/01-09` 9 个旧 scene | **归档到 `_archive/`**，不删除（Phase 0.1） |
| `Main.tsx` | **保留**，用于渲染旧版本 / 对比参考 |
| `Root.tsx` | **扩展**，新增两个 Composition，不删除旧 `YiqianjiMain` |
| `voice-script.json` | **保留**作为脚本写法参考 |
| `constants.ts` | **扩展**，旧常量保留，新增 V2 常量 |
| `REMOTION_PLAN.md` | **保留**作为历史记录 |

---

## 6. 风险与待澄清

| 风险 | 缓解 |
|---|---|
| SVG 内嵌 base64 图片导致文件体积大 / 渲染慢 | 先测 1-2 张；若慢，把 base64 抽出为独立 png |
| PPT SVG 字体在 Remotion Chrome 里可能不完全渲染 | 确保 PingFang SC / Microsoft YaHei 字体可用；必要时 Web 字体兜底 |
| TTS 节奏与动画错位 | Phase 4 结束后留 1 天窗口调时间轴 |
| 8 分钟渲染耗时 | 先用 Studio 单帧调，不频繁 full render |
| 配音版和无配音版脱节 | `MainV2` 和 `MainV2NoVoice` 共用底层 Series，只差 voice 层开关 |

---

## 7. 变更日志

| 日期 | 变更 |
|---|---|
| 2026-04-22 | 初版创建 · 基于新版答辩 PPT（`yiqianji-defense_ppt169_20260422`）+ 4 层动效分层原则 |
