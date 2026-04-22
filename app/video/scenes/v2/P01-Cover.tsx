import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { KenBurns } from '../../components/KenBurns';
import { SceneTransition } from '../../components/SceneTransition';
import { Sweep } from '../../components/Sweep';
import { COLORS } from '../../constants';

/**
 * Scene P01 · 封面（15s · 450 帧 · 0:00-0:15）
 *
 * 设计意图：
 *   1. 影院级开幕 · 黑场淡入建立仪式感
 *   2. SVG 作底，自身的标题/副标题/流程 tag 已完整呈现
 *   3. 极慢 KenBurns 推近（1.02 → 1.06）让静图"活着"
 *   4. 在 2-4 秒期间斜扫一束光过标题区域，点睛
 *   5. 右下角补一个竞赛徽章（SVG 中没有，作为视频专属加料）
 *   6. SceneTransition 末端 zoom 淡出，为 P02 让路
 *
 * 时间轴（scene 局部帧）：
 *   0-18     黑场淡出（开幕）
 *   0-450    SVG KenBurns 缓慢推近（全程）
 *   0-450    AmbientBackground（ink 变体 · 低强度 · 兜底）
 *   60-110   对角线 Sweep 扫过标题
 *   180-220  右下角 "4C 2026 · 人工智能应用" 徽章浮入
 *   436-450  SceneTransition 自动 zoom-out 淡出
 */

const FADE_IN_FRAMES = 18;
const SWEEP_START = 60;
const SWEEP_DURATION = 50;
const BADGE_FADE_IN_START = 180;
const BADGE_FADE_IN_END = 220;

export const P01Cover: React.FC = () => {
  const frame = useCurrentFrame();

  // === 开幕黑场淡出（最上层） ===
  const blackFade = interpolate(frame, [0, FADE_IN_FRAMES], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // === 右下角竞赛徽章淡入 ===
  const badgeOpacity = interpolate(
    frame,
    [BADGE_FADE_IN_START, BADGE_FADE_IN_END],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const badgeTy = interpolate(
    frame,
    [BADGE_FADE_IN_START, BADGE_FADE_IN_END],
    [12, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <SceneTransition enter="fade" exit="zoom" enterFrames={16} exitFrames={18}>
      {/* 底层兜底背景 · 深色 + 极弱粒子 */}
      <AmbientBackground
        variant="ink"
        intensity="low"
        accent={COLORS.primary}
        particleCount={10}
        showEcg={false}
      />

      {/* SVG 作主画面 · 极缓慢推近 · 15 秒不察觉但画面活着 */}
      <KenBurns
        src={staticFile('ppt/01_封面.svg')}
        from={{ scale: 1.02, x: 0, y: 0 }}
        to={{ scale: 1.06, x: -6, y: 4 }}
        fit="cover"
        easing={(t) => t} // 线性 · 匀速推近
      />

      {/* 对角线扫光 · 点过标题 */}
      <Sweep
        direction="diagonal"
        angle={-18}
        startFrame={SWEEP_START}
        durationFrames={SWEEP_DURATION}
        color="#FFFFFF"
        intensity={0.28}
        beamWidthPercent={18}
        blendMode="screen"
      />

      {/* 右下角竞赛徽章（SVG 中没有，作为视频独有加料） */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 72,
            bottom: 56,
            opacity: badgeOpacity,
            transform: `translateY(${badgeTy}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
          }}
        >
          <div
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: '0.12em',
            }}
          >
            4C · 2026
          </div>
          <div
            style={{
              color: '#FFFFFF',
              opacity: 0.8,
              fontSize: 13,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            中国大学生计算机设计大赛 · 人工智能应用
          </div>
        </div>
      </AbsoluteFill>

      {/* 开幕黑场（最上层 · 最后渲染） */}
      {blackFade > 0 && (
        <AbsoluteFill
          style={{
            background: '#000000',
            opacity: blackFade,
            pointerEvents: 'none',
          }}
        />
      )}
    </SceneTransition>
  );
};
