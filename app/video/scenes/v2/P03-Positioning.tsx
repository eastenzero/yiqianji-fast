import { AbsoluteFill, staticFile } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { Highlight } from '../../components/Highlight';
import { KenBurns } from '../../components/KenBurns';
import { SceneTransition } from '../../components/SceneTransition';
import { Sweep } from '../../components/Sweep';

/**
 * Scene P03 · 产品定位（25s · 750 帧 · 1:05-1:30）
 *
 * "揭示"时刻 · 全片的情绪转折点：从痛点（P02）转向解决方案。
 *
 * 叙事序列：
 *   BEFORE（红）→ AI（橙）→ AFTER（蓝）· 的 transform pill 是视觉主轴
 *   Sweep 光束横扫而过，象征"AI 一刀切过去，把散乱整理成清晰"
 *
 * 时间轴（scene 局部帧）：
 *   0-18     SceneTransition 入场（fade）
 *   0-750    AmbientBackground 深色变体（hero image 已是暗底，兜底用）
 *   0-750    SVG KenBurns 超缓慢推近
 *
 *   60-160   BEFORE pill 红色 Highlight 脉冲 2 次
 *   180-280  "AI 变换" ltr Sweep 横扫（从 BEFORE 到 AFTER · 情绪高点）
 *   230-340  MIDDLE AI pill 暖橙 Highlight 脉冲 2 次
 *   360-480  AFTER pill 蓝色 Highlight 脉冲 2 次（解决方案落地）
 *
 *   520-580  合规 tag 1「辅助医生而不替代医生」白色脉冲
 *   580-640  合规 tag 2「严格医疗合规」白色脉冲
 *   640-700  合规 tag 3「不开展诊断决策」白色脉冲
 *
 *   730-750  SceneTransition 退出（push-left，让 D1 Demo 从右侧推入的感觉）
 *
 * SVG 坐标：transform-flow pill 在 y=420-476（video 630-714）· 三段 pill 横向分布
 */

// === transform-flow 三段 pill 位置（video 1920×1080 坐标）===
// BEFORE pill: SVG (140, 428, 280, 40) → video (210, 642, 420, 60)
const PILL_BEFORE = { left: 210, top: 642, width: 420, height: 60, radius: 30 };

// MIDDLE AI pill: SVG (470, 428, 240, 40) → video (705, 642, 360, 60)
const PILL_MIDDLE = { left: 705, top: 642, width: 360, height: 60, radius: 30 };

// AFTER pill: SVG (760, 428, 380, 40) → video (1140, 642, 570, 60)
const PILL_AFTER = { left: 1140, top: 642, width: 570, height: 60, radius: 30 };

// === 合规 tag 三个（video 坐标）===
// SVG width 164, height 36, y=620
const TAG_WIDTH = 246;  // 164 * 1.5
const TAG_HEIGHT = 54;  // 36 * 1.5
const TAG_TOP = 930;    // 620 * 1.5
const TAG_RADIUS = 27;

// tag 1 SVG x=310-490, tag 2 SVG x=535-715, tag 3 SVG x=760-940
const TAG_1_LEFT = 465;   // 310 * 1.5
const TAG_2_LEFT = 802;   // 535 * 1.5 (≈802.5)
const TAG_3_LEFT = 1140;  // 760 * 1.5

export const P03Positioning: React.FC = () => {
  return (
    <SceneTransition
      enter="fade"
      exit="push-left"
      enterFrames={18}
      exitFrames={20}
    >
      {/* 底层兜底（SVG 可能有透明区） */}
      <AmbientBackground
        variant="ink"
        intensity="low"
        accent="#2C7DA0"
        particleCount={10}
        showEcg={false}
        seed={230}
      />

      {/* SVG 主画面 · 极缓慢推近 */}
      <KenBurns
        src={staticFile('ppt/03_产品定位.svg')}
        from={{ scale: 1.0, x: 0, y: 0 }}
        to={{ scale: 1.04, x: 0, y: 0 }}
        fit="cover"
      />

      {/* ============ BEFORE pill · 红色脉冲（痛点的余音） ============ */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: PILL_BEFORE.left,
            top: PILL_BEFORE.top,
            width: PILL_BEFORE.width,
            height: PILL_BEFORE.height,
          }}
        >
          <Highlight
            color="#BA1A1A"
            startFrame={60}
            pulsePeriod={50}
            pulseCount={2}
            maxGlowSize={46}
            maxSpread={5}
            display="block"
            borderRadius={PILL_BEFORE.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: PILL_BEFORE.radius,
              }}
            />
          </Highlight>
        </div>
      </AbsoluteFill>

      {/* ============ AI 变换 ltr Sweep · 核心仪式 ============ */}
      <Sweep
        direction="ltr"
        startFrame={180}
        durationFrames={100}
        color="#F7A072"
        intensity={0.42}
        beamWidthPercent={16}
        blendMode="screen"
      />

      {/* ============ MIDDLE AI pill · 暖橙脉冲 ============ */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: PILL_MIDDLE.left,
            top: PILL_MIDDLE.top,
            width: PILL_MIDDLE.width,
            height: PILL_MIDDLE.height,
          }}
        >
          <Highlight
            color="#F7A072"
            startFrame={230}
            pulsePeriod={55}
            pulseCount={2}
            maxGlowSize={52}
            maxSpread={6}
            display="block"
            borderRadius={PILL_MIDDLE.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: PILL_MIDDLE.radius,
              }}
            />
          </Highlight>
        </div>
      </AbsoluteFill>

      {/* ============ AFTER pill · 蓝色脉冲（解决方案落地） ============ */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: PILL_AFTER.left,
            top: PILL_AFTER.top,
            width: PILL_AFTER.width,
            height: PILL_AFTER.height,
          }}
        >
          <Highlight
            color="#2C7DA0"
            startFrame={360}
            pulsePeriod={60}
            pulseCount={2}
            retainAfter
            maxGlowSize={56}
            maxSpread={7}
            display="block"
            borderRadius={PILL_AFTER.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: PILL_AFTER.radius,
              }}
            />
          </Highlight>
        </div>
      </AbsoluteFill>

      {/* ============ 底部合规 tag 依次白色脉冲 ============ */}
      {[
        { left: TAG_1_LEFT, startFrame: 520 },
        { left: TAG_2_LEFT, startFrame: 580 },
        { left: TAG_3_LEFT, startFrame: 640 },
      ].map((tag, i) => (
        <AbsoluteFill key={i} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: tag.left,
              top: TAG_TOP,
              width: TAG_WIDTH,
              height: TAG_HEIGHT,
            }}
          >
            <Highlight
              color="#FFFFFF"
              startFrame={tag.startFrame}
              pulsePeriod={32}
              pulseCount={2}
              maxGlowSize={26}
              maxSpread={2}
              display="block"
              borderRadius={TAG_RADIUS}
              style={{ width: '100%', height: '100%' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: TAG_RADIUS,
                }}
              />
            </Highlight>
          </div>
        </AbsoluteFill>
      ))}
    </SceneTransition>
  );
};
