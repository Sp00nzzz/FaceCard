import { COLORS, TYPOGRAPHY, SPACING } from '../../constants'
import { formatPrice } from '../../utils/formatters'

interface FloatingBalanceIndicatorProps {
  balance: number
  show: boolean
}

export function FloatingBalanceIndicator({ balance, show }: FloatingBalanceIndicatorProps) {
  if (!show) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes popIn {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .floating-balance-pop {
            animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        `
      }} />

      <div
        className="floating-balance-pop"
        style={{
          position: 'fixed',
          top: SPACING.FIXED_TOP,
          right: 'clamp(12px, 3vw, 30px)',
          backgroundColor: COLORS.WHITE,
          borderRadius: '20px',
          padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 99,
          whiteSpace: 'nowrap',
          maxWidth: 'calc(100vw - 24px)',
        }}
      >
        <div
          style={{
            fontSize: TYPOGRAPHY.SMALL_SIZE,
            fontWeight: TYPOGRAPHY.LIGHT,
            color: '#000000',
            textAlign: 'center',
          }}
        >
          Total Value: ${formatPrice(balance)}
        </div>
      </div>
    </>
  )
}
