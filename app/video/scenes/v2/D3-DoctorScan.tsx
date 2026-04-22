import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { AmbientBackground } from '../../components/AmbientBackground';
import { Highlight } from '../../components/Highlight';
import { PhoneFrame } from '../../components/PhoneFrame';
import { TextReveal } from '../../components/TextReveal';
import { COLORS } from '../../constants';
import { SummaryCardView } from '../../../src/components/pure/SummaryCardView';

/**
 * Scene D3 · 演示 · 医生端扫码（40s · 1200 帧 · 4:55-5:35）
 *
 * 与 D1/D2 的"患者侧"对应 · 展示医生端"扫码即看 · 零安装"的核心卖点。
 *
 * 画面结构（split screen）：
 *   左侧：患者手机（显示 Summary）+ 从手机发出的 QR 码浮起
 *   右侧：医生端浏览器 mockup（React 构造的 browser chrome + 摘要卡）
 *
 * 时间轴（scene 局部帧）：
 *   0-30       ambient + 手机从左进入（显示 Summary）
 *   30-300     手机 Ken Burns 稳定播放 Summary
 *   180-400    QR 码从手机"弹出"（scale 0→1 + y 位移）· 右侧占位
 *   400-600    扫描线从 QR 顶部扫到底部
 *   600-700    QR 成功闪烁（绿色快闪）
 *   680-1000   医生端浏览器从右滑入 · 显示摘要卡
 *   850-1000   "零安装" "30 秒读完" 大字浮入
 *   1000-1150  整体保持 · Highlight 扫一下关键异常值
 *   1150-1200  退出
 */

const PHONE_SCREEN_WIDTH = 408;
const PHONE_SCREEN_HEIGHT = 818;

// QR 码伪造位置（video 坐标，在手机右边）
const QR = {
  size: 260,
  left: 960 - 130, // 画面中上方中心
  top: 180,
};

// 医生端浏览器 mockup 位置
const DOCTOR_BROWSER = {
  left: 1120,
  top: 110,
  width: 700,
  height: 860,
};

// === 共用摘要数据 · 与 D2 保持一致（承接剧情）===
const PATIENT_SUMMARY = {
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

export const D3DoctorScan: React.FC = () => {
  const frame = useCurrentFrame();

  // 手机入场
  const phoneEnter = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phoneTx = -100 - (1 - phoneEnter) * 300;
  const phoneScale = 0.7 + phoneEnter * 0.08;
  const phoneOpacity = phoneEnter * interpolate(
    frame,
    [1150, 1200],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // QR 出现（180-280）+ 保持 + 收尾
  const qrOpacity = interpolate(frame, [180, 280, 1100, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const qrScale = interpolate(frame, [180, 320], [0.6, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 扫描线（400-600 从顶到底）
  const scanProgress = interpolate(frame, [400, 600], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scanVisible = frame >= 400 && frame <= 610;

  // QR 成功闪烁（600-700）
  const successFlash = interpolate(
    frame,
    [600, 630, 680, 720],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // 医生端浏览器入场（680-860）
  const doctorEnter = interpolate(frame, [680, 860], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const doctorTx = (1 - doctorEnter) * 440;
  const doctorOpacity =
    doctorEnter *
    interpolate(frame, [1150, 1200], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  // "医生扫码即看" 标语 (500-1100)
  const sloganOpacity = interpolate(
    frame,
    [500, 600, 1080, 1150],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill>
      <AmbientBackground
        variant="surface"
        intensity="medium"
        accent={COLORS.primary}
        particleCount={20}
        showEcg
        seed={1200}
      />

      {/* 左侧：患者手机显示 Summary（真实 SummaryCardView · patient 视角） */}
      <PhoneFrame
        scale={phoneScale}
        translateX={phoneTx}
        opacity={phoneOpacity}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            background: '#F6FAFC',
          }}
        >
          <div
            style={{
              transform: `translateY(${interpolate(
                frame,
                [0, 1100],
                [0, -200],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              )}px)`,
              padding: '16px 20px 24px',
            }}
          >
            <SummaryCardView
              forceMobile
              variant="patient"
              summary={PATIENT_SUMMARY}
              coverageLabel="今天 09:15 · 近 14 天"
            />
          </div>
        </div>
      </PhoneFrame>

      {/* 中间：QR 码 · 从"手机飞出"的感觉（用 scale + 位置完成） */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: QR.left,
            top: QR.top,
            width: QR.size,
            height: QR.size,
            opacity: qrOpacity,
            transform: `scale(${qrScale})`,
            transformOrigin: 'center center',
          }}
        >
          <Highlight
            color={successFlash > 0.1 ? '#386A20' : COLORS.accent}
            startFrame={200}
            pulsePeriod={50}
            pulseCount={2}
            retainAfter
            maxGlowSize={56}
            maxSpread={6}
            display="block"
            borderRadius={24}
            style={{ width: '100%', height: '100%' }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#FFFFFF',
                borderRadius: 24,
                padding: 18,
                boxShadow: '0 20px 60px rgba(11,52,70,0.25)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 伪 QR 码 · 8x8 的随机黑点阵 + 三个角 finder */}
              <FakeQr />

              {/* 扫描线 */}
              {scanVisible && (
                <div
                  style={{
                    position: 'absolute',
                    left: 18,
                    right: 18,
                    top: 18 + scanProgress * (QR.size - 36),
                    height: 3,
                    background:
                      'linear-gradient(90deg, transparent 0%, #BA1A1A 50%, transparent 100%)',
                    boxShadow: '0 0 20px #BA1A1A',
                    opacity: successFlash > 0.1 ? 1 - successFlash : 1,
                  }}
                />
              )}

              {/* 成功绿色覆盖 */}
              {successFlash > 0.05 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 18,
                    background: '#386A20',
                    borderRadius: 12,
                    opacity: successFlash * 0.3,
                  }}
                />
              )}
            </div>
          </Highlight>

          {/* QR 下方小标签 */}
          <div
            style={{
              position: 'absolute',
              top: QR.size + 18,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 600,
              color: COLORS.ink,
              fontFamily: '"PingFang SC", sans-serif',
              letterSpacing: '0.15em',
            }}
          >
            {successFlash > 0.5 ? '✓ 已扫描' : '加密链接 · 有效期可控'}
          </div>
        </div>
      </AbsoluteFill>

      {/* 右侧：医生端浏览器 mockup */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: DOCTOR_BROWSER.left,
            top: DOCTOR_BROWSER.top,
            width: DOCTOR_BROWSER.width,
            height: DOCTOR_BROWSER.height,
            opacity: doctorOpacity,
            transform: `translateX(${doctorTx}px)`,
            borderRadius: 20,
            background: '#FFFFFF',
            boxShadow: '0 30px 80px rgba(11,52,70,0.22)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '"PingFang SC", sans-serif',
          }}
        >
          {/* 浏览器 chrome · 仿 Safari */}
          <div
            style={{
              height: 56,
              background: '#F6FAFC',
              borderBottom: '1px solid #E0ECF0',
              display: 'flex',
              alignItems: 'center',
              padding: '0 18px',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              {['#FF5F56', '#FFBD2E', '#27C93F'].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: c,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                background: '#FFFFFF',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                color: COLORS.muted,
                fontFamily: 'Consolas, monospace',
                border: '1px solid #E0ECF0',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ color: '#386A20' }}>🔒</span>
              yiqianji.app/s/a4f9c2... (有效期 24h)
            </div>
          </div>

          {/* 浏览器内容 · 真实 SummaryCardView（doctor 变体）· 与 D2 共用数据保持剧情连贯 */}
          <div
            style={{
              padding: 32,
              flex: 1,
              overflow: 'hidden',
              background: '#F6FAFC',
            }}
          >
            <SummaryCardView
              variant="doctor"
              summary={PATIENT_SUMMARY}
              patientName="王先生"
              coverageLabel="覆盖近 14 天"
              idTail="a4f9c2e8"
            />
          </div>
        </div>
      </AbsoluteFill>

      {/* 底部大字 slogan */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 60,
            textAlign: 'center',
            opacity: sloganOpacity,
            fontFamily: '"PingFang SC", sans-serif',
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: COLORS.accent,
              fontWeight: 600,
              letterSpacing: '0.3em',
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            Doctor Side · Zero Install
          </div>
          {frame >= 600 && (
            <TextReveal
              text="医生扫码即看 · 30 秒读完半年病史"
              startFrame={600}
              durationFrames={70}
              fontSize={44}
              fontWeight={700}
              color={COLORS.ink}
              letterSpacing="0.05em"
            />
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 伪 QR 码 · 三角 finder + 随机黑白格 */
const FakeQr: React.FC = () => {
  // 稳定伪随机：避免每帧重新生成格子
  const cells = Array.from({ length: 21 * 21 }).map((_, i) => {
    const x = i % 21;
    const y = Math.floor(i / 21);
    // 三角 finder（左上、右上、左下）· 固定 7x7 模式
    const inFinder =
      (x < 7 && y < 7) ||
      (x > 13 && y < 7) ||
      (x < 7 && y > 13);
    if (inFinder) {
      const edge =
        x === 0 ||
        y === 0 ||
        x === 6 ||
        y === 6 ||
        (x > 13 && (x === 14 || x === 20)) ||
        (y > 13 && (y === 14 || y === 20));
      const innerCenter =
        (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
        (x >= 16 && x <= 18 && y >= 2 && y <= 4) ||
        (x >= 2 && x <= 4 && y >= 16 && y <= 18);
      return edge || innerCenter ? 1 : 0;
    }
    // 内部随机
    const h = Math.sin(x * 127 + y * 311 + 1.3) * 43758;
    const frac = h - Math.floor(h);
    return frac > 0.5 ? 1 : 0;
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 18,
        display: 'grid',
        gridTemplateColumns: 'repeat(21, 1fr)',
        gridTemplateRows: 'repeat(21, 1fr)',
        gap: 1,
      }}
    >
      {cells.map((v, i) => (
        <div
          key={i}
          style={{
            background: v ? '#181C1E' : 'transparent',
          }}
        />
      ))}
    </div>
  );
};
