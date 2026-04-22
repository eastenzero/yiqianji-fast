/**
 * iPhone 14 Pro 外壳（Pure 展示组件）
 *
 * 用于 Scene 04 ProductDemo 内嵌产品 UI。
 * 真实尺寸：外部 434×902（含边框）· 内部 408×874（屏幕区域）
 * 标注 Dynamic Island · 黑色边框 · 外部 drop shadow
 */
interface PhoneFrameProps {
  children: React.ReactNode;
  /** 整体缩放 · 默认 1 */
  scale?: number;
  /** 额外 Y 偏移（px · 相对画面中心） */
  translateY?: number;
  /** 额外 X 偏移（px · 相对画面中心） */
  translateX?: number;
  /** 整体不透明度 */
  opacity?: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  scale = 1,
  translateY = 0,
  translateX = 0,
  opacity = 1,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 434,
        height: 902,
        transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${scale})`,
        transformOrigin: 'center center',
        background: '#1a1a1a',
        borderRadius: 60,
        padding: 13,
        boxShadow:
          '0 48px 120px rgba(11, 52, 70, 0.28), 0 12px 36px rgba(11, 52, 70, 0.12)',
        opacity,
      }}
    >
      {/* 屏幕内容容器 */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 48,
          background: '#F6FAFC',
          overflow: 'hidden',
          position: 'relative',
          fontFamily: '"Noto Sans SC", "Lexend", system-ui, sans-serif',
        }}
      >
        {/* Dynamic Island（顶部动态岛） */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 34,
            background: '#0a0a0a',
            borderRadius: 18,
            zIndex: 20,
          }}
        />

        {/* 真实内容层（从 notch 下方开始 · 子屏可 absolute inset:0） */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
