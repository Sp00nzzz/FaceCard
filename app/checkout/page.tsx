'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '../components/buttons/BackButton'
import { DownloadButton } from '../components/buttons/DownloadButton'
import { NavigationButton } from '../components/buttons/NavigationButton'
import { CarouselContainer } from '../components/carousel/CarouselContainer'
import { StoryCard } from '../components/carousel/StoryCard'
import { Story1Content } from '../components/stories/Story1Content'
import { Story2Content } from '../components/stories/Story2Content'
import { Story3Content } from '../components/stories/Story3Content'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { useCarousel } from '../hooks/useCarousel'
import { useImageGeneration } from '../hooks/useImageGeneration'
import { SHOP_ITEMS } from '../constants/shopItems'
import { ANIMATIONS, COLORS, FRAME_DIMENSIONS, TYPOGRAPHY } from '../constants'
import { FaceAttribute } from '../types'
import { formatDate, formatTime } from '../utils/formatters'
import { getCapturedImage, getCart, getValuation } from '../utils/sessionStorageManager'

const FALLBACK_VALUATION: FaceAttribute[] = [
  { name: 'Natural Beauty', price: 999999.99 },
  { name: 'Confidence', price: 500000.00 },
  { name: 'Style Points', price: 250000.00 },
  { name: 'Face Card', price: 1000000.00 },
]

export default function CheckoutPage() {
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [valuation, setValuation] = useState<FaceAttribute[]>([])
  const [currentDate, setCurrentDate] = useState<string>('')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [allImagesReady, setAllImagesReady] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const story1Ref = useRef<HTMLDivElement>(null)
  const story2Ref = useRef<HTMLDivElement>(null)
  const story3Ref = useRef<HTMLDivElement>(null)

  const {
    activeIndex,
    isTransitioning,
    handleNext,
    handlePrevious,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getCardTransform,
  } = useCarousel(3)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768)
      }
    }

    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
    return () => window.removeEventListener('resize', updateIsMobile)
  }, [])

  useEffect(() => {
    const storedValuation = getValuation()
    setValuation(storedValuation || FALLBACK_VALUATION)
    const now = new Date()
    setCurrentDate(formatDate(now))
    setCurrentTime(formatTime(now))
  }, [])

  useEffect(() => {
    const storedImage = getCapturedImage()
    setProfileImage(storedImage || '/placeholder-profile.png')

    const storedCart = getCart()
    if (storedCart) {
      setQuantities(storedCart)
    } else {
      setQuantities({
        '1': 1,
        '2': 1,
        '8': 1,
        '9': 1,
      })
    }
  }, [])

  const purchasedItems = useMemo(
    () => SHOP_ITEMS.filter(item => (quantities[item.id] || 0) > 0),
    [quantities]
  )

  const contentHash1 = useMemo(() => {
    const itemsKey = JSON.stringify(quantities)
    const profileKey = profileImage || ''
    return `${itemsKey}-${profileKey}`
  }, [quantities, profileImage])

  const contentHash2 = useMemo(() => {
    const valuationKey = JSON.stringify(valuation)
    const profileKey = profileImage || ''
    return `${valuationKey}-${profileKey}`
  }, [valuation, profileImage])

  const contentHash3 = useMemo(() => {
    const itemsKey = JSON.stringify(quantities)
    const profileKey = profileImage || ''
    return `${itemsKey}-${profileKey}`
  }, [quantities, profileImage])

  const story1Enabled = profileImage !== null && purchasedItems.length > 0
  const story2Enabled = profileImage !== null && valuation.length > 0
  const story3Enabled = profileImage !== null && purchasedItems.length > 0 && !isTransitioning

  const { flattenedImage: story1Image } = useImageGeneration(
    story1Ref,
    {
      purchasedItemsCount: purchasedItems.length,
      storyIndex: 1,
      contentHash: contentHash1,
      generateDelay: 1000,
      enabled: story1Enabled,
    }
  )

  const { flattenedImage: story2Image } = useImageGeneration(
    story2Ref,
    {
      storyIndex: 2,
      contentHash: contentHash2,
      generateDelay: 1500,
      enabled: story2Enabled,
    }
  )

  const { flattenedImage: story3Image } = useImageGeneration(
    story3Ref,
    {
      purchasedItemsCount: purchasedItems.length,
      storyIndex: 3,
      contentHash: contentHash3,
      generateDelay: 3000,
      enabled: story3Enabled && !!story1Image && !!story2Image,
    }
  )

  useEffect(() => {
    let progress = 0
    if (story1Image) progress += 33
    if (story2Image) progress += 33
    if (story3Image) progress += 34
    setLoadingProgress(progress)
    setAllImagesReady(!!(story1Image && story2Image && story3Image))
  }, [story1Image, story2Image, story3Image])

  const showFlattenedImages = allImagesReady && !isMobile

  const downloadAsImage = () => {
    const images = [story1Image, story2Image, story3Image]
    const imageToDownload = images[activeIndex] || null

    if (imageToDownload) {
      const link = document.createElement('a')
      link.download = `facecard-story${activeIndex + 1}-${FRAME_DIMENSIONS.WIDTH}x${FRAME_DIMENSIONS.HEIGHT}.png`
      link.href = imageToDownload
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('Image is still generating. Please wait a moment.')
    }
  }

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: COLORS.WHITE,
        padding: 0,
        margin: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {!allImagesReady && !isMobile && (
        <LoadingScreen progress={loadingProgress} />
      )}

      <BackButton onClick={() => router.push('/shop')} label="← Back to Shop" />

      <DownloadButton onClick={downloadAsImage} />

      <style dangerouslySetInnerHTML={{ __html: ANIMATIONS.FLOAT }} />

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .download-button {
            top: auto !important;
            right: auto !important;
            bottom: calc(clamp(20px, 5vw, 30px) + 30px) !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }

          .checkout-title {
            top: calc(clamp(60px, 8vw, 80px) + 30px) !important;
            transform: translateX(-50%) scale(0.9) !important;
          }

        }

        [data-checkout-content-2] img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: auto;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
      ` }} />

      <h1
        className="checkout-title"
        style={{
          position: 'fixed',
          top: 'clamp(60px, 8vw, 80px)',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: TYPOGRAPHY.TITLE_SIZE,
          fontWeight: TYPOGRAPHY.EXTRA_BOLD,
          color: '#000000',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: TYPOGRAPHY.TITLE_SPACING,
          margin: 0,
          padding: 0,
          fontFamily: TYPOGRAPHY.ARIAL,
          whiteSpace: 'nowrap',
          zIndex: 50,
          pointerEvents: 'none',
          backgroundColor: 'transparent',
          lineHeight: TYPOGRAPHY.TIGHT_LINE_HEIGHT,
          height: 'auto',
        }}
      >
        SHOW THE WORLD YOUR HAUL
      </h1>

      <CarouselContainer
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <StoryCard
          index={0}
          transform={getCardTransform(0)}
          flattenedImage={story1Image}
          showFlattenedImage={showFlattenedImages}
          hideContent={showFlattenedImages}
          contentRef={story1Ref}
        >
          <Story1Content
            profileImage={profileImage}
            items={SHOP_ITEMS}
            quantities={quantities}
          />
        </StoryCard>

        <StoryCard
          index={1}
          transform={getCardTransform(1)}
          flattenedImage={story2Image}
          showFlattenedImage={showFlattenedImages}
          hideContent={showFlattenedImages}
          contentRef={story2Ref}
        >
          <Story2Content
            profileImage={profileImage}
            valuation={valuation}
            currentDate={currentDate}
            currentTime={currentTime}
          />
        </StoryCard>

        <StoryCard
          index={2}
          transform={getCardTransform(2)}
          flattenedImage={story3Image}
          showFlattenedImage={showFlattenedImages}
          hideContent={showFlattenedImages}
          contentRef={story3Ref}
        >
          <Story3Content
            items={SHOP_ITEMS}
            quantities={quantities}
          />
        </StoryCard>
      </CarouselContainer>

      <NavigationButton direction="prev" onClick={handlePrevious} />
      <NavigationButton direction="next" onClick={handleNext} />
    </main>
  )
}
