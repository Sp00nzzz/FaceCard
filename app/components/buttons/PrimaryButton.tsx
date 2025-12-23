import { COLORS, TYPOGRAPHY, SPACING } from '../../constants'

interface PrimaryButtonProps {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  loading?: boolean
}

export function PrimaryButton({ onClick, disabled = false, children, loading = false }: PrimaryButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        padding: `${SPACING.BUTTON_PADDING_Y} ${SPACING.BUTTON_PADDING_X}`,
        fontSize: TYPOGRAPHY.BODY_SIZE,
        fontWeight: TYPOGRAPHY.LIGHT,
        backgroundColor: isDisabled ? COLORS.DISABLED_GREY : COLORS.PRIMARY_BLUE,
        color: COLORS.WHITE,
        border: 'none',
        borderRadius: '980px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        boxShadow: isDisabled
          ? '0 2px 8px rgba(0, 0, 0, 0.1)'
          : `0 2px 8px rgba(0, 113, 227, 0.3)`,
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        letterSpacing: TYPOGRAPHY.APPLE_SPACING,
        minWidth: SPACING.MAX_BUTTON_WIDTH,
        minHeight: SPACING.MIN_TOUCH_SIZE,
        opacity: isDisabled ? 0.6 : 1,
        touchAction: 'manipulation',
      }}
      onMouseOver={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = COLORS.PRIMARY_BLUE_HOVER
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 113, 227, 0.4)'
        }
      }}
      onMouseOut={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = COLORS.PRIMARY_BLUE
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 113, 227, 0.3)'
        }
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 113, 227, 0.3)'
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 113, 227, 0.4)'
        }
      }}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
