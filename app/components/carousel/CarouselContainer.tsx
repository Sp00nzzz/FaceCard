import { CAROUSEL } from '../../constants/spacing'

interface CarouselContainerProps {
  children: React.ReactNode
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

export function CarouselContainer({
  children,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: CarouselContainerProps) {
  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'absolute',
        top: -400,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        height: '100%',
        perspective: CAROUSEL.PERSPECTIVE,
        perspectiveOrigin: 'center center',
        overflow: 'visible',
        backgroundColor: 'transparent',
        zIndex: 10,
        paddingTop: '500px',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  )
}
