/**
 * 视频全局常量 · 与 REMOTION_PLAN.md §2 时间轴保持同步
 * 修改任何时长后，请同步更新 plan 文件的时间轴表。
 */

export const FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;

/** 秒 → 帧 工具 */
export const sec = (s: number) => Math.round(s * FPS);

/** 9 个 Scene 的帧时长 · 总计 2700 帧 = 90 秒 */
export const SCENE_DURATIONS = {
  cover: sec(5),          // 0:00 - 0:05  · 150 f
  problem: sec(15),       // 0:05 - 0:20  · 450 f
  reveal: sec(3),         // 0:20 - 0:23  ·  90 f
  productDemo: sec(20),   // 0:23 - 0:43  · 600 f
  aiSummary: sec(12),     // 0:43 - 0:55  · 360 f
  technology: sec(10),    // 0:55 - 1:05  · 300 f
  business: sec(12),      // 1:05 - 1:17  · 360 f
  team: sec(9),           // 1:17 - 1:26  · 270 f
  ending: sec(4),         // 1:26 - 1:30  · 120 f
} as const;

export const TOTAL_FRAMES = Object.values(SCENE_DURATIONS).reduce(
  (sum, f) => sum + f,
  0,
);

/** 每个 Scene 的全局起始帧（调试 / 跳转用） */
export const SCENE_START_FRAMES = (() => {
  const keys = Object.keys(SCENE_DURATIONS) as Array<keyof typeof SCENE_DURATIONS>;
  const result: Record<string, number> = {};
  let cursor = 0;
  for (const key of keys) {
    result[key] = cursor;
    cursor += SCENE_DURATIONS[key];
  }
  return result as Record<keyof typeof SCENE_DURATIONS, number>;
})();

/** 品牌色板 · 与 app/src 保持一致 */
export const COLORS = {
  primary: '#006485',
  surface: '#F6FAFC',
  ink: '#0B3446',
  mist: '#E5EEF3',
  accent: '#F7A072',
  mint: '#7AC7A6',
  danger: '#E85D75',
  muted: '#6B8A99',
} as const;

/** 调试开关 · Studio 内验收场景定位时改 true · 渲染 mp4 时保持 false */
export const DEBUG_SHOW_SCENE_LABEL = false;

/**
 * BGM 开关 · 默认关闭（没有 bgm 文件时保持 false，避免渲染时抛错）
 *
 * 开启步骤：
 *   1. 下载 1 首 90 秒钢琴类免费 BGM，剪裁 / 淡入淡出好
 *   2. 放到 `app/public/audio/bgm.mp3`
 *   3. 把下面开关改为 true
 *   4. Studio 会自动热重载并开始播放
 */
export const BGM_ENABLED = true;
export const BGM_FILE = 'audio/bathed-in-the-light.mp3';
/** BGM 目标音量（0-1）· 配音场景压低到 0.22 让配音清晰 · 纯 BGM 场景可调 0.38 */
export const BGM_VOLUME = 0.22;

/** 配音层开关 · 配合 voice-script.json 和 public/audio/voice/*.mp3 */
export const VOICE_ENABLED = true;

// ============================================================================
// V2 · 计赛答辩版时间轴（新版 · 对应 REMOTION_V2_PLAN.md）
// ============================================================================
//
// 12 段 · 总约 7:40 = 13800 帧 @30fps
// 结构：9 页 PPT (P01-P09) + 3 段穿插演示 (D1-D3)
// 对应 PPT 项目：ppt-master/projects/yiqianji-defense_ppt169_20260422
// ============================================================================

/** V2 · 12 段帧时长 */
export const V2_SCENE_DURATIONS = {
  p01_cover: sec(15),          // 0:00 - 0:15  · 封面
  p02_background: sec(50),     // 0:15 - 1:05  · 项目背景
  p03_positioning: sec(25),    // 1:05 - 1:30  · 产品定位
  d1_recordFlow: sec(55),      // 1:30 - 2:25  · 演示1 · 记录流程
  p04_features: sec(35),       // 2:25 - 3:00  · 核心功能
  p05_recordOrganize: sec(25), // 3:00 - 3:25  · 记录与整理
  d2_aiSummary: sec(60),       // 3:25 - 4:25  · 演示2 · AI 摘要生成
  p06_summarySharing: sec(30), // 4:25 - 4:55  · AI 摘要分享
  d3_doctorScan: sec(40),      // 4:55 - 5:35  · 演示3 · 医生端扫码
  p07_architecture: sec(45),   // 5:35 - 6:20  · 技术架构
  p08_security: sec(45),       // 6:20 - 7:05  · 安全与创新
  p09_team: sec(35),           // 7:05 - 7:40  · 团队与展望
} as const;

export const V2_TOTAL_FRAMES = Object.values(V2_SCENE_DURATIONS).reduce(
  (sum, f) => sum + f,
  0,
);

/** V2 每段全局起始帧 */
export const V2_SCENE_START_FRAMES = (() => {
  const keys = Object.keys(V2_SCENE_DURATIONS) as Array<keyof typeof V2_SCENE_DURATIONS>;
  const result: Record<string, number> = {};
  let cursor = 0;
  for (const key of keys) {
    result[key] = cursor;
    cursor += V2_SCENE_DURATIONS[key];
  }
  return result as Record<keyof typeof V2_SCENE_DURATIONS, number>;
})();

/**
 * V2 BGM 音量 · 因为配音版和无配音版共用一套场景，BGM 需分档：
 *  - 有配音时压低，避免盖住人声
 *  - 无配音时回升，作为主要听感层
 */
export const V2_BGM_VOLUME_WITH_VOICE = 0.18;
export const V2_BGM_VOLUME_NO_VOICE = 0.42;

