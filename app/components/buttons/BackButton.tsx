import { COLORS, TYPOGRAPHY, SPACING } from '../../constants'

interface BackButtonProps {
  onClick: () => void
  label?: string
}

export function BackButton({ onClick, label = '← Back to scanner' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: SPACING.FIXED_TOP,
        left: SPACING.FIXED_LEFT,
        border: 'none',
        background: 'none',
        padding: '8px',
        margin: 0,
        fontSize: TYPOGRAPHY.TINY_SIZE,
        color: COLORS.MEDIUM_GREY,
        cursor: 'pointer',
        textDecoration: 'none',
        zIndex: 100,
        minHeight: SPACING.MIN_TOUCH_SIZE,
        minWidth: SPACING.MIN_TOUCH_SIZE,
        touchAction: 'manipulation',
      }}
    >
      {label}
    </button>
  )
}
