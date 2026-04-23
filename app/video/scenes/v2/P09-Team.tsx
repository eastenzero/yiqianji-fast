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
 * Video 坐标（1.5x · V7 调整后）：
 *   Advisor（独占最上方）: x=504, y=195, width=912, height=142.5（SVG 336-944, 130-225）
 *   Row 1: y=375-525（SVG 250-350 · transform +120）
 *     m1: (84, 375, 555, 150)
 *     m2: (675, 375, 555, 150)
 *     m3: (1266, 375, 555, 150)
 *   Row 2: y=555-705（SVG 370-470）
 *     m4: (84, 555, 555, 150)
 *     m5: (675, 555, 555, 150)
 *     m6: (1266, 555, 555, 150)
 *   Vision pill: (360, 765, 1200, 120)
 */

const MEMBER_WIDTH = 555;
const MEMBER_HEIGHT = 150;
const MEMBER_RADIUS = 18;

const MEMBERS = [
  // Row 1 · y=375 · A2 · 1050→840 · 0.8x
  { left: 84, top: 375, color: COLORS.primary, startFrame: 48 },
  { left: 675, top: 375, color: '#2C7DA0', startFrame: 96 },
  { left: 1266, top: 375, color: COLORS.accent, startFrame: 144 },
  // Row 2 · y=555
  { left: 84, top: 555, color: COLORS.primary, startFrame: 192 },
  { left: 675, top: 555, color: '#2C7DA0', startFrame: 240 },
  { left: 1266, top: 555, color: COLORS.accent, startFrame: 288 },
];

// Advisor 独占最上方（V7 · 放大 · 视觉焦点）· 尺寸 912×142.5
const ADVISOR = {
  left: 504,
  top: 195,
  width: 912,
  height: 142.5,
  radius: 36,
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

      {/* 指导教师「冯敏」卡 · 橙色温和脉冲（放大后的视觉焦点 · V7 方案 C） */}
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
            color={COLORS.accent}
            startFrame={384}
            pulsePeriod={45}
            pulseCount={2}
            retainAfter
            maxGlowSize={54}
            maxSpread={6}
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

      {/* 学校署名上 Sweep 扫过（集体感 · A2 0.8x） */}
      <Sweep
        direction="ltr"
        startFrame={496}
        durationFrames={80}
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
            startFrame={608}
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
