import { staticFile } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { Highlight } from '../../components/Highlight';
import { KenBurns } from '../../components/KenBurns';
import { SceneTransition } from '../../components/SceneTransition';
import { Sweep } from '../../components/Sweep';
import { COLORS } from '../../constants';

/**
 * Scene P06 · AI 摘要与医生端（30s · 900 帧 · 4:25-4:55）
 *
 * 叙事重点：与 D2 呼应 · 4 功能要点 + 端到端分享流程（患者 → QR → 医生）
 *
 * 时间轴（scene 局部帧）：
 *   0-16       SceneTransition 入场（fade）
 *   0-900      Ambient + SVG KenBurns
 *
 *   40-120     左侧 phone 截图区 Sweep（AI 摘要预览）
 *   150-240    Feat 1 "AI 自动生成结构化摘要" ORANGE 3 次（hero）
 *   240-330    Feat 2 "检查结果趋势分析" 蓝色
 *   330-420    Feat 3 "二维码分享给医生" 次蓝
 *   420-510    Feat 4  蓝色
 *
 *   540-620    Share flow 患者 pill 蓝色脉冲
 *   570-700    QR 卡 橙色 3 次脉冲（scanning-ready 感）
 *   620-720    医生 pill 蓝色脉冲
 *
 *   760-860    右下角 "30 秒读完" 区域 diagonal Sweep 收尾
 *   880-900    SceneTransition 退出 (push-left for D3)
 */

const FEAT_LEFT = 810;
const FEAT_WIDTH = 1035;
const FEAT_HEIGHT = 150;
const FEAT_RADIUS = 18;
const FEAT_TOPS = [142.5, 322.5, 502.5, 682.5];

// Share flow positions (SVG y=555-645)
// patient: SVG (60-190, 555-645) → video (90, 832.5, 195, 135)
// QR: SVG (236-340) → video (354, 832.5, 156, 135)
// doctor: SVG (386-516) → video (579, 832.5, 195, 135)
const SHARE_Y = 832.5;
const SHARE_HEIGHT = 135;
const SHARE_RADIUS = 15;

// Left phone screenshot region (video coords)
const PHONE_AREA = {
  left: 84,
  top: 142.5,
  width: 330,
  height: 560,
};

export const P06SummarySharing: React.FC = () => {
  return (
    <SceneTransition
      enter="fade"
      exit="push-left"
      enterFrames={16}
      exitFrames={18}
    >
      <AmbientBackground
        variant="surface"
        intensity="low"
        accent={COLORS.accent}
        particleCount={14}
        showEcg={false}
        seed={600}
      />

      <KenBurns
        src={staticFile('ppt/06_AI摘要与分享.svg')}
        from={{ scale: 1.0, x: 0, y: 0 }}
        to={{ scale: 1.03, x: 0, y: 0 }}
        fit="cover"
      >
        {/* 左侧 phone 区域 · Sweep */}
        <div
          style={{
            position: 'absolute',
            left: PHONE_AREA.left,
            top: PHONE_AREA.top,
            width: PHONE_AREA.width,
            height: PHONE_AREA.height,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <Sweep
            direction="ttb"
            startFrame={27}
            durationFrames={54}
            color="#FFFFFF"
            intensity={0.36}
            beamWidthPercent={40}
          />
        </div>

        {/* 4 feature cards（对齐 Cue 1-4） */}
        {[
          { color: COLORS.accent, startFrame: 70, pulseCount: 3, retain: true },   // Cue 1 f60 · dur=105 · ends f175
          { color: COLORS.primary, startFrame: 180, pulseCount: 2 },               // after Feat 1 · dur=70 · ends f250
          { color: '#2C7DA0', startFrame: 255, pulseCount: 2 },                    // after Feat 2 · dur=70 · ends f325
          { color: COLORS.primary, startFrame: 330, pulseCount: 2 },               // after Feat 3 · dur=70 · ends f400
        ].map((feat, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: FEAT_LEFT,
              top: FEAT_TOPS[i],
              width: FEAT_WIDTH,
              height: FEAT_HEIGHT,
              pointerEvents: 'none',
            }}
          >
            <Highlight
              color={feat.color}
              startFrame={feat.startFrame}
              pulsePeriod={45}
              pulseCount={feat.pulseCount}
              retainAfter={feat.retain}
              maxGlowSize={44}
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
        ))}

        {/* 底部 Share Flow · 患者 / QR / 医生（Cue 4 f366 "一张码的距离"） */}
        {/* 患者 pill */}
        <div
          style={{
            position: 'absolute',
            left: 90,
            top: SHARE_Y,
            width: 195,
            height: SHARE_HEIGHT,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            color={COLORS.primary}
            startFrame={375}
            pulsePeriod={35}
            pulseCount={2}
            maxGlowSize={30}
            maxSpread={3}
            display="block"
            borderRadius={SHARE_RADIUS}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: SHARE_RADIUS,
              }}
            />
          </Highlight>
        </div>

        {/* QR card · 核心 · 橙色 3 脉冲 */}
        <div
          style={{
            position: 'absolute',
            left: 354,
            top: SHARE_Y,
            width: 156,
            height: SHARE_HEIGHT,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            color={COLORS.accent}
            startFrame={410}
            pulsePeriod={40}
            pulseCount={3}
            retainAfter
            maxGlowSize={48}
            maxSpread={6}
            display="block"
            borderRadius={SHARE_RADIUS}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: SHARE_RADIUS,
              }}
            />
          </Highlight>
        </div>

        {/* 医生 pill */}
        <div
          style={{
            position: 'absolute',
            left: 579,
            top: SHARE_Y,
            width: 195,
            height: SHARE_HEIGHT,
            pointerEvents: 'none',
          }}
        >
          <Highlight
            color="#2C7DA0"
            startFrame={450}
            pulsePeriod={35}
            pulseCount={2}
            maxGlowSize={30}
            maxSpread={3}
            display="block"
            borderRadius={SHARE_RADIUS}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: SHARE_RADIUS,
              }}
            />
          </Highlight>
        </div>
      </KenBurns>

      {/* 收尾 diagonal Sweep */}
      <Sweep
        direction="diagonal"
        angle={-18}
        startFrame={470}
        durationFrames={67}
        color={COLORS.accent}
        intensity={0.32}
        beamWidthPercent={16}
        blendMode="screen"
      />
    </SceneTransition>
  );
};
