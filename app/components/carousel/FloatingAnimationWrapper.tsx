import { ANIMATION_DURATIONS } from '../../constants'

interface FloatingAnimationWrapperProps {
  isActive: boolean
  children: React.ReactNode
}

export function FloatingAnimationWrapper({ isActive, children }: FloatingAnimationWrapperProps) {
  return (
    <div
      style={{
        animation: isActive
          ? `float ${ANIMATION_DURATIONS.FLOAT_DURATION} ease-in-out infinite`
          : 'none',
      }}
    >
      {children}
    </div>
  )
}
