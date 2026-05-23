import { staticFile } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { Highlight } from '../../components/Highlight';
import { KenBurns } from '../../components/KenBurns';
import { SceneTransition } from '../../components/SceneTransition';
import { Sweep } from '../../components/Sweep';
import { COLORS } from '../../constants';

/**
 * Scene P02 · 项目背景（50s · 1500 帧 · 0:15-1:05）
 *
 * 叙事节奏：引导视线 → 红色冲击 → 数据轰炸 → 回归静默
 *
 * 时间轴（scene 局部帧）：
 *   0-16      SceneTransition 入场（fade）
 *   0-1500    AmbientBackground 全程兜底（surface · low）
 *   0-1500    SVG 超缓慢推近（scale 1.00 → 1.03 · 无平移避免 overlay 错位）
 *
 *   45-150    痛点1「资料散落」蓝色 Highlight 2 次脉冲
 *   170-275   痛点2「话到嘴边讲不清」次蓝 Highlight 2 次脉冲
 *   295-475   痛点3「3 分钟说完半年」RED Highlight 3 次脉冲（全片情绪高点）
 *
 *   510-580   全屏 ltr Sweep（情绪切换 · 从痛点转到数据）
 *
 *   620-820   KPI bar 整体 Highlight 2 次脉冲（白色柔和晕）
 *   870-990   KPI 3「2.45 亿」单数字 Highlight 脉冲
 *   1020-1140 KPI 4「1.18 亿」单数字 Highlight 脉冲
 *
 *   1180-1260 末尾 diagonal Sweep（收尾强调）
 *   1260-1482 静止呼吸（让观众消化）
 *   1482-1500 SceneTransition 退出
 *
 * SVG 坐标转视频坐标：viewBox 1280×720 映射到 1920×1080，scale = 1.5x
 */

// === 关键元素在视频坐标（1920×1080）中的位置 ===
// 痛点卡：SVG 中 (520-1224, y±72)，video 中 scale 1.5
const PAIN_CARD = {
  left: 780,          // 520 * 1.5
  width: 1056,        // (1224-520) * 1.5
  height: 108,        // 72 * 1.5
  radius: 18,         // 12 * 1.5
  card1Top: 142.5,    // 95 * 1.5
  card2Top: 274.5,    // 183 * 1.5
  card3Top: 406.5,    // 271 * 1.5
};

// KPI 数据条：SVG (56-1224, 440-530)
const KPI_BAR = {
  left: 84,           // 56 * 1.5
  top: 660,           // 440 * 1.5
  width: 1752,        // 1168 * 1.5
  height: 135,        // 90 * 1.5
  radius: 18,
};

// 单个 KPI 数字覆盖区（用于精确脉冲）
// 收紧后的数值：文字 baseline 717 · fontSize 54 · 藥丸纵向贴紧数字、不大副标「高血压患者」（y=762+）
const KPI_NUM_WIDTH = 220;
const KPI_NUM_HEIGHT = 56;
const KPI_NUM_TOP = 672;

export const P02Background: React.FC = () => {
  return (
    <SceneTransition enter="fade" exit="zoom" enterFrames={16} exitFrames={18}>
      {/* 底层环境背景 · 极低强度 · 让 SVG 为主 */}
      <AmbientBackground
        variant="surface"
        intensity="low"
        accent={COLORS.primary}
        particleCount={12}
        showEcg={false}
        seed={120}
      />

      {/* SVG 主画面 · Highlight 作为 children 共享 KenBurns transform */}
      <KenBurns
        src={staticFile('ppt/02_项目背景.svg')}
        from={{ scale: 1.0, x: 0, y: 0 }}
        to={{ scale: 1.03, x: 0, y: 0 }}
        fit="cover"
      >
        {/* ============ KPI 数据轰炸（Cue 1-2：“先看三组数字” f60-348） ============ */}

        {/* KPI bar 整体白色柔和脉冲 */}
        <div
          style={{
            position: 'absolute',
            left: KPI_BAR.left,
            top: KPI_BAR.top,
            width: KPI_BAR.width,
            height: KPI_BAR.height,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            mode="colorShift"
            colorShiftMaxAlpha={0.14}
            color="#FFFFFF"
            startFrame={60}
            pulsePeriod={60}
            pulseCount={2}
            display="block"
            borderRadius={KPI_BAR.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: KPI_BAR.radius,
              }}
            />
          </Highlight>
        </div>

        {/* KPI · 2.45 亿高血压 · 单数字脉冲 */}
        <div
          style={{
            position: 'absolute',
            left: 1110 - KPI_NUM_WIDTH / 2,
            top: KPI_NUM_TOP,
            width: KPI_NUM_WIDTH,
            height: KPI_NUM_HEIGHT,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            mode="colorShift"
            colorShiftMaxAlpha={0.38}
            color="#F7A072"
            startFrame={90}
            pulsePeriod={40}
            pulseCount={2}
            display="block"
            borderRadius={12}
            style={{ width: '100%', height: '100%' }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: 12 }} />
          </Highlight>
        </div>

        {/* KPI · 1.18 亿糖尿病 · 单数字脉冲 */}
        <div
          style={{
            position: 'absolute',
            left: 1560 - KPI_NUM_WIDTH / 2,
            top: KPI_NUM_TOP,
            width: KPI_NUM_WIDTH,
            height: KPI_NUM_HEIGHT,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            mode="colorShift"
            colorShiftMaxAlpha={0.38}
            color="#F7A072"
            startFrame={180}
            pulsePeriod={40}
            pulseCount={2}
            display="block"
            borderRadius={12}
            style={{ width: '100%', height: '100%' }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: 12 }} />
          </Highlight>
        </div>

        {/* ============ 痛点卡高亮（Cue 3-7：“三件头疼事” f348-987） ============ */}

        {/* 痛点 1 · 资料散落四方 · 蓝色（Cue 3 f348） */}
        <div
          style={{
            position: 'absolute',
            left: PAIN_CARD.left,
            top: PAIN_CARD.card1Top,
            width: PAIN_CARD.width,
            height: PAIN_CARD.height,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            mode="colorShift"
            colorShiftMaxAlpha={0.22}
            color={COLORS.primary}
            startFrame={348}
            pulsePeriod={40}
            pulseCount={2}
            display="block"
            borderRadius={PAIN_CARD.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: PAIN_CARD.radius,
              }}
            />
          </Highlight>
        </div>

        {/* 痛点 2 · 话到嘴边讲不清 · 次蓝（Cue 5 f645） */}
        <div
          style={{
            position: 'absolute',
            left: PAIN_CARD.left,
            top: PAIN_CARD.card2Top,
            width: PAIN_CARD.width,
            height: PAIN_CARD.height,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            mode="colorShift"
            colorShiftMaxAlpha={0.22}
            color="#2C7DA0"
            startFrame={645}
            pulsePeriod={40}
            pulseCount={2}
            display="block"
            borderRadius={PAIN_CARD.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: PAIN_CARD.radius,
              }}
            />
          </Highlight>
        </div>

        {/* 痛点 3 · 3 分钟说完半年 · RED（Cue 6 f783） */}
        <div
          style={{
            position: 'absolute',
            left: PAIN_CARD.left,
            top: PAIN_CARD.card3Top,
            width: PAIN_CARD.width,
            height: PAIN_CARD.height,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            mode="colorShift"
            colorShiftMaxAlpha={0.32}
            color="#BA1A1A"
            startFrame={783}
            pulsePeriod={56}
            pulseCount={3}
            retainAfter
            display="block"
            borderRadius={PAIN_CARD.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: PAIN_CARD.radius,
              }}
            />
          </Highlight>
        </div>
      </KenBurns>

      {/* ============ 情绪切换扫光（数据 → 痛点） ============ */}
      <Sweep
        direction="ltr"
        startFrame={300}
        durationFrames={60}
        color="#FFFFFF"
        intensity={0.32}
        beamWidthPercent={22}
      />

      {/* ============ 收尾 diagonal 扫光 ============ */}
      <Sweep
        direction="diagonal"
        angle={-18}
        startFrame={918}
        durationFrames={69}
        color="#FFFFFF"
        intensity={0.22}
        beamWidthPercent={16}
      />
    </SceneTransition>
  );
};
