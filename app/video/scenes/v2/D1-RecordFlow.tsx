import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { PhoneFrame } from '../../components/PhoneFrame';
import { TouchRipple } from '../../components/TouchRipple';
import { COLORS } from '../../constants';
import { HomeView } from '../../../src/components/pure/HomeView';
import {
  RecordVitalView,
  type VitalRecentItem,
} from '../../../src/components/pure/RecordVitalView';

/**
 * Scene D1 · 演示 · 记录流程（55s · 1650 帧 · 1:30-2:25）
 *
 * 【Phase 3.5 真实化改造】放弃截图 + KenBurns 平移方案，
 * 改用真实 app 代码（pure 组件 HomeView / RecordVitalView）渲染，
 * 用帧驱动真实 state 变化，还原"用户录入血压"的完整体验。
 *
 * 产品流程串演：
 *   1. 手机从右滑入，Home 屏显示（13 天连续记录 + 7 条血压历史）
 *   2. 屏幕缓慢向下滚动，露出快捷记录四卡
 *   3. 点击"测体征"（TouchRipple）
 *   4. 切到 Record 体征录入屏
 *   5. 收缩压 135 / 舒张压 90 逐字敲入（真实输入手感）
 *   6. "保存记录"按下 → saving 中
 *   7. 切回 Home 屏 · 天数变 14 · 血压趋势多一根红柱（BP ALERT 触发）
 *
 * 左右浮动文案：
 *   A1 · 左侧 · "每日 30 秒记录 · 四入口"
 *   A2 · 右侧 · "收缩压 135 · 超阈值自动标红"
 *   A3 · 右侧 · "新记录自动入档 · BP ALERT 触发"
 */

// PhoneFrame 内部屏幕可视区
const PHONE_SCREEN_WIDTH = 408;
const PHONE_SCREEN_HEIGHT = 820;

// 关键帧
const HOME1_FADE_OUT_START = 390;
const HOME1_FADE_OUT_END = 460;
const RECORD_FADE_IN_START = 390;
const RECORD_FADE_IN_END = 460;
const RECORD_FADE_OUT_START = 1100;
const RECORD_FADE_OUT_END = 1180;
const HOME2_FADE_IN_START = 1100;
const HOME2_FADE_IN_END = 1180;

// "测体征" Quick Card 点击位置（滚动后 Quick Cards 出现在屏幕中下部）
const RIPPLE_VITAL = { x: PHONE_SCREEN_WIDTH * 0.25, y: PHONE_SCREEN_HEIGHT * 0.62 };
// 保存按钮点击位置（Record 屏底部附近）
const RIPPLE_SAVE = { x: PHONE_SCREEN_WIDTH * 0.5, y: PHONE_SCREEN_HEIGHT * 0.88 };

// === 数据（Home V1 · 录入前） ===
const CONDITIONS = ['高血压二期'];
const BP_TREND_BEFORE = [128, 132, 130, 126, 134, 130, 128]; // 近 7 次收缩压（最新 128）· 均在阈值内
// === 数据（Home V2 · 新增 135/90 后） ===
// 135 超阈值 · BpTrendCard 将切换为"BP ALERT"形态
const BP_TREND_AFTER = [132, 130, 126, 134, 130, 128, 135];

// Record 近期列表（模拟已有数据）
const RECORD_RECENT: VitalRecentItem[] = [
  { id: 'v1', kind: 'bp', display: '128/84', unit: 'mmHg', timeLabel: '昨天 07:12' },
  { id: 'v2', kind: 'bp', display: '130/86', unit: 'mmHg', timeLabel: '2 天前 07:30' },
  { id: 'v3', kind: 'bg', display: '5.8', unit: 'mmol/L', timeLabel: '2 天前 07:30', note: '空腹' },
  { id: 'v4', kind: 'bp', display: '134/90', unit: 'mmHg', timeLabel: '3 天前 21:08' },
  { id: 'v5', kind: 'bp', display: '126/82', unit: 'mmHg', timeLabel: '4 天前 07:20' },
  { id: 'v6', kind: 'bp', display: '130/88', unit: 'mmHg', timeLabel: '5 天前 21:15' },
  { id: 'v7', kind: 'hr', display: '72', unit: 'bpm', timeLabel: '5 天前 08:00' },
];

/** "打字"效果：按帧数返回目标字符串的前 N 位 · 每 charsPerFrame 帧显现 1 字符 */
function typeInto(
  target: string,
  frame: number,
  startFrame: number,
  charsPerSecond: number,
  fps = 30,
): string {
  const framesPerChar = fps / charsPerSecond;
  const elapsed = Math.max(0, frame - startFrame);
  const count = Math.min(target.length, Math.floor(elapsed / framesPerChar));
  return target.slice(0, count);
}

export const D1RecordFlow: React.FC = () => {
  const frame = useCurrentFrame();

  // === 手机入场 / 退场 ===
  const phoneEnter = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phoneExit = interpolate(frame, [1620, 1650], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phoneTx = (1 - phoneEnter) * 420;
  const phoneScale = 0.94 + phoneEnter * 0.06;
  const phoneOpacity = phoneEnter * phoneExit;

  // === 三屏 opacity ===
  const home1Opacity = interpolate(
    frame,
    [HOME1_FADE_OUT_START, HOME1_FADE_OUT_END],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const recordOpacity =
    interpolate(frame, [RECORD_FADE_IN_START, RECORD_FADE_IN_END], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) *
    interpolate(frame, [RECORD_FADE_OUT_START, RECORD_FADE_OUT_END], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const home2Opacity = interpolate(
    frame,
    [HOME2_FADE_IN_START, HOME2_FADE_IN_END],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // === 滚动（Home V1） · 0-350 帧从顶部滚到 QuickCards ===
  const home1ScrollY = interpolate(frame, [50, 350], [0, -360], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // === 滚动（Home V2） · 1180 帧起从 BP 卡附近开始，轻推到底 ===
  const home2ScrollY = interpolate(frame, [1180, 1650], [-280, -520], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // === 滚动（Record） · 跟随输入位置让 BP 输入框保持可见 ===
  const recordScrollY = interpolate(frame, [460, 1000], [0, -120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // === 输入"打字"效果（收缩压 135 / 舒张压 90）===
  // 收缩压 520-680：每秒 1.8 字符
  const systolic = typeInto('135', frame, 520, 1.8);
  // 舒张压 720-850：每秒 1.8 字符
  const diastolic = typeInto('90', frame, 720, 1.8);
  // saving 状态 · 900-1050
  const saving = frame >= 900 && frame < 1060;

  // === 左右浮动文案 ===
  const a1Opacity = interpolate(frame, [60, 130, 360, 430], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const a1Tx = interpolate(frame, [60, 130], [-40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const a2Opacity = interpolate(frame, [520, 600, 1050, 1120], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const a2Tx = interpolate(frame, [520, 600], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const a3Opacity = interpolate(frame, [1220, 1300, 1520, 1600], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const a3Tx = interpolate(frame, [1220, 1300], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {/* 舞台背景 */}
      <AmbientBackground
        variant="surface"
        intensity="low"
        accent={COLORS.primary}
        particleCount={14}
        showEcg
        seed={500}
      />

      {/* 手机 */}
      <PhoneFrame
        scale={phoneScale}
        translateX={phoneTx}
        opacity={phoneOpacity}
      >
        {/* Home V1 · 录入前（13 天 · BP 正常） */}
        <PhoneContent scrollY={home1ScrollY} opacity={home1Opacity}>
          <HomeView
            forceMobile
            name="王先生"
            conditions={CONDITIONS}
            continuousDays={13}
            bpTrend={BP_TREND_BEFORE}
            summaryTeaser={null}
            hasApiKey
            hideFooter
          />
        </PhoneContent>

        {/* Record · 血压录入 */}
        <PhoneContent scrollY={recordScrollY} opacity={recordOpacity}>
          <RecordVitalView
            activeTab="vital"
            kind="bp"
            systolic={systolic}
            diastolic={diastolic}
            saving={saving}
            recentList={RECORD_RECENT}
          />
        </PhoneContent>

        {/* Home V2 · 录入后（14 天 · BP ALERT 触发） */}
        <PhoneContent scrollY={home2ScrollY} opacity={home2Opacity}>
          <HomeView
            forceMobile
            name="王先生"
            conditions={CONDITIONS}
            continuousDays={14}
            bpTrend={BP_TREND_AFTER}
            summaryTeaser={null}
            hasApiKey
            hideFooter
          />
        </PhoneContent>

        {/* Ripple 1 · 点击"测体征" */}
        <TouchRipple
          x={RIPPLE_VITAL.x}
          y={RIPPLE_VITAL.y}
          triggerFrame={380}
          maxRadius={90}
          durationFrames={30}
          color={COLORS.primary}
        />

        {/* Ripple 2 · 点击"保存记录" */}
        <TouchRipple
          x={RIPPLE_SAVE.x}
          y={RIPPLE_SAVE.y}
          triggerFrame={880}
          maxRadius={110}
          durationFrames={34}
          color={COLORS.accent}
        />
      </PhoneFrame>

      {/* ============ 左右浮动说明 ============ */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        }}
      >
        {/* A1 · 左侧 */}
        <FloatingStep
          side="left"
          step="STEP 01"
          title={'每日 30 秒\n四入口随手记'}
          sub={'测体征 · 记症状 · 生活习惯 · 记用药'}
          opacity={a1Opacity}
          tx={a1Tx}
        />

        {/* A2 · 右侧 */}
        <FloatingStep
          side="right"
          step="STEP 02"
          title={'真实输入\n135 / 90'}
          sub={'收缩压超 135 自动标红\n提示波动风险'}
          opacity={a2Opacity}
          tx={a2Tx}
          stepColor={COLORS.danger}
        />

        {/* A3 · 右侧 */}
        <FloatingStep
          side="right"
          step="STEP 03"
          title={'新记录\n自动入档'}
          sub={'血压趋势自动更新\nBP ALERT 即时触发'}
          opacity={a3Opacity}
          tx={a3Tx}
          stepColor={COLORS.accent}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * 手机内容容器 · 固定 overflow-hidden + padding
 * 通过 translateY 实现"滚动"效果（真实 app 依赖浏览器 scroll，这里帧驱动）
 */
function PhoneContent({
  scrollY,
  opacity,
  children,
}: {
  scrollY: number;
  opacity: number;
  children: React.ReactNode;
}) {
  if (opacity <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        opacity,
        background: '#F6FAFC',
      }}
    >
      <div
        style={{
          transform: `translateY(${scrollY}px)`,
          padding: '16px 20px 24px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** 左侧或右侧的 Step 说明卡 · 统一样式 */
function FloatingStep({
  side,
  step,
  title,
  sub,
  opacity,
  tx,
  stepColor,
}: {
  side: 'left' | 'right';
  step: string;
  title: string;
  sub: string;
  opacity: number;
  tx: number;
  stepColor?: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        [side]: 140,
        top: 400,
        width: side === 'left' ? 380 : 420,
        opacity,
        transform: `translateX(${tx}px)`,
        textAlign: side === 'right' ? 'right' : 'left',
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '0.3em',
          color: stepColor ?? COLORS.muted,
          marginBottom: 14,
          textTransform: 'uppercase',
        }}
      >
        {step}
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: COLORS.ink,
          lineHeight: 1.2,
          marginBottom: 18,
          letterSpacing: '-0.02em',
          whiteSpace: 'pre-line',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 22,
          color: COLORS.muted,
          lineHeight: 1.5,
          whiteSpace: 'pre-line',
        }}
      >
        {sub}
      </div>
    </div>
  );
}
