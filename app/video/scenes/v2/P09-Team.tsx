import { AbsoluteFill, staticFile } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { Highlight } from '../../components/Highlight';
import { KenBurns } from '../../components/KenBurns';
import { SceneTransition } from '../../components/SceneTransition';
import { Sweep } from '../../components/Sweep';
import { COLORS } from '../../constants';

/**
 * Scene P09 · 团队与展望（35s · 1050 帧 · 7:05-7:40）
 *
 * 收尾曲 · 六人团队依次亮相 + 指导教师 + slogan 愿景大字。
 *
 * 时间轴（scene 局部帧）：
 *   0-16       SceneTransition 入场（fade）
 *   0-1050     Ambient mist 变体（温暖收尾）+ SVG KenBurns
 *
 *   60-420     6 位成员依次脉冲（60 帧间隔 · 三色轮替）
 *                Row 1: 查烨凡(60)/王蓉(120)/张双阳(180)
 *                Row 2: 吴昱涵(240)/杨许可(300)/刘新奥(360)
 *
 *   480-600    指导教师「冯敏」卡 蓝色 2 次
 *   620-740    学校署名 Sweep 扫过（承接"集体"感）
 *   760-900    Vision 大字「让每一次就诊都有充分的准备」ORANGE 3 次 + retainAfter
 *
 *   900-1020   静止停留 · 让 slogan 最后烙印
 *   1020-1050  SceneTransition 退出（zoom-out fade，作全片终点）
 *
 * Video 坐标（1.5x）：
 *   Row 1: y=195-345, 3 cards at x=(84, 255)/(675, 255)/(1266, 255)
 *     m1: (84, 195, 555, 150)
 *     m2: (675, 195, 555, 150)
 *     m3: (1266, 195, 555, 150)
 *   Row 2: y=375-525
 *     m4: (84, 375, 555, 150)
 *     m5: (675, 375, 555, 150)
 *     m6: (1266, 375, 555, 150)
 *   Advisor: (697.5, 577.5, 525, 82)
 *   Vision pill: (360, 765, 1200, 120)
 */

const MEMBER_WIDTH = 555;
const MEMBER_HEIGHT = 150;
const MEMBER_RADIUS = 18;

const MEMBERS = [
  // Row 1
  { left: 84, top: 195, color: COLORS.primary, startFrame: 60 },
  { left: 675, top: 195, color: '#2C7DA0', startFrame: 120 },
  { left: 1266, top: 195, color: COLORS.accent, startFrame: 180 },
  // Row 2
  { left: 84, top: 375, color: COLORS.primary, startFrame: 240 },
  { left: 675, top: 375, color: '#2C7DA0', startFrame: 300 },
  { left: 1266, top: 375, color: COLORS.accent, startFrame: 360 },
];

const ADVISOR = {
  left: 697.5,
  top: 577.5,
  width: 525,
  height: 82,
  radius: 40,
};

const VISION = {
  left: 360,
  top: 765,
  width: 1200,
  height: 120,
  radius: 24,
};

export const P09Team: React.FC = () => {
  return (
    <SceneTransition enter="fade" exit="zoom" enterFrames={16} exitFrames={20}>
      <AmbientBackground
        variant="mist"
        intensity="medium"
        accent={COLORS.primary}
        particleCount={18}
        showEcg
        seed={1800}
      />

      <KenBurns
        src={staticFile('ppt/09_团队与展望.svg')}
        from={{ scale: 1.0, x: 0, y: 0 }}
        to={{ scale: 1.04, x: 0, y: -6 }}
        fit="cover"
      />

      {/* 6 位成员依次脉冲 */}
      {MEMBERS.map((m, i) => (
        <AbsoluteFill key={`m-${i}`} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: m.left,
              top: m.top,
              width: MEMBER_WIDTH,
              height: MEMBER_HEIGHT,
            }}
          >
            <Highlight
              color={m.color}
              startFrame={m.startFrame}
              pulsePeriod={35}
              pulseCount={2}
              maxGlowSize={38}
              maxSpread={4}
              display="block"
              borderRadius={MEMBER_RADIUS}
              style={{ width: '100%', height: '100%' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: MEMBER_RADIUS,
                }}
              />
            </Highlight>
          </div>
        </AbsoluteFill>
      ))}

      {/* 指导教师「冯敏」卡 · 蓝色温和脉冲 */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: ADVISOR.left,
            top: ADVISOR.top,
            width: ADVISOR.width,
            height: ADVISOR.height,
          }}
        >
          <Highlight
            color={COLORS.primary}
            startFrame={480}
            pulsePeriod={40}
            pulseCount={2}
            retainAfter
            maxGlowSize={36}
            maxSpread={3}
            display="block"
            borderRadius={ADVISOR.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: ADVISOR.radius,
              }}
            />
          </Highlight>
        </div>
      </AbsoluteFill>

      {/* 学校署名上 Sweep 扫过（集体感） */}
      <Sweep
        direction="ltr"
        startFrame={620}
        durationFrames={100}
        color="#FFFFFF"
        intensity={0.32}
        beamWidthPercent={30}
      />

      {/* Vision 大字 slogan · ORANGE 3 脉冲 + 保留 */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: VISION.left,
            top: VISION.top,
            width: VISION.width,
            height: VISION.height,
          }}
        >
          <Highlight
            color={COLORS.accent}
            startFrame={760}
            pulsePeriod={50}
            pulseCount={3}
            retainAfter
            maxGlowSize={72}
            maxSpread={8}
            display="block"
            borderRadius={VISION.radius}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: VISION.radius,
              }}
            />
          </Highlight>
        </div>
      </AbsoluteFill>
    </SceneTransition>
  );
};
