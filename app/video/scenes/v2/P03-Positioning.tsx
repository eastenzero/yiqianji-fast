import { staticFile } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { Highlight } from '../../components/Highlight';
import { KenBurns } from '../../components/KenBurns';
import { SceneTransition } from '../../components/SceneTransition';
import { Sweep } from '../../components/Sweep';

/**
 * Scene P03 · 产品定位（15s · 450 帧 · 0:57-1:12 · A3 重整后）
 *
 * "揭示"时刻 · 全片的情绪转折点：从痛点（P02）转向解决方案。
 *
 * 叙事序列：
 *   BEFORE（红）→ AI（橙）→ AFTER（蓝）· 的 transform pill 是视觉主轴
 *   Sweep 光束横扫而过，象征"AI 一刀切过去，把散乱整理成清晰"
 *
 * 时间轴（scene 局部帧）· 严格对齐字幕 cue · A3 去静默：
 *   0-18       SceneTransition 入场（fade）· KenBurns 全程缓推
 *   30-464     配音区间（voice 从全局 1740 到 2174 · scene local 30-464）
 *
 *   Cue 1 · scene 30-207 · "医前记思路...整理成医生秒懂的专业摘要"
 *     40-120   BEFORE pill 红色 colorShift（"散乱"语境）
 *     100-200  ltr Sweep 横扫（"AI 变换"核心仪式）
 *     140-220  MIDDLE AI pill 橙色 colorShift（"整理"语境）
 *     180-260  AFTER pill 蓝色 colorShift + retainAfter（"专业摘要"解决方案落地）
 *
 *   Cue 2 · scene 207-344 · "30 秒记录 · AI 整理 · 30 秒读完半年病史"
 *     AFTER pill 残光留存 · SVG 自然呈现三段速率口号
 *
 *   Cue 3 · scene 344-450 · "坚持底线 · 辅助医生而不替代医生"（cue 实际 344-464，末 14 帧跨入 D1）
 *     370-410  tag 1「辅助医生而不替代医生」白 colorShift（对应字幕主句）
 *     395-435  tag 2「严格医疗合规」白 colorShift
 *     420-450  tag 3「不开展诊断决策」白 colorShift（最后 30 帧 · 贴合出场）
 *
 *   430-450   SceneTransition 退出（push-left · D1 从右侧推入）
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
// SVG 全宽（含圆角）200, height 36, y=620
const TAG_WIDTH = 300;  // 200 * 1.5
const TAG_HEIGHT = 54;  // 36 * 1.5
const TAG_TOP = 930;    // 620 * 1.5
const TAG_RADIUS = 27;

// tag 1 SVG x=310-510, tag 2 SVG x=535-735, tag 3 SVG x=760-960
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

      {/* SVG 主画面 · 极缓慢推近 · Highlight 遮罩作为 children 共享 transform */}
      <KenBurns
        src={staticFile('ppt/03_产品定位.svg')}
        from={{ scale: 1.0, x: 0, y: 0 }}
        to={{ scale: 1.04, x: 0, y: 0 }}
        fit="cover"
      >
        {/* ============ BEFORE pill · 红色脉冲（痛点的余音） ============ */}
        <div
          style={{
            position: 'absolute',
            left: PILL_BEFORE.left,
            top: PILL_BEFORE.top,
            width: PILL_BEFORE.width,
            height: PILL_BEFORE.height,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            mode="colorShift"
            colorShiftMaxAlpha={0.28}
            color="#BA1A1A"
            startFrame={40}
            pulsePeriod={40}
            pulseCount={2}
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

        {/* ============ MIDDLE AI pill · 暖橙脉冲 ============ */}
        <div
          style={{
            position: 'absolute',
            left: PILL_MIDDLE.left,
            top: PILL_MIDDLE.top,
            width: PILL_MIDDLE.width,
            height: PILL_MIDDLE.height,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            mode="colorShift"
            colorShiftMaxAlpha={0.32}
            color="#F7A072"
            startFrame={140}
            pulsePeriod={40}
            pulseCount={2}
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

        {/* ============ AFTER pill · 蓝色脉冲（解决方案落地） ============ */}
        <div
          style={{
            position: 'absolute',
            left: PILL_AFTER.left,
            top: PILL_AFTER.top,
            width: PILL_AFTER.width,
            height: PILL_AFTER.height,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            mode="colorShift"
            colorShiftMaxAlpha={0.30}
            color="#2C7DA0"
            startFrame={180}
            pulsePeriod={40}
            pulseCount={2}
            retainAfter
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

        {/* ============ 底部合规 tag 依次白色 colorShift · 对齐 Cue 3 “辅助医生而不替代医生” ============ */}
        {[
          { left: TAG_1_LEFT, startFrame: 370, pulsePeriod: 40 }, // Cue 3 前半
          { left: TAG_2_LEFT, startFrame: 395, pulsePeriod: 40 },
          { left: TAG_3_LEFT, startFrame: 420, pulsePeriod: 30 }, // 贴合出场
        ].map((tag, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: tag.left,
              top: TAG_TOP,
              width: TAG_WIDTH,
              height: TAG_HEIGHT,
              pointerEvents: 'none',
            }}
          >
            <Highlight
              mode="colorShift"
              colorShiftMaxAlpha={0.38}
              color="#FFFFFF"
              startFrame={tag.startFrame}
              pulsePeriod={tag.pulsePeriod}
              pulseCount={1}
              retainAfter
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
        ))}
      </KenBurns>

      {/* ============ AI 变换 ltr Sweep · 核心仪式（对应 cue 1「整理成专业摘要」） ============ */}
      <Sweep
        direction="ltr"
        startFrame={100}
        durationFrames={100}
        color="#F7A072"
        intensity={0.42}
        beamWidthPercent={16}
        blendMode="screen"
      />
    </SceneTransition>
  );
};
