import { TYPOGRAPHY, COLORS } from '../../constants'

interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message = 'Analyzing your face card...' }: LoadingSpinnerProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        borderRadius: '18px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div
          style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            animation: 'spin 1.2s linear infinite',
          }}
        >
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = (index * 30) - 90 // Start from top, 30 degrees per bar
            const barLength = 7
            const barWidth = 3
            const radius = 22

            // Calculate opacity with smooth exponential decay
            const maxOpacity = 0.95
            const minOpacity = 0.12
            const fadeLength = 7.5

            let fadePosition = index
            let normalizedPos = fadePosition / fadeLength
            let opacity = maxOpacity * Math.pow(minOpacity / maxOpacity, normalizedPos)

            if (fadePosition > fadeLength) {
              const wrapPos = (fadePosition - fadeLength) / (12 - fadeLength)
              opacity = minOpacity + (maxOpacity - minOpacity) * (1 - wrapPos * 0.3)
            }

            opacity = Math.max(minOpacity, Math.min(maxOpacity, opacity))

            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${barWidth}px`,
                  height: `${barLength}px`,
                  borderRadius: '2px',
                  backgroundColor: COLORS.WHITE,
                  opacity: opacity,
                  transformOrigin: 'center',
                  transform: `translate(-50%, -50%) translateY(-${radius}px) rotate(${angle}deg)`,
                }}
              />
            )
          })}
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.SMALL_SIZE,
            color: COLORS.WHITE,
            textAlign: 'center',
            fontWeight: '500',
          }}
        >
          {message}
        </div>
      </div>
    </div>
  )
}
