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
          width: 'calc(100% + 40px)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginBottom: '-25px',
          marginLeft: '-20px',
          marginRight: '-20px',
        }}
      >
        <div
          className="marquee-text"
          style={{
            fontSize: TYPOGRAPHY.MARQUEE_SIZE,
            fontWeight,
            color: '#000000',
            display: 'inline-flex',
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
