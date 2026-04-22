import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { PhoneFrame } from '../../components/PhoneFrame';
import { TextReveal } from '../../components/TextReveal';
import { TouchRipple } from '../../components/TouchRipple';
import { COLORS } from '../../constants';
import { HomeView } from '../../../src/components/pure/HomeView';
import {
  SummaryCardView,
  type SummarySection,
} from '../../../src/components/pure/SummaryCardView';

/**
 * Scene D2 · 演示 · AI 摘要生成（60s · 1800 帧 · 3:25-4:25）
 *
 * 全片最关键的"产品魔法时刻" · 展示 AI 把散乱记录变成医生可读的摘要。
 *
 * 流程：
 *   Home → 点击「立即生成」 → Loading(AI 3-5s) → Summary 全貌 → 高亮异常值
 *
 * 时间轴（scene 局部帧）：
 *   0-40       手机从左侧滑入
 *   40-350     Home 屏 · Ken Burns 推向 "立即生成" 按钮
 *   80-320     A1 右侧 "在首页一键生成" 注释
 *   330        TouchRipple 点击 "立即生成"（Home Summary 卡）
 *   350-430    Home 淡出 · Loading 淡入
 *   430-850    Loading 屏（转圈 + "AI 正在分析..." 文字）
 *   500-820    A2 右侧 "AI 3-5 秒 · 结构化处理"
 *   850-950    Loading → Summary 屏 crossfade
 *   950-1680   Summary 屏 · Ken Burns 从顶部缓慢滚到底部（展示全貌）
 *   900-1180   A3 右侧 "主诉 · 现病史 · 用药史 · 关键指标"
 *   1200-1500  A4 右侧 "异常值自动高亮"
 *   1500-1780  A5 右侧 "30 秒读完半年病史"
 *   1780-1800  手机淡出
 */

const PHONE_SCREEN_WIDTH = 408;
const PHONE_SCREEN_HEIGHT = 820;

// Home 中 "立即生成" AI 摘要卡点击位置（滚动到 summary 卡时的中心）
const RIPPLE_GENERATE = { x: PHONE_SCREEN_WIDTH * 0.5, y: PHONE_SCREEN_HEIGHT * 0.48 };
// 分享按钮点击位置（Summary 卡右上"分享给医生"）
const RIPPLE_SHARE = { x: PHONE_SCREEN_WIDTH * 0.78, y: PHONE_SCREEN_HEIGHT * 0.14 };

// === Home V2 数据 · 承接 D1 结尾 · 已有 BP ALERT ===
const CONDITIONS = ['高血压二期'];
const BP_TREND = [132, 130, 126, 134, 130, 128, 135];

// === AI 生成的摘要内容（真实风格，像医生能秒懂的）===
const SUMMARY_DATA = {
  chiefComplaint: '近 7 天晨起血压偏高（最高 145/92 mmHg），偶伴头晕。',
  focusPoints: [
    '晨峰血压显著，建议评估现有缬沙坦用药时间与剂量',
    '用药依从性 100% 仍出现超阈值，提示单药控制不足',
    '头晕集中发生于服药前 1–2 小时内，疑似晨间血压波动所致',
  ],
  symptoms:
    '头晕 3 次，均发生在晨起 1 小时内，持续 10–15 分钟，休息后缓解。无胸闷、心悸伴随。',
  vitalsTrend:
    '近 14 天收缩压均值 138/86 mmHg · 超阈值 4 次 · 晨峰（07:00–09:00）显著。心率稳定 68–78 bpm。',
  medications:
    '缬沙坦 80mg qd（晨 08:00）· 近 30 天依从性 100%，无漏服。',
  lifestyle:
    '晚餐 19:30 固定 · 步行 30 分 × 3 次/周 · 睡眠 22:30–06:30，较规律。',
};

const SUMMARY_SECTIONS: SummarySection[] = [
  'chiefComplaint',
  'focusPoints',
  'symptoms',
  'vitalsTrend',
  'medications',
  'lifestyle',
];

// 每个 section 的出现帧（从 Summary 屏进入后开始累加）
const SECTION_REVEAL_FRAMES: Record<SummarySection, number> = {
  chiefComplaint: 970,
  focusPoints: 1080,
  symptoms: 1200,
  vitalsTrend: 1310,
  medications: 1420,
  lifestyle: 1520,
  reportHighlights: 9999, // 本场景不显示
};

export const D2AiSummary: React.FC = () => {
  const frame = useCurrentFrame();

  // 手机入场 / 退场
  const phoneEnter = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phoneExit = interpolate(frame, [1740, 1800], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phoneTx = -(1 - phoneEnter) * 420; // 从左滑入
  const phoneScale = 0.94 + phoneEnter * 0.06;
  const phoneOpacity = phoneEnter * phoneExit;

  // 三屏 opacity：Home → Loading → Summary
  const homeOpacity = interpolate(frame, [380, 450], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const loadingOpacity =
    interpolate(frame, [380, 450], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) *
    interpolate(frame, [870, 950], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const summaryOpacity = interpolate(frame, [870, 950], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Home 滚动 · 0-380 帧滚向 Summary 卡（约 Home 顶部 ~350px 处）
  const homeScrollY = interpolate(frame, [50, 380], [0, -260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Summary 滚动 · 950 开始从顶部，逐节滚向底部
  const summaryScrollY = interpolate(frame, [950, 1700], [0, -340], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Loading spinner · 每 1.5s 一圈
  const spinAngle = ((frame % 45) / 45) * 360;
  const loadingPulse = 0.85 + 0.15 * Math.sin((frame / 30) * Math.PI);

  // AI 进度条 · 450-860 帧 0→1
  const aiProgress = interpolate(frame, [450, 860], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 逐节浮入集合
  const revealedSet = new Set<SummarySection>();
  SUMMARY_SECTIONS.forEach((k) => {
    if (frame >= SECTION_REVEAL_FRAMES[k]) revealedSet.add(k);
  });

  // 右侧 5 段注释淡入淡出
  const annotationConfigs = [
    {
      range: [90, 160, 340, 410],
      tx: [90, 160],
      label: 'STEP 01',
      title: '在首页\n一键生成',
      sub: '打开 App · 顶部 Summary 卡\n点击「立即生成」',
      color: COLORS.muted,
    },
    {
      range: [480, 560, 820, 890],
      tx: [480, 560],
      label: 'STEP 02',
      title: 'AI 3–5 秒\n结构化处理',
      sub: '多模态时序建模\n通义千问 / 豆包 · 国产大模型',
      color: COLORS.muted,
    },
    {
      range: [970, 1050, 1220, 1290],
      tx: [970, 1050],
      label: 'STEP 03',
      title: '核心主诉 + 建议',
      sub: 'AI 提炼患者当前最值得关注的问题\n给医生的 3 条焦点建议',
      color: COLORS.accent,
    },
    {
      range: [1290, 1370, 1540, 1600],
      tx: [1290, 1370],
      label: 'STEP 04',
      title: '症状 / 体征 / 用药 /\n生活 四栏结构化',
      sub: '零散记录自动分类 + 去重 + 提炼',
      color: COLORS.accent,
    },
    {
      range: [1580, 1660, 1740, 1800],
      tx: [1580, 1660],
      label: 'STEP 05',
      title: '30 秒\n读完半年病史',
      sub: '医生扫码即看 · 零安装\n患者数据完全本地',
      color: COLORS.accent,
    },
  ];

  return (
    <AbsoluteFill>
      <AmbientBackground
        variant="surface"
        intensity="low"
        accent={COLORS.accent}
        particleCount={14}
        showEcg
        seed={780}
      />

      <PhoneFrame
        scale={phoneScale}
        translateX={phoneTx}
        opacity={phoneOpacity}
      >
        {/* Home 屏 · 真实 HomeView */}
        <PhoneContent scrollY={homeScrollY} opacity={homeOpacity}>
          <HomeView
            forceMobile
            name="王先生"
            conditions={CONDITIONS}
            continuousDays={14}
            bpTrend={BP_TREND}
            summaryTeaser={null}
            hasApiKey
            hideFooter
          />
        </PhoneContent>

        {/* Loading 屏 · AI 分析 · 带进度条 */}
        {loadingOpacity > 0.01 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: loadingOpacity,
              background:
                'linear-gradient(135deg, #F6FAFC 0%, #E5EEF3 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
              padding: '0 32px',
              fontFamily:
                '"PingFang SC", "Microsoft YaHei", sans-serif',
            }}
          >
            <svg width={88} height={88} viewBox="0 0 88 88">
              <defs>
                <linearGradient id="spinnerGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} />
                  <stop offset="100%" stopColor={COLORS.accent} />
                </linearGradient>
              </defs>
              <circle
                cx={44}
                cy={44}
                r={32}
                fill="none"
                stroke="#E0ECF0"
                strokeWidth={4}
              />
              <circle
                cx={44}
                cy={44}
                r={32}
                fill="none"
                stroke="url(#spinnerGrad)"
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={`${32 * 2 * Math.PI * 0.3} ${32 * 2 * Math.PI}`}
                transform={`rotate(${spinAngle} 44 44)`}
                style={{ opacity: loadingPulse }}
              />
            </svg>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.primary,
                letterSpacing: '0.08em',
              }}
            >
              AI 正在分析 14 天健康记录
            </div>
            <div
              style={{
                fontSize: 12,
                color: COLORS.muted,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              Analyzing · {Math.floor(aiProgress * 100)}%
            </div>
            {/* 进度条 */}
            <div
              style={{
                width: 240,
                height: 4,
                background: '#E0ECF0',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${aiProgress * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
                  transition: 'none',
                }}
              />
            </div>
            <div
              style={{
                fontSize: 11,
                color: COLORS.muted,
                marginTop: 8,
                textAlign: 'center',
                lineHeight: 1.7,
              }}
            >
              提取主诉 · 关联症状与体征
              <br />
              检测异常 · 生成摘要
            </div>
          </div>
        )}

        {/* Summary 屏 · 真实 SummaryCardView · 分节浮入 */}
        <PhoneContent scrollY={summaryScrollY} opacity={summaryOpacity}>
          <SummaryCardView
            forceMobile
            variant="patient"
            summary={SUMMARY_DATA}
            coverageLabel="生成于今天 09:15 · 覆盖近 14 天"
            revealedSections={revealedSet}
          />
        </PhoneContent>

        {/* 点击"立即生成" · Ripple */}
        <TouchRipple
          x={RIPPLE_GENERATE.x}
          y={RIPPLE_GENERATE.y}
          triggerFrame={360}
          maxRadius={110}
          durationFrames={36}
          color={COLORS.accent}
        />

        {/* 点击"分享给医生" · Ripple */}
        <TouchRipple
          x={RIPPLE_SHARE.x}
          y={RIPPLE_SHARE.y}
          triggerFrame={1680}
          maxRadius={80}
          durationFrames={32}
          color={COLORS.primary}
        />
      </PhoneFrame>

      {/* ============ 右侧滚动 5 段注释 ============ */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        }}
      >
        {annotationConfigs.map((cfg, i) => {
          const opacity = interpolate(frame, cfg.range, [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const tx = interpolate(frame, cfg.tx, [40, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                right: 140,
                top: 400 - i * 2,
                width: 460,
                opacity,
                transform: `translateX(${tx}px)`,
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.3em',
                  color: cfg.color,
                  marginBottom: 14,
                  textTransform: 'uppercase',
                }}
              >
                {cfg.label}
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: COLORS.ink,
                  lineHeight: 1.2,
                  marginBottom: 18,
                  letterSpacing: '-0.02em',
                  whiteSpace: 'pre-line',
                }}
              >
                {cfg.title}
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: COLORS.muted,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-line',
                }}
              >
                {cfg.sub}
              </div>
            </div>
          );
        })}

        {/* 底部小金句 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 80,
            textAlign: 'center',
          }}
        >
          {frame >= 1100 && frame <= 1760 && (
            <TextReveal
              text="30 秒记录 · AI 整理 · 医生秒懂"
              startFrame={1100}
              durationFrames={80}
              fontSize={28}
              fontWeight={500}
              color={COLORS.primary}
              letterSpacing="0.2em"
              style={{ opacity: 0.75 }}
            />
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 与 D1 一致的手机内容滚动容器 */
function PhoneContent({
  scrollY,
  opacity,
  children,
}: {
  scrollY: number;
  opacity: number;
  children: React.ReactNode;
}) {
  if (opacity <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        opacity,
        background: '#F6FAFC',
      }}
    >
      <div
        style={{
          transform: `translateY(${scrollY}px)`,
          padding: '16px 20px 24px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
