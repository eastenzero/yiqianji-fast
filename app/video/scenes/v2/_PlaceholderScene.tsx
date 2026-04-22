import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../../constants';

/**
 * V2 占位场景 · 开发期过渡使用
 *
 * 所有 12 段 scene 首先以这个占位渲染 · 在 Phase 2/3 被逐个替换为真实内容
 * 画面提示：段名 / 段类型（PPT or DEMO）/ 当前秒数 / 总时长 / 进度条
 * 目的：
 *   1. 让 Studio 能立即跑起来，快速预览整片时间轴
 *   2. 校准时间轴设计合不合理（某段是否太长/太短）
 *   3. 便于后续 diff「占位 → 真实」的工作量
 */
export const PlaceholderScene: React.FC<{
  /** 段名，如 "P01 · 封面" / "D1 · 记录流程" */
  name: string;
  /** 段类型 · 影响配色 */
  type?: 'ppt' | 'demo';
  /** 附加描述（可选） */
  subtitle?: string;
  /** 旁注（可选 · 显示核心动作提示） */
  hint?: string;
}> = ({ name, type = 'ppt', subtitle, hint }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const currentSec = (frame / fps).toFixed(1);
  const totalSec = (durationInFrames / fps).toFixed(1);
  const progress = frame / Math.max(1, durationInFrames);

  const bg = type === 'demo' ? COLORS.accent : COLORS.primary;
  const typeBadge = type === 'demo' ? 'DEMO · 实机演示' : 'PPT · 画面叙事';

  // 入场淡入 15 帧
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 呼吸脉冲点 · 2s 周期
  const pulsePeriod = fps * 2;
  const pulseT = (frame % pulsePeriod) / pulsePeriod;
  const pulseScale = 1 + 0.15 * Math.sin(pulseT * Math.PI * 2);
  const pulseOpacity = 0.5 + 0.4 * Math.sin(pulseT * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${bg} 0%, ${COLORS.ink} 100%)`,
        color: '#FFFFFF',
        fontFamily: '"PingFang SC", "Microsoft YaHei", Lexend, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      {/* 段类型徽章 */}
      <div
        style={{
          fontSize: 22,
          letterSpacing: '0.3em',
          opacity: 0.7,
          textTransform: 'uppercase',
          marginBottom: 24,
          fontWeight: 500,
        }}
      >
        {typeBadge}
      </div>

      {/* 段名主标题 */}
      <div
        style={{
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginBottom: 32,
        }}
      >
        {name}
      </div>

      {/* 副标题 */}
      {subtitle && (
        <div style={{ fontSize: 40, fontWeight: 400, opacity: 0.9, marginBottom: 16 }}>
          {subtitle}
        </div>
      )}

      {/* 核心动作提示 */}
      {hint && (
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            opacity: 0.6,
            maxWidth: 960,
            textAlign: 'center',
            lineHeight: 1.6,
            marginTop: 8,
            padding: '0 40px',
          }}
        >
          {hint}
        </div>
      )}

      {/* 底部时间轴信息条 */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: 0.75,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 20,
            fontFamily: 'Lexend, system-ui, sans-serif',
            letterSpacing: '0.05em',
          }}
        >
          <span>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#F7A072',
                marginRight: 10,
                verticalAlign: 'middle',
                transform: `scale(${pulseScale})`,
                opacity: pulseOpacity,
              }}
            />
            PLACEHOLDER · 待 Phase 2/3 替换
          </span>
          <span>
            {currentSec}s / {totalSec}s
          </span>
        </div>
        <div
          style={{
            height: 3,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: '#F7A072',
              transition: 'none',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
