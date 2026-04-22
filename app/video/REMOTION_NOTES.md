# Remotion Field Notes · 踩坑实录

> 每次在 `app/video/**` 写代码前先扫一眼。
> 新坑发现 → 立刻记录到本文件 → 同步更新 `.windsurfrules` 的精简清单。
> 格式：**场景 → 最小复现 → 正确做法 → 涉及文件**

---

## Trap #1 · `interpolate` inputRange 非单调递增

### 场景
给通用动画组件写"三段曲线"（淡入 → 保持 → 淡出）时，如果传入的 `from/to` 时长过短或为 0，计算出的 inputRange 会非单调。

### 最小复现
```tsx
// Bug · 调用方传了 from=0, to=0, fadeFrames=12
interpolate(frame,
  [from, from + fadeFrames, to - fadeFrames, to],  // [0, 12, -12, 0]
  [0, 1, 1, 0],
);
// Runtime: Error: inputRange must be strictly monotonically increasing but got [0,12,-12,0]
```

### 正确做法
```tsx
// 1. 组件内部做防御式 early return
if (!text || to <= from + fadeFrames * 2) return null;

// 2. 或改为两段曲线（没有保持段），只要 2 个点严格递增就行
interpolate(frame, [from, to], [0, 1]);
```

### 涉及文件
- `@c:\Users\Administrator\Documents\code\yiqianji-fast\app\video\components\Subtitle.tsx` · 已加防御
- `@c:\Users\Administrator\Documents\code\yiqianji-fast\app\video\scenes\01-Cover.tsx` · 已删除问题调用

### 发现日期 / 修复 commit
Phase 2 Studio 首启 · bug fix #1

---

## Trap #2 · `@remotion/*` 子包版本混用

### 场景
`npm install` 时不同 Remotion 子包被解析到不同 patch 版本（4.0.448 / 4.0.449 / 4.0.450），Studio 启动会打印 `Version mismatch` 警告，后续可能出现 React context / hooks 失效。

### 正确做法
`package.json` 所有 `@remotion/*` 和 `remotion` 版本号**严格 pin**（去掉 `^`）：
```json
"remotion": "4.0.450",
"@remotion/bundler": "4.0.450",
"@remotion/cli": "4.0.450",
"@remotion/renderer": "4.0.450",
"@remotion/tailwind-v4": "4.0.450"
```
然后 `npm install` 让 npm 对齐所有子包。

### 状态
**已修复** · 精准 `npm install @remotion/bundler@4.0.450 ...` 强制对齐 12 个子包 · `npx remotion versions` 输出 `All packages have the correct version.`

---

## Trap #3 · npm optional deps bug（rspack native binding）

### 场景
Windows x64 上首次 `npm install` 后，Remotion Studio 启动抛 `Cannot find module '@rspack/binding-win32-x64-msvc'`。

这是 npm CLI 的已知 bug (https://github.com/npm/cli/issues/4828)：optional dependencies 在某些情况下不会被下载。

### 正确做法
```powershell
npm install @rspack/binding-win32-x64-msvc --save-optional
```

### 状态
**已修复** · Phase 0

---

## Trap #4 · （预留 · 未来踩坑时填）

---

## 设计约定（自己和自己的约束）

### 时间单位
- 全局 `constants.ts` 里 `SCENE_DURATIONS` 用**帧**表示
- 每个 scene 内部写动画关键点时，**用帧**不用秒，避免 fps 改动导致错位
- 字幕 `from/to` 参数必须是 scene 局部帧

### 字体与字号层级
- 大 Slogan（收尾类）：140-200px · weight 700 · Lexend
- 品牌名 Logo：180-220px · weight 700
- 场景主标题：80-120px · weight 700
- 字幕：48-56px · weight 600
- 副标题/提示：24-32px · weight 500

### 颜色使用原则
- 品牌 `primary #006485` · 标题 / logo
- `ink #0B3446` · 正文
- `muted #6B8A99` · 副标题 / 次要信息
- `accent #F7A072` · 强调点缀（不超过画面 5%）
- `mint #7AC7A6` · 积极状态（健康指标正常等）
- `danger #E85D75` · 警示（异常值、痛点数字）

### 动画曲线偏好
- UI 类 spring：`{ damping: 14, stiffness: 90, mass: 0.8 }`（温和 · 略有回弹）
- 数字类：`easeOut` · 前快后慢
- 淡入淡出：线性 interpolate + 12 帧 fadeFrames
- 关键揭示：spring 放大 · from=0.82 to=1

---

## 变更日志

| 日期 | 变更 |
|---|---|
| 初版 | 记录 Trap #1-3 + 设计约定 |
