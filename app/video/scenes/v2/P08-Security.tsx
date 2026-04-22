import { AbsoluteFill, staticFile } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { Highlight } from '../../components/Highlight';
import { KenBurns } from '../../components/KenBurns';
import { SceneTransition } from '../../components/SceneTransition';
import { Sweep } from '../../components/Sweep';
import { COLORS } from '../../constants';

/**
 * Scene P08 · 安全与创新（45s · 1350 帧 · 6:20-7:05）
 *
 * 两栏并列叙事：左栏四层安全防御 · 右栏四大创新亮点（含"首创"徽章）
 *
 * 时间轴（scene 局部帧）：
 *   0-16       SceneTransition 入场（fade）
 *   0-1350     Ambient + SVG KenBurns
 *
 *   左栏 · 从核心向外 L0→L1→L2→L3 依次点亮（"向外扩散"感）
 *   60-180     Core 本地优先存储 蓝色 2 次（中心圆）
 *   180-300    L1 端到端加密 次蓝 2 次
 *   300-420    L2 精细权限控制 蓝色 2 次
 *   420-560    L3 国产 AI 合规 ORANGE 3 次（合规是亮点）
 *
 *   右栏 · 4 创新卡依次脉冲
 *   180-320    Innov 1「多模态时序建模」橙色 3 次（首创）
 *   340-480    Innov 2「三屏串联」蓝色 2 次
 *   500-640    Innov 3「多 AI 供应商」蓝色 2 次
 *   660-800    Innov 4「PWA 零安装」蓝色 2 次
 *
 *   900-1050   全屏 ltr Sweep 总结感
 *   1332-1350  退出
 *
 * Video 坐标（1.5x）：
 *   Left security cards: SVG (444-604, y)
 *     L3: (666, 255, 240, 138)
 *     L2: (666, 412.5, 240, 138)
 *     L1: (666, 570, 240, 138)
 *     Core: (666, 727.5, 240, 138)
 *   Right innovations: SVG (660-1224, y)
 *     Innov 1: (990, 210, 846, 162)
 *     Innov 2: (990, 390, 846, 162)
 *     Innov 3: (990, 570, 846, 162)
 *     Innov 4: (990, 750, 846, 162)
 */

// 左栏 · 4 层安全卡（由外向内的顺序：L3 → L2 → L1 → Core）
const SEC_LEFT = 666;
const SEC_WIDTH = 240;
const SEC_HEIGHT = 138;
const SEC_RADIUS = 12;

const SECURITY_LAYERS = [
  // Core 最先点亮（由内向外）
  { top: 727.5, color: COLORS.primary, startFrame: 60, pulseCount: 2 },
  { top: 570, color: '#2C7DA0', startFrame: 180, pulseCount: 2 },       // L1
  { top: 412.5, color: COLORS.primary, startFrame: 300, pulseCount: 2 }, // L2
  { top: 255, color: COLORS.accent, startFrame: 420, pulseCount: 3, retain: true }, // L3 国产 AI 合规
];

// 右栏 · 4 个创新卡
const INNOV_LEFT = 990;
const INNOV_WIDTH = 846;
const INNOV_HEIGHT = 162;
const INNOV_RADIUS = 18;

const INNOVATIONS = [
  { top: 210, color: COLORS.accent, startFrame: 180, pulseCount: 3, retain: true }, // 首创
  { top: 390, color: COLORS.primary, startFrame: 340, pulseCount: 2 },
  { top: 570, color: '#2C7DA0', startFrame: 500, pulseCount: 2 },
  { top: 750, color: COLORS.primary, startFrame: 660, pulseCount: 2 },
];

export const P08Security: React.FC = () => {
  return (
    <SceneTransition enter="fade" exit="zoom" enterFrames={16} exitFrames={18}>
      <AmbientBackground
        variant="surface"
        intensity="low"
        accent={COLORS.primary}
        particleCount={14}
        showEcg={false}
        seed={1450}
      />

      <KenBurns
        src={staticFile('ppt/08_安全与创新.svg')}
        from={{ scale: 1.0, x: 0, y: 0 }}
        to={{ scale: 1.03, x: 0, y: 0 }}
        fit="cover"
      />

      {/* === 左栏 4 层安全防御卡（由内向外依次点亮） === */}
      {SECURITY_LAYERS.map((layer, i) => (
        <AbsoluteFill key={`sec-${i}`} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: SEC_LEFT,
              top: layer.top,
              width: SEC_WIDTH,
              height: SEC_HEIGHT,
            }}
          >
            <Highlight
              color={layer.color}
              startFrame={layer.startFrame}
              pulsePeriod={45}
              pulseCount={layer.pulseCount}
              retainAfter={layer.retain}
              maxGlowSize={36}
              maxSpread={3}
              display="block"
              borderRadius={SEC_RADIUS}
              style={{ width: '100%', height: '100%' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: SEC_RADIUS,
                }}
              />
            </Highlight>
          </div>
        </AbsoluteFill>
      ))}

      {/* === 右栏 4 创新卡依次脉冲（第一个"首创"橙色） === */}
      {INNOVATIONS.map((innov, i) => (
        <AbsoluteFill key={`innov-${i}`} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: INNOV_LEFT,
              top: innov.top,
              width: INNOV_WIDTH,
              height: INNOV_HEIGHT,
            }}
          >
            <Highlight
              color={innov.color}
              startFrame={innov.startFrame}
              pulsePeriod={50}
              pulseCount={innov.pulseCount}
              retainAfter={innov.retain}
              maxGlowSize={50}
              maxSpread={5}
              display="block"
              borderRadius={INNOV_RADIUS}
              style={{ width: '100%', height: '100%' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: INNOV_RADIUS,
                }}
              />
            </Highlight>
          </div>
        </AbsoluteFill>
      ))}

      {/* 末尾全屏 ltr Sweep · 总结感 */}
      <Sweep
        direction="ltr"
        startFrame={900}
        durationFrames={150}
        color="#FFFFFF"
        intensity={0.3}
        beamWidthPercent={22}
      />
    </SceneTransition>
  );
};
