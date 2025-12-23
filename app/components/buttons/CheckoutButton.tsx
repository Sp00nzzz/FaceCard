import { COLORS, TYPOGRAPHY, SPACING } from '../../constants'

interface CheckoutButtonProps {
  onClick: () => void
}

export function CheckoutButton({ onClick }: CheckoutButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: SPACING.FIXED_TOP,
        right: SPACING.FIXED_RIGHT,
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: TYPOGRAPHY.BOLD,
        fontFamily: TYPOGRAPHY.ARIAL,
        color: COLORS.WHITE,
        background: `linear-gradient(to bottom, ${COLORS.CHECKOUT_RED} 0%, #FF0000 50%, ${COLORS.CHECKOUT_RED} 100%)`,
        border: `2px solid ${COLORS.DARK_RED}`,
        borderRadius: '8px',
        cursor: 'pointer',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        minHeight: SPACING.MIN_TOUCH_SIZE,
        touchAction: 'manipulation',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `linear-gradient(to bottom, ${COLORS.CHECKOUT_RED_HOVER} 0%, #FF1111 50%, ${COLORS.CHECKOUT_RED_HOVER} 100%)`
        e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `linear-gradient(to bottom, ${COLORS.CHECKOUT_RED} 0%, #FF0000 50%, ${COLORS.CHECKOUT_RED} 100%)`
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(1px)'
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(0,0,0,0.2)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)'
      }}
    >
      CHECKOUT
    </button>
  )
}
