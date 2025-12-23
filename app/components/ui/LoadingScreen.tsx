import { COLORS, TYPOGRAPHY } from '../../constants'

interface LoadingScreenProps {
  progress: number
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.WHITE,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        gap: '24px',
      }}
    >
      <div
        style={{
          fontSize: TYPOGRAPHY.HEADING_SIZE,
          fontWeight: TYPOGRAPHY.MEDIUM,
          color: COLORS.DARK_GREY,
          marginBottom: '16px',
        }}
      >
        Preparing your stories...
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 'clamp(200px, 60vw, 300px)',
          height: '8px',
          backgroundColor: '#e5e5e5',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: COLORS.PRIMARY_BLUE,
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      <div
        style={{
          fontSize: TYPOGRAPHY.SMALL_SIZE,
          color: COLORS.LIGHT_GREY,
        }}
      >
        {progress}% complete
      </div>
    </div>
  )
}
