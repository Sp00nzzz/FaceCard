import { COLORS, TYPOGRAPHY, SPACING } from '../../constants'

interface DownloadButtonProps {
  onClick: () => void
}

export function DownloadButton({ onClick }: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      className="download-button"
      style={{
        position: 'fixed',
        top: SPACING.FIXED_TOP,
        right: SPACING.FIXED_RIGHT,
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: TYPOGRAPHY.BOLD,
        fontFamily: TYPOGRAPHY.ARIAL,
        color: COLORS.WHITE,
        background: 'linear-gradient(to bottom, #0066CC 0%, #0088FF 50%, #0066CC 100%)',
        border: '2px solid #004499',
        borderRadius: '8px',
        cursor: 'pointer',
        zIndex: 200,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        minHeight: SPACING.MIN_TOUCH_SIZE,
        touchAction: 'manipulation',
      }}
    >
      DOWNLOAD
    </button>
  )
}
