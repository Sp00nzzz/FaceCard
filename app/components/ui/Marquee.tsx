import { COLORS, TYPOGRAPHY, ANIMATION_DURATIONS } from '../../constants'

interface MarqueeProps {
  text: string
  emoji?: string
  speed?: string
  fontWeight?: number
}

export function Marquee({
  text,
  emoji = '★',
  speed = ANIMATION_DURATIONS.MARQUEE_DURATION,
  fontWeight = 600,
}: MarqueeProps) {
  return (
    <>
      {/* Marquee Animation Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .marquee-text {
            display: inline-block;
            animation: marquee ${speed} linear infinite;
          }
        `
      }} />

      {/* Marquee container */}
      <div
        style={{
          width: '100vw',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginLeft: '-20px',
          marginRight: '-20px',
          paddingTop: '4px',
          paddingBottom: '4px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="marquee-text"
          style={{
            fontSize: TYPOGRAPHY.MARQUEE_SIZE,
            fontWeight,
            color: '#000000',
            display: 'inline-flex',
            alignItems: 'center',
            lineHeight: 1,
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap' }}>
              {text} <span style={{ color: COLORS.ACCENT_PINK }}>{emoji}</span>{' '}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
