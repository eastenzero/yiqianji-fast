import { AbsoluteFill, staticFile } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { Highlight } from '../../components/Highlight';
import { KenBurns } from '../../components/KenBurns';
import { SceneTransition } from '../../components/SceneTransition';
import { Sweep } from '../../components/Sweep';
import { COLORS } from '../../constants';

/**
 * Scene P07 · 技术架构（45s · 1350 帧 · 5:35-6:20）
 *
 * 叙事重点：4 层技术架构 · 从展示到 AI · 每层依次点亮
 *
 * 时间轴（scene 局部帧）：
 *   0-16       SceneTransition 入场（fade）
 *   0-1350     Ambient ink 变体 + SVG KenBurns
 *
 *   60-210     Layer 1「前端展示层」蓝色 2 次脉冲
 *   240-390    Layer 2「应用逻辑层」次蓝 2 次脉冲
 *   420-570    Layer 3「数据存储层」蓝色 2 次脉冲
 *   600-830    Layer 4「AI 能力层」ORANGE 3 次脉冲（AI 是核心）
 *
 *   900-1050   全屏 ltr Sweep · 从下到上强化"四层联动"
 *   1100-1300  静止呼吸
 *   1332-1350  SceneTransition 退出
 *
 * Video 坐标（1.5x SVG）· 4 层在 SVG y=100-635 区间
 *   Layer 1: (84, 150, 1290, 172)
 *   Layer 2: (84, 360, 1290, 172)
 *   Layer 3: (84, 570, 1290, 172)
 *   Layer 4: (84, 780, 1290, 172)
 */

const LAYER_LEFT = 84;
const LAYER_WIDTH = 1290;
const LAYER_HEIGHT = 172;
const LAYER_RADIUS = 15;

const LAYERS = [
  { top: 150, color: '#2C7DA0', startFrame: 60, pulseCount: 2 },
  { top: 360, color: '#2C7DA0', startFrame: 240, pulseCount: 2 },
  { top: 570, color: COLORS.primary, startFrame: 420, pulseCount: 2 },
  { top: 780, color: COLORS.accent, startFrame: 600, pulseCount: 3, retain: true },
];

export const P07Architecture: React.FC = () => {
  return (
    <SceneTransition enter="fade" exit="zoom" enterFrames={16} exitFrames={18}>
      <AmbientBackground
        variant="ink"
        intensity="low"
        accent={COLORS.primary}
        particleCount={16}
        showEcg
        seed={890}
      />

      <KenBurns
        src={staticFile('ppt/07_技术架构.svg')}
        from={{ scale: 1.0, x: 0, y: 0 }}
        to={{ scale: 1.03, x: 0, y: 0 }}
        fit="cover"
      />

      {/* 4 层架构依次脉冲 */}
      {LAYERS.map((layer, i) => (
        <AbsoluteFill key={i} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: LAYER_LEFT,
              top: layer.top,
              width: LAYER_WIDTH,
              height: LAYER_HEIGHT,
            }}
          >
            <Highlight
              color={layer.color}
              startFrame={layer.startFrame}
              pulsePeriod={50}
              pulseCount={layer.pulseCount}
              retainAfter={layer.retain}
              maxGlowSize={52}
              maxSpread={5}
              display="block"
              borderRadius={LAYER_RADIUS}
              style={{ width: '100%', height: '100%' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: LAYER_RADIUS,
                }}
              />
            </Highlight>
          </div>
        </AbsoluteFill>
      ))}

      {/* 末尾全屏 btt（从下到上）Sweep · "层层联动"感 */}
      <Sweep
        direction="btt"
        startFrame={900}
        durationFrames={150}
        color={COLORS.accent}
        intensity={0.26}
        beamWidthPercent={26}
        blendMode="screen"
      />
    </SceneTransition>
  );
};
