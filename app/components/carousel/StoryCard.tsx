import { CardTransform } from '../../hooks/useCarousel'
import { FRAME_DIMENSIONS } from '../../constants/spacing'
import { FloatingAnimationWrapper } from './FloatingAnimationWrapper'

interface StoryCardProps {
  index: number
  transform: CardTransform
  children: React.ReactNode
  flattenedImage: string | null
  allImagesReady: boolean
  contentRef?: React.RefObject<HTMLDivElement>
}

export function StoryCard({
  index,
  transform,
  children,
  flattenedImage,
  allImagesReady,
  contentRef,
}: StoryCardProps) {
  return (
    <div
      data-story-container={String(index + 1)}
      style={{
        position: 'absolute',
        display: 'flex',
        transformOrigin: 'center center',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: 'transparent',
        transform: `translateX(${transform.translateX}vw) translateY(${transform.translateY}px) translateZ(0) rotateY(${transform.rotationY}deg) scale(${transform.scale})`,
        zIndex: transform.zIndex,
        pointerEvents: transform.opacity === 1 ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          transform: 'scale(0.3)', // shrink the 1000x1840 card on screen
          transformOrigin: 'top center',
          backgroundColor: 'transparent',
        }}
      >
        <FloatingAnimationWrapper isActive={transform.isCenter}>
          {/* HTML content for rendering - used to generate flattened image */}
          {/* Keep HTML canvas in DOM (hidden when image is shown) for image generation */}
          <div
            ref={contentRef}
            style={{
              position: 'relative',
              width: `${FRAME_DIMENSIONS.WIDTH}px`,
              height: `${FRAME_DIMENSIONS.HEIGHT}px`,
              background: '#fff',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              overflow: 'visible',
              display: allImagesReady ? 'none' : 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: transform.opacity,
              filter: `blur(${transform.blur})`,
              transition: 'opacity 0.6s ease, filter 0.6s ease',
            }}
          >
            {children}
          </div>

          {/* Display rendered image once generated - in same animated container */}
          {flattenedImage && allImagesReady && (
            <img
              src={flattenedImage}
              alt={`FaceCard Story${index + 1} Export`}
              style={{
                width: `${FRAME_DIMENSIONS.WIDTH}px`,
                height: `${FRAME_DIMENSIONS.HEIGHT}px`,
                objectFit: 'contain',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              }}
            />
          )}
        </FloatingAnimationWrapper>
      </div>
    </div>
  )
}
