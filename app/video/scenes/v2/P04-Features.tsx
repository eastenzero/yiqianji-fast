import { staticFile } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { Highlight } from '../../components/Highlight';
import { KenBurns } from '../../components/KenBurns';
import { SceneTransition } from '../../components/SceneTransition';
import { Sweep } from '../../components/Sweep';
import { COLORS } from '../../constants';

/**
 * Scene P04 · 核心功能（35s · 1050 帧 · 2:25-3:00）
 *
 * 叙事重点：记录 → 整理 → 摘要 → 分享 · 四步闭环 · 以 AI 摘要为"橙色 hero"
 *
 * 时间轴（scene 局部帧）：
 *   0-16       SceneTransition 入场（fade）
 *   0-1050     Ambient + SVG KenBurns
 *
 *   40-160     chevron 流程条 ltr Sweep（progressive reveal 感）
 *
 *   180-300    Card 1「日常记录」蓝色脉冲 2 次
 *   300-420    Card 2「智能整理」次蓝脉冲 2 次
 *   420-600    Card 3「AI 摘要」ORANGE 3 次脉冲（AI 是全片核心）
 *   600-720    Card 4「便捷分享」蓝色脉冲 2 次
 *
 *   800-900    chevron 第二次 Sweep（summary 感）
 *   900-1030   静止呼吸
 *   1032-1050  SceneTransition 退出
 *
 * Video 坐标（1.5x SVG）：
 *   Chevron row:  (84, 195, 1752, 78)
 *   Card 1: (84, 315, 390, 456)
 *   Card 2: (540, 315, 390, 456)
 *   Card 3: (996, 315, 390, 456)  · AI 摘要 · 橙色
 *   Card 4: (1452, 315, 384, 456)
 */

const CARD = {
  top: 315,
  width: 390,
  height: 456,
  radius: 18,
  card1Left: 84,
  card2Left: 540,
  card3Left: 996,
  card4Left: 1452,
};

const CHEVRON = {
  left: 84,
  top: 195,
  width: 1752,
  height: 78,
};

export const P04Features: React.FC = () => {
  return (
    <SceneTransition enter="fade" exit="zoom" enterFrames={16} exitFrames={18}>
      <AmbientBackground
        variant="surface"
        intensity="low"
        accent={COLORS.primary}
        particleCount={14}
        showEcg={false}
        seed={340}
      />

      <KenBurns
        src={staticFile('ppt/04_核心功能.svg')}
        from={{ scale: 1.0, x: 0, y: 0 }}
        to={{ scale: 1.03, x: 0, y: 0 }}
        fit="cover"
      >
        {/* ============ Chevron 流程条·首次扫光（Cue 1 f60 "四步闭环"） ============ */}
        <div
          style={{
            position: 'absolute',
            left: CHEVRON.left,
            top: CHEVRON.top,
            width: CHEVRON.width,
            height: CHEVRON.height,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <Sweep
            direction="ltr"
            startFrame={60}
            durationFrames={89}
            color="#FFFFFF"
            intensity={0.42}
            beamWidthPercent={22}
          />
        </div>

        {/* ============ 四张功能卡 · 依次脉冲 ============ */}

        {/* Card 1 · 日常记录 · 蓝色（Cue 2 f198） */}
        <div
          style={{
            position: 'absolute',
            left: CARD.card1Left,
            top: CARD.top,
            width: CARD.width,
            height: CARD.height,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            color={COLORS.primary}
            startFrame={198}
            pulsePeriod={45}
            pulseCount={2}
            maxGlowSize={44}
            maxSpread={4}
            display="block"
            borderRadius={CARD.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: CARD.radius,
              }}
            />
          </Highlight>
        </div>

        {/* Card 2 · 智能整理 · 次蓝（Cue 2 mid f273） */}
        <div
          style={{
            position: 'absolute',
            left: CARD.card2Left,
            top: CARD.top,
            width: CARD.width,
            height: CARD.height,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            color="#2C7DA0"
            startFrame={282}
            pulsePeriod={45}
            pulseCount={2}
            maxGlowSize={44}
            maxSpread={4}
            display="block"
            borderRadius={CARD.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: CARD.radius,
              }}
            />
          </Highlight>
        </div>

        {/* Card 3 · AI 摘要 · ORANGE（Cue 3 f348） */}
        <div
          style={{
            position: 'absolute',
            left: CARD.card3Left,
            top: CARD.top,
            width: CARD.width,
            height: CARD.height,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            color={COLORS.accent}
            startFrame={366}
            pulsePeriod={45}
            pulseCount={3}
            retainAfter
            maxGlowSize={60}
            maxSpread={7}
            display="block"
            borderRadius={CARD.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: CARD.radius,
              }}
            />
          </Highlight>
        </div>

        {/* Card 4 · 便捷分享 · 蓝色（Cue 3 mid f440） */}
        <div
          style={{
            position: 'absolute',
            left: CARD.card4Left,
            top: CARD.top,
            width: CARD.width,
            height: CARD.height,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            color={COLORS.primary}
            startFrame={506}
            pulsePeriod={45}
            pulseCount={2}
            maxGlowSize={44}
            maxSpread={4}
            display="block"
            borderRadius={CARD.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: CARD.radius,
              }}
            />
          </Highlight>
        </div>

        {/* ============ Chevron 流程条·末尾再扫（Cue 4 f537 "四步串起"） ============ */}
        <div
          style={{
            position: 'absolute',
            left: CHEVRON.left,
            top: CHEVRON.top,
            width: CHEVRON.width,
            height: CHEVRON.height,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <Sweep
            direction="ltr"
            startFrame={537}
            durationFrames={74}
            color={COLORS.accent}
            intensity={0.38}
            beamWidthPercent={20}
            blendMode="screen"
          />
        </div>
      </KenBurns>
    </SceneTransition>
  );
};
