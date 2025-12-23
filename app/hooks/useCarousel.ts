import { useState, useRef } from 'react'
import { CAROUSEL } from '../constants/spacing'

export interface CardTransform {
  translateX: number
  translateY: number
  rotationY: number
  scale: number
  opacity: number
  blur: string
  zIndex: number
  isCenter: boolean
}

export function useCarousel(totalCards: number) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const handleNext = () => {
    if (isTransitioning) return
    console.log('[Carousel] handleNext - Starting transition')
    setIsTransitioning(true)
    setActiveIndex((prev) => {
      const next = prev === totalCards - 1 ? 0 : prev + 1
      console.log('[Carousel] Moving from', prev, 'to', next)
      return next
    })
    setTimeout(() => {
      console.log('[Carousel] Transition complete')
      setIsTransitioning(false)
    }, 600)
  }

  const handlePrevious = () => {
    if (isTransitioning) return
    console.log('[Carousel] handlePrevious - Starting transition')
    setIsTransitioning(true)
    setActiveIndex((prev) => {
      const next = prev === 0 ? totalCards - 1 : prev - 1
      console.log('[Carousel] Moving from', prev, 'to', next)
      return next
    })
    setTimeout(() => {
      console.log('[Carousel] Transition complete')
      setIsTransitioning(false)
    }, 600)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current

    if (Math.abs(distance) > CAROUSEL.MIN_SWIPE_DISTANCE) {
      if (distance > 0) {
        // Swipe left - go to next
        handleNext()
      } else {
        // Swipe right - go to previous
        handlePrevious()
      }
    }

    touchStartX.current = 0
    touchEndX.current = 0
  }

  // Calculate card transform based on position relative to active index
  const getCardTransform = (index: number): CardTransform => {
    const offset = index - activeIndex
    const absOffset = Math.abs(offset)

    // Normalize offset for wrapping (e.g., if active is 0 and card is 2, offset should be -1)
    let normalizedOffset = offset
    if (offset > 1) normalizedOffset = offset - totalCards
    if (offset < -1) normalizedOffset = offset + totalCards

    const absNormalizedOffset = Math.abs(normalizedOffset)

    // Position: center card at 0, left at -1, right at +1
    // Using viewport width for responsive spacing
    const translateX = normalizedOffset * CAROUSEL.CARD_SPACING_VW // 50vw spacing between cards

    // Rotation: side cards rotated 30 degrees
    const rotationY = normalizedOffset * CAROUSEL.ROTATION_DEGREES

    // Scale: front card 1.0, side cards 0.8
    const scale = absNormalizedOffset === 0 ? CAROUSEL.ACTIVE_SCALE : CAROUSEL.INACTIVE_SCALE

    // Opacity: front card 1.0, side cards 0.5
    const opacity = absNormalizedOffset === 0 ? CAROUSEL.ACTIVE_OPACITY : CAROUSEL.INACTIVE_OPACITY

    // Blur: side cards get subtle blur for depth
    const blur = absNormalizedOffset === 0 ? '0px' : CAROUSEL.BLUR_AMOUNT

    // Z-index: front card on top (higher values to ensure cards are above other elements)
    const zIndex = absNormalizedOffset === 0 ? 20 : 15 - absNormalizedOffset

    // Vertical position: center card moved down by 50px
    const translateY = absNormalizedOffset === 0 ? CAROUSEL.VERTICAL_OFFSET : 0

    // Check if this is the center card
    const isCenter = absNormalizedOffset === 0

    return {
      translateX,
      translateY,
      rotationY,
      scale,
      opacity,
      blur,
      zIndex,
      isCenter,
    }
  }

  return {
    activeIndex,
    isTransitioning,
    handleNext,
    handlePrevious,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getCardTransform,
  }
}
