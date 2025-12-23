import { COLORS, SPACING } from '../../constants'

interface NavigationButtonProps {
  direction: 'prev' | 'next'
  onClick: () => void
}

export function NavigationButton({ direction, onClick }: NavigationButtonProps) {
  const isPrev = direction === 'prev'

  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        left: isPrev ? SPACING.FIXED_LEFT : 'auto',
        right: isPrev ? 'auto' : SPACING.FIXED_RIGHT,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: COLORS.NAV_GREY,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 200,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = COLORS.NAV_GREY_HOVER
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = COLORS.NAV_GREY
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={isPrev ? 'M15 18L9 12L15 6' : 'M9 18L15 12L9 6'}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
