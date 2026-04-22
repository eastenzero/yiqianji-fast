import { AbsoluteFill, staticFile } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { Highlight } from '../../components/Highlight';
import { KenBurns } from '../../components/KenBurns';
import { SceneTransition } from '../../components/SceneTransition';
import { Sweep } from '../../components/Sweep';
import { COLORS } from '../../constants';

/**
 * Scene P05 · 记录与整理（25s · 750 帧 · 3:00-3:25）
 *
 * 叙事重点：与 D1 演示段呼应 · 文本化四要点 · 四种记录模式
 *
 * 时间轴（scene 局部帧）：
 *   0-16       SceneTransition 入场（fade）
 *   0-750      Ambient + SVG KenBurns
 *
 *   40-120     左侧两个手机截图区 ltr Sweep（承接 D1 "实操" 过来）
 *   150-240    Feat 1「日常不适一键补记」蓝色脉冲
 *   240-330    Feat 2「OCR 识别」橙色脉冲（OCR 是亮点）
 *   330-420    Feat 3「用药提醒」次蓝脉冲
 *   420-540    Feat 4「时间轴自动排列」蓝色 3 次脉冲（与 D1 呼应）
 *
 *   580-680    底部 4 个记录模式 tag 快速连续白色脉冲
 *   730-750    SceneTransition 退出
 *
 * Video 坐标（1.5x）：
 *   Feature cards: x=810, width=1035, each 150 tall
 *   Phone area: (105, 142.5) → (405, 787.5), span
 */

const FEAT_LEFT = 810;
const FEAT_WIDTH = 1035;
const FEAT_HEIGHT = 150;
const FEAT_RADIUS = 18;

const FEAT_TOPS = [142.5, 322.5, 502.5, 682.5];

const PHONE_AREA = {
  left: 105,
  top: 142.5,
  width: 600,
  height: 645,
};

// 底部 4 个录入模式 tag (SVG 60-510 y=610-640 → video 90-765 y=915-960)
const MODE_TAG_TOP = 915;
const MODE_TAG_HEIGHT = 45;
const MODE_TAG_RADIUS = 22;
const MODE_TAGS = [
  { left: 90, width: 158, color: COLORS.primary },    // 测体征
  { left: 262, width: 158, color: '#2C7DA0' },         // 记症状
  { left: 435, width: 158, color: COLORS.accent },     // 生活习惯
  { left: 607, width: 158, color: COLORS.primary },    // 记用药
];

export const P05RecordOrganize: React.FC = () => {
  return (
    <SceneTransition enter="fade" exit="zoom" enterFrames={16} exitFrames={18}>
      <AmbientBackground
        variant="surface"
        intensity="low"
        accent={COLORS.primary}
        particleCount={12}
        showEcg={false}
        seed={460}
      />

      <KenBurns
        src={staticFile('ppt/05_记录与整理.svg')}
        from={{ scale: 1.0, x: 0, y: 0 }}
        to={{ scale: 1.03, x: 0, y: 0 }}
        fit="cover"
      />

      {/* 左侧手机区 ltr Sweep（承接 D1 实操） */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: PHONE_AREA.left,
            top: PHONE_AREA.top,
            width: PHONE_AREA.width,
            height: PHONE_AREA.height,
            overflow: 'hidden',
          }}
        >
          <Sweep
            direction="ltr"
            startFrame={40}
            durationFrames={80}
            color="#FFFFFF"
            intensity={0.38}
            beamWidthPercent={30}
          />
        </div>
      </AbsoluteFill>

      {/* 4 个 feature 卡 · 依次脉冲 */}
      {[
        { color: COLORS.primary, startFrame: 150, pulseCount: 2 },
        { color: COLORS.accent, startFrame: 240, pulseCount: 2 },       // OCR 橙
        { color: '#2C7DA0', startFrame: 330, pulseCount: 2 },
        { color: COLORS.primary, startFrame: 420, pulseCount: 3, retain: true }, // 时间轴 3 次
      ].map((feat, i) => (
        <AbsoluteFill key={i} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: FEAT_LEFT,
              top: FEAT_TOPS[i],
              width: FEAT_WIDTH,
              height: FEAT_HEIGHT,
            }}
          >
            <Highlight
              color={feat.color}
              startFrame={feat.startFrame}
              pulsePeriod={45}
              pulseCount={feat.pulseCount}
              retainAfter={feat.retain}
              maxGlowSize={42}
              maxSpread={4}
              display="block"
              borderRadius={FEAT_RADIUS}
              style={{ width: '100%', height: '100%' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: FEAT_RADIUS,
                }}
              />
            </Highlight>
          </div>
        </AbsoluteFill>
      ))}

      {/* 底部 4 个录入模式 tag 快速连续脉冲（15 帧间隔） */}
      {MODE_TAGS.map((tag, i) => (
        <AbsoluteFill key={`mode-${i}`} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: tag.left,
              top: MODE_TAG_TOP,
              width: tag.width,
              height: MODE_TAG_HEIGHT,
            }}
          >
            <Highlight
              color={tag.color}
              startFrame={580 + i * 30}
              pulsePeriod={28}
              pulseCount={2}
              maxGlowSize={26}
              maxSpread={2}
              display="block"
              borderRadius={MODE_TAG_RADIUS}
              style={{ width: '100%', height: '100%' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: MODE_TAG_RADIUS,
                }}
              />
            </Highlight>
          </div>
        </AbsoluteFill>
      ))}
    </SceneTransition>
  );
};
